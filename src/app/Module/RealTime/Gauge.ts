/**
 * Original code from https://github.com/naikus/svg-gauge
 */
export interface GaugeOptions {
	dialRadius?: number;
	dialStartAngle?: number;
	dialEndAngle?: number;
	value?: number;
	max?: number;
	min?: number;
	valueDialClass?: string;
	valueClass?: string;
	valueLabelClass?: string;
	dialClass?: string;
	gaugeClass?: string;
	showValue?: boolean;
	viewBox?: string;
	gaugeColor?: (val: number) => any;
	label?: (val: number) => any;
}

export interface AnimationOptions {
	duration: number;    // In seconds
	start: number;       // The start value
	end: number;       // The end value
	// REQUIRED! The step function that will be passed the value and does something
	step: (value: number, pos: number) => void;
	easing?: (pos: number) => number; // The easing function. Default is easeInOutCubic
}

// EXPERIMENTAL!!
/**
 * Simplistic animation function for animating the gauge. That's all!
 * Options are:
 * {
 *  duration: 1,    // In seconds
 *  start: 0,       // The start value
 *  end: 100,       // The end value
 *  step: function, // REQUIRED! The step function that will be passed the value and does something
 *  easing: function // The easing function. Default is easeInOutCubic
 * }
 */
export class Animation {
	duration = 1;
	currentIteration = 1;
	iterations = 60 * this.duration;
	start = 0;
	end = 0;
	change = 0;
	step: (value: number, pos: number) => void;
	easing: (pos: number) => number;

	constructor(options: AnimationOptions) {
		this.duration = options.duration;
		this.start = options.start || 0;
		this.end = options.end;
		this.change = this.end - this.start;
		this.step = options.step;

		this.easing = options.easing || ((pos: number) => { //easeInOutCubic
			// https://github.com/danro/easing-js/blob/master/easing.js
			if ((pos /= 0.5) < 1) {
				return 0.5 * Math.pow(pos, 3);
			}
			return 0.5 * (Math.pow((pos - 2), 3) + 2);
		});

		// start!
		requestAnimationFrame(this.animate.bind(this));
	}

	animate() {
		const progress = this.currentIteration / this.iterations;
		const value = this.change * this.easing(progress) + this.start;

		// console.log(progress + ", " + value);
		this.step(value, this.currentIteration);
		this.currentIteration += 1;

		if (progress < 1) {
			requestAnimationFrame(this.animate.bind(this));
		}
	}
}

export class Gauge {
	static SVG_NS = 'http://www.w3.org/2000/svg';

	GaugeDefaults = {
		centerX: 50,
		centerY: 50
	};

	defaultOptions: GaugeOptions = {
		dialRadius: 40,
		dialStartAngle: 135,
		dialEndAngle: 45,
		value: 0,
		max: 100,
		min: 0,
		valueDialClass: 'value',
		valueClass: 'value-text',
		valueLabelClass: '',
		dialClass: 'dial',
		gaugeClass: 'gauge',
		showValue: true,
		gaugeColor: undefined,
		viewBox: undefined,
		label: (val: number) => { return Math.round(val); }
	};

	value = 0;
	min = 0;
	max = 100;
	gaugeContainer: HTMLElement;
	radius: number;
	displayValue: boolean;
	startAngle: number;
	endAngle: number;
	valueDialClass: string;
	valueTextClass: string;
	valueLabelClass: string;
	dialClass: string;
	gaugeClass: string;
	gaugeColor?: (val: number) => any;
	gaugeValueElem!: SVGElement;
	gaugeValuePath!: SVGElement;
	label: (val: number) => any;
	viewBox: any;

