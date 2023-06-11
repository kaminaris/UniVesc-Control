/// <reference path="../../../../node_modules/bingmaps/types/MicrosoftMaps/Microsoft.Maps.All.d.ts" />

import {
	AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild
} from '@angular/core';
import { Position } from '@capacitor/geolocation/dist/esm/definitions';

@Component({
	selector: 'bing-map',
	template: `
		<div #streetsideMap style='width: 100%; height: 80vh;'></div>
	`,
	styles: [``]
})
export class BingMapComponent implements OnChanges, AfterViewInit {

	@ViewChild('streetsideMap') streetsideMapViewChild!: ElementRef;

	map?: Microsoft.Maps.Map;
	position?: Microsoft.Maps.Location;

	@Input() route?: Position[];

	constructor() {
	}

	ngOnChanges() {
	}

	ngAfterViewInit() {
		this.createStreetSideMap();

		this.map!.setView({ center: this.position });
	}

	createStreetSideMap() {
		this.map = new Microsoft.Maps.Map(
			this.streetsideMapViewChild.nativeElement,
			{
				mapTypeId: Microsoft.Maps.MapTypeId.road,
			}
		);

		if (this.route) {
			console.log('Drawing route');
			this.drawRoute();
		}
	}

	clearRoute() {
		this.map?.entities.clear();
	}

	convertRoute(coords: Position[]) {
		return coords.map(v => new Microsoft.Maps.Location(v.coords.latitude, v.coords.longitude));
	}

	drawRoute() {
		if (!this.route || this.route.length < 2) {
			return;
		}

		// Create a polyline
		const line = new Microsoft.Maps.Polyline(this.convertRoute(this.route), {
			strokeColor: 'red',
			strokeThickness: 3
		});

		// Add the polyline to map
		this.map?.entities.push(line);
	}

}
