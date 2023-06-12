import { Component, ViewChild }                              from '@angular/core';
import { Position }                                          from '@capacitor/geolocation';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { BingMapComponent }                                  from 'src/app/Module/Gps/BingMapComponent';
import { GpsHistoryModal }                                   from 'src/app/Module/Gps/GpsHistoryModal';
import { GpsHistoryEntry }                                   from 'src/app/Module/Gps/Interface/GpsHistoryEntry';
import { BingApiLoaderService }                              from 'src/app/Module/Gps/Service/BingApiLoaderService';
import { GpsService }                                        from 'src/app/Service/GpsService';

@Component({
	selector: 'gps-tab-page',
	templateUrl: 'GpsTabPage.html'
})
export class GpsTabPage {
	mapLoaded = false;
	tracking = false;
	test = true;

	@ViewChild('bingMap') bingMap!: BingMapComponent;
	entries: Position[] = [];

	constructor(
		protected bingApiLoader: BingApiLoaderService,
		public gps: GpsService,
		protected alertController: AlertController,
		protected modalCtrl: ModalController,
		protected toastController: ToastController
	) {
		this.bingApiLoader.load().then(() => {
			console.log('map loaded');
			this.mapLoaded = true;
		});

		this.gps.entries.subscribe((v) => {
			this.entries = v;
			if (!this.bingMap) {
				return;
			}
			this.bingMap.clearRoute();
			this.bingMap.drawRoute(this.entries);
		});
	}

	async toggleTracking() {
		if (this.test) {
			if (this.tracking) {
				this.tracking = false;
				const list = await this.gps.stopRandomTest();
				if (list) {
					this.saveRoute(list.value);
				}
			}
			else {
				this.tracking = true;
				this.bingMap.clearRoute();
				await this.gps.startRandomTest();
			}
			return;
		}

		if (this.tracking) {
			const list = await this.gps.stopWatching();
			this.tracking = false;

			// do not save route with just 2 points
			if (list.value.length < 2) {
				return;
			}

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
			this.bingMap.clearRoute();
			await this.gps.startWatching();
			this.tracking = true;
		}
	}

	saveRoute(list: Position[]) {
		this.gps.history.push({
			entries: list,
			time: new Date().toISOString()
		});
		this.gps.saveHistory();
	}

	async showHistory() {
		const modal = await this.modalCtrl.create({
			component: GpsHistoryModal
		});
		await modal.present();

		const { data, role } = await modal.onWillDismiss();

		if (role === 'confirm') {
			const entries = (data as GpsHistoryEntry).entries;
			if (entries.length < 2) {
				const toast = await this.toastController.create({
					message: 'Not enough points in a route!',
					duration: 1500,
					position: 'bottom'
				});
				await toast.present;
			}
			else {
				this.gps.entries.next(entries);
				console.log('loading route', data);
				this.bingMap.clearRoute();
				this.bingMap.drawRoute(entries);
				this.bingMap.center(entries[0]);
			}

		}
	}
}