	/**
	 * Creates a Gauge object. This should be called without the 'new' operator. Various options
	 * can be passed for the gauge:
	 * {
	 *    dialStartAngle: The angle to start the dial. MUST be greater than dialEndAngle. Default 135deg
	 *    dialEndAngle: The angle to end the dial. Default 45deg
	 *    dialRadius: The gauge's radius. Default 400
	 *    max: The maximum value of the gauge. Default 100
	 *    value: The starting value of the gauge. Default 0
	 *    label: The function on how to render the center label (Should return a value)
	 * }
	 * @param {Element} elem The DOM into which to render the gauge
	 * @param {Object} sOptions The gauge options
	 */
	constructor(elem: HTMLElement, sOptions: GaugeOptions) {
		const opts = this.shallowCopy({}, this.defaultOptions, sOptions) as Required<GaugeOptions>;
		this.min = opts.min;
		this.max = opts.max;
		this.value = this.normalize(opts.value, this.min, this.max);

		this.gaugeContainer = elem;
		this.radius = opts.dialRadius;
		this.displayValue = opts.showValue;
		this.startAngle = opts.dialStartAngle;
		this.endAngle = opts.dialEndAngle;
		this.valueDialClass = opts.valueDialClass;
		this.valueTextClass = opts.valueClass;
		this.valueLabelClass = opts.valueLabelClass;
		this.dialClass = opts.dialClass;
		this.gaugeClass = opts.gaugeClass;
		this.gaugeColor = opts.gaugeColor || undefined;
		this.label = opts.label;
		this.viewBox = opts.viewBox;

		if (this.startAngle < this.endAngle) {
			console.log('WARN! startAngle < endAngle, Swapping');
			const tmp = this.startAngle;
			this.startAngle = this.endAngle;
			this.endAngle = tmp;
		}

		this.initializeGauge(this.gaugeContainer);
		this.setValue(this.value);
	}

	setMaxValue(max: number) {
		this.max = max;
		this.updateGauge(this.value);
	}

	setValue(val: number) {
		this.value = this.normalize(val, this.min, this.max);
		if (this.gaugeColor) {
			this.setGaugeColor(this.value, 0);
		}
		this.updateGauge(this.value);
	}

	setValueAnimated(val: number, duration: number) {
		const oldVal = this.value;
		this.value = this.normalize(val, this.min, this.max);
		if (oldVal === this.value) {
			return;
		}

		if (this.gaugeColor) {
			this.setGaugeColor(this.value, duration);
		}

		new Animation({
			start: oldVal || 0,
			end: this.value,
			duration: duration || 1,
			step: (val: number, frame: number) => {
				this.updateGauge(val, frame);
			}
		});
	}

	getValue() {
		return this.value;
	}

	shallowCopy(target: any, ...targets: any[]) {
		for (const s of targets) {
			for (const k in s) {
				if (s.hasOwnProperty(k)) {
					target[k] = s[k];
				}
			}
		}

		return target;
	}

	/**
	 * A utility function to create SVG dom tree
	 * @param {String} name The SVG element name
	 * @param {Object} attrs The attributes as they appear in DOM e.g. stroke-width and not strokeWidth
	 * @param {Array} children An array of children (can be created by this same function)
	 * @return The SVG element
	 */
	svg(name: string, attrs: any, children?: any[]) {
		const elem = document.createElementNS(Gauge.SVG_NS, name);

		for (let attrName in attrs) {
			elem.setAttribute(attrName, attrs[attrName]);
		}

		if (children) {
			for (const c of children) {
				elem.appendChild(c);
			}
		}

		return elem as SVGElement;
	}

	/**
	 * Translates percentage value to angle. e.g. If gauge span angle is 180deg, then 50%
	 * will be 90deg
	 */
	getAngle(percentage: number, gaugeSpanAngle: number) {
		return percentage * gaugeSpanAngle / 100;
	}

	normalize(value: number, min: number, limit: number) {
		const val = Number(value);
		if (val > limit) {
			return limit;
		}
		if (val < min) {
			return min;
		}
		return val;
	}

	getValueInPercentage(value: number, min: number, max: number) {
		const newMax = max - min;
		const newVal = value - min;
		return 100 * newVal / newMax;
		// var absMin = Math.abs(min);
		// return 100 * (absMin + value) / (max + absMin);
	}

