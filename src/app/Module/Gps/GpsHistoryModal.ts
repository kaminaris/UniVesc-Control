import { formatDate } from '@angular/common';
import { Component }  from '@angular/core';

import { ModalController } from '@ionic/angular';
import { GpsHistoryEntry } from 'src/app/Module/Gps/Interface/GpsHistoryEntry';
import { GpsService }      from 'src/app/Service/GpsService';

@Component({
	template: `
		<ion-header>
			<ion-toolbar>
				<ion-buttons slot="start">
					<ion-button color="medium" (click)="cancel()">Cancel</ion-button>
				</ion-buttons>
				<ion-title>GPS Route History</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding">
			<ion-list>
				<ion-item *ngFor="let item of gps.history">
					<ion-label>
						{{ item.time | date:'YYYY-MM-dd HH:mm' }}
					</ion-label>
					<ion-button color="primary" slot="end" (click)="load(item)">
						<ion-icon name="download"></ion-icon>
					</ion-button>
				</ion-item>
			</ion-list>
		</ion-content>
	`
})
export class GpsHistoryModal {
	name?: string;

	protected readonly formatDate = formatDate;

	constructor(
		protected modalCtrl: ModalController,
		public gps: GpsService
	) {}

	cancel() {
		return this.modalCtrl.dismiss(null, 'cancel');
	}

	load(item: GpsHistoryEntry) {
		return this.modalCtrl.dismiss(item, 'confirm');
	}

}