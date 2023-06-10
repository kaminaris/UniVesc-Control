import { Component, ViewChild } from '@angular/core';
import { Position }             from '@capacitor/geolocation';
import { AlertController }      from '@ionic/angular';
import { BingMapComponent }     from 'src/app/Module/Gps/BingMapComponent';
import { BingApiLoaderService } from 'src/app/Module/Gps/Service/BingApiLoaderService';
import { GpsService }           from 'src/app/Service/GpsService';

@Component({
	selector: 'gps-tab-page',
	templateUrl: 'GpsTabPage.html'
})
export class GpsTabPage {
	mapLoaded = false;
	tracking = false;
	test = true;

	@ViewChild('bingMap') bingMap!: BingMapComponent;
	entries: Microsoft.Maps.Location[] = [];

	constructor(
		protected bingApiLoader: BingApiLoaderService,
		public gps: GpsService,
		protected alertController: AlertController
	) {
		this.bingApiLoader.load().then(() => {
			console.log('map loaded');
			this.mapLoaded = true;
		});

		this.gps.entries.subscribe((v) => {
			this.entries = v;
			this.bingMap.clearRoute();
			this.bingMap.drawRoute();
		});
	}

	async toggleTracking() {
		if (this.test) {
			await this.gps.startRandomTest();
			return;
		}

		if (this.tracking) {
			const list = await this.gps.stopWatching();
			this.tracking = false;

			const alert = await this.alertController.create({
				header: 'Confirm',
				message: 'Do you wish to save route?',
				buttons: [
					{
						text: 'Yes',
						handler: () => {
							this.saveRoute(list.value);
						}
					},
					{
						text: 'Discard',
						handler: () => {}
					}
				]
			});

			await alert.present();
		}
		else {
			await this.gps.startWatching();
			this.tracking = true;
		}
	}

	saveRoute(list: Microsoft.Maps.Location[]) {

	}
}
