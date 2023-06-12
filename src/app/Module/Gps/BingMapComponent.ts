/// <reference path="../../../../node_modules/bingmaps/types/MicrosoftMaps/Microsoft.Maps.All.d.ts" />

import {
	AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild
}                     from '@angular/core';
import { Position }   from '@capacitor/geolocation/dist/esm/definitions';
import { GpsService } from 'src/app/Service/GpsService';

@Component({
	selector: 'bing-map',
	template: `
		<div #roadMap style='width: 100%; height: 80vh;'></div>
	`,
	styles: [``]
})
export class BingMapComponent implements OnChanges, AfterViewInit {

	@ViewChild('roadMap') roadMapViewChild!: ElementRef;

	map?: Microsoft.Maps.Map;
	position?: Microsoft.Maps.Location;

	constructor(protected gps: GpsService) {
	}

	ngOnChanges() {
	}

	ngAfterViewInit() {
		this.createStreetSideMap();

		this.map!.setView({ center: this.position });
	}

	createStreetSideMap() {
		this.map = new Microsoft.Maps.Map(
			this.roadMapViewChild.nativeElement,
			{
				mapTypeId: Microsoft.Maps.MapTypeId.road
			}
		);
	}

	clearRoute() {
		this.map?.entities.clear();
	}

	convertRoute(coords: Position[]) {
		return coords.map(v => new Microsoft.Maps.Location(v.coords.latitude, v.coords.longitude));
	}

	drawRoute(route: Position[]) {
		if (!route || route.length < 2) {
			console.log('not enough points to draw route');
			return;
		}

		// Create a polyline
		const line = new Microsoft.Maps.Polyline(this.convertRoute(route), {
			strokeColor: 'red',
			strokeThickness: 5
		});

		// Add the polyline to map
		this.map?.entities.push(line);
	}

	center(position: Position) {
		this.map?.setView({ center: this.gps.convertToMsLocation(position) });
	}
}
