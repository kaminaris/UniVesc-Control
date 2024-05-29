import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router }            from '@angular/router';
import { Gauge }                            from 'src/app/Module/RealTime/Gauge';
import { RealTimeData }                     from 'src/app/Packets/RealTimeData';
import { BluetoothTransport }               from 'src/app/Service/BluetoothTransport';
import { UniService }                       from 'src/app/Service/UniService';

@Component({
	selector: 'real-time-tab',
	templateUrl: 'RealTimeTabPage.html'
})
export class RealTimeTabPage implements OnInit, AfterViewInit {
	data = new RealTimeData();

	interval: any;
	gauge3?: Gauge;

	constructor(
		protected bt: BluetoothTransport,
		protected uni: UniService,
		protected router: Router
	) {
		this.router.events.subscribe((e) => {
			if (e instanceof NavigationEnd) {
				if (e.url !== '/tabs/real-time') {
					this.stopInterval();
				}
				else {
					this.startInterval();
				}
			}
		});
		this.startInterval();
	}

	ngOnInit() {
		this.startInterval();
	}

	ngAfterViewInit() {
		this.drawSpeedometer();
	}

	stopInterval() {
		if (this.interval) {
			window.clearInterval(this.interval);
			this.interval = undefined;
		}
	}

	startInterval() {
		if (!this.interval) {
			this.interval = window.setInterval(async () => {
				if (!this.bt.connected) {
					return;
				}
				// this.data = await this.uni.getRealTimeData();
			}, 1000);
		}
	}

	drawSpeedometer() {

		this.gauge3 = new Gauge(
			document.getElementById('gauge3') as any, {
				max: 100,
				value: 50,
				gaugeColor: (value) => {
					if (value < -25) {
						return '#5ee432';
					}
					else if (value < 0) {
						return '#fffa50';
					}
					else if (value < 25) {
						return '#f7aa38';
					}
					else {
						return '#ef4655';
					}
				}
			}
		);
		setInterval(() => {
			this.gauge3?.setValue(Math.random() * 100);
		}, 200);
		this.gauge3?.setValue(Math.random() * 100);
	}
}