	/**
	 * Gets cartesian co-ordinates for a specified radius and angle (in degrees)
	 * @param cx {Number} The center x co-ordinate
	 * @param cy {Number} The center y co-ordinate
	 * @param radius {Number} The radius of the circle
	 * @param angle {Number} The angle in degrees
	 * @return An object with x,y co-ordinates
	 */
	getCartesian(cx: number, cy: number, radius: number, angle: number) {
		const rad = angle * Math.PI / 180;
		return {
			x: Math.round((cx + radius * Math.cos(rad)) * 1000) / 1000,
			y: Math.round((cy + radius * Math.sin(rad)) * 1000) / 1000
		};
	}

	// Returns start and end points for dial
	// i.e. starts at 135deg ends at 45deg with large arc flag
	// REMEMBER!! angle=0 starts on X axis and then increases clockwise
	getDialCoords(radius: number, startAngle: number, endAngle: number) {
		const cx = this.GaugeDefaults.centerX;
		const cy = this.GaugeDefaults.centerY;
		return {
			end: this.getCartesian(cx, cy, radius, endAngle),
			start: this.getCartesian(cx, cy, radius, startAngle)
		};
	}

	pathString(radius: number, startAngle: number, endAngle: number, largeArc?: number) {
		const coords = this.getDialCoords(radius, startAngle, endAngle);
		const start = coords.start;
		const end = coords.end;
		const largeArcFlag = typeof (largeArc) === 'undefined' ? 1 : largeArc;

		return [
			'M', start.x, start.y,
			'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y
		].join(' ');
	}

	initializeGauge(elem: any) {
		this.gaugeValueElem = this.svg('text', {
			x: 50,
			y: 50,
			fill: '#999',
			'class': this.valueTextClass,
			'font-size': '100%',
			'font-family': 'sans-serif',
			'font-weight': 'normal',
			'text-anchor': 'middle',
			'alignment-baseline': 'middle',
			'dominant-baseline': 'central'
		});

		this.gaugeValuePath = this.svg('path', {
			'class': this.valueDialClass,
			fill: 'none',
			stroke: '#666',
			'stroke-width': 2.5,
			d: this.pathString(this.radius, this.startAngle, this.startAngle) // value of 0
		});

		const angle = this.getAngle(100, 360 - Math.abs(this.startAngle - this.endAngle));
		const flag = angle <= 180 ? 0 : 1;
		const gaugeElement = this.svg(
			'svg',
			{ 'viewBox': this.viewBox || '0 0 100 100', 'class': this.gaugeClass },
			[
				this.svg('path', {
					'class': this.dialClass,
					fill: 'none',
					stroke: '#eee',
					'stroke-width': 2,
					d: this.pathString(this.radius, this.startAngle, this.endAngle, flag)
				}),
				this.svg('g', { 'class': 'text-container' }, [this.gaugeValueElem]),
				this.gaugeValuePath
			]
		);
		elem.appendChild(gaugeElement);
	}

	updateGauge(theValue: number, frame?: number) {
		const val = this.getValueInPercentage(theValue, this.min, this.max);
		// angle = getAngle(val, 360 - Math.abs(endAngle - startAngle)),
		const angle = this.getAngle(val, 360 - Math.abs(this.startAngle - this.endAngle));
		// this is because we are using arc greater than 180deg
		const flag = angle <= 180 ? 0 : 1;

		if (this.displayValue) {
			this.gaugeValueElem.textContent = this.label(theValue);
		}

		this.gaugeValuePath.setAttribute(
			'd', this.pathString(this.radius, this.startAngle, angle + this.startAngle, flag)
		);
	}

	setGaugeColor(value: number, duration: number) {
		const c = this.gaugeColor ? this.gaugeColor(value) : 'black';
		const dur = duration * 1000;
		const pathTransition = 'stroke ' + dur + 'ms ease';
		// textTransition = "fill " + dur + "ms ease";

		this.gaugeValuePath.style.stroke = c;
		// this.gaugeValuePath.style['-webkit-transition'] = pathTransition;
		// this.gaugeValuePath.style['-moz-transition'] = pathTransition;
		this.gaugeValuePath.style.transition = pathTransition;
		/*
		 gaugeValueElem.style = [
		 "fill: " + c,
		 "-webkit-transition: " + textTransition,
		 "-moz-transition: " + textTransition,
		 "transition: " + textTransition,
		 ].join(";");
		 */
	}
}