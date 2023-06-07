import { Component }              from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastController }        from '@ionic/angular';
import { BinarySerializer }       from 'src/app/BinarySerializer';
import { VescSettings }           from 'src/app/Packets/VescSettings';
import { UniService }             from 'src/app/Service/UniService';

@Component({
	selector: 'control-tab-page',
	templateUrl: 'ControlTabPage.html'
})
export class ControlTabPage {
	form: FormGroup;
	settingsKeys: string[];
	settings = new VescSettings();

	constructor(
		protected uni: UniService,
		protected toastController: ToastController
	) {
		this.form = new FormGroup({});

		this.settingsKeys = BinarySerializer.getClassProperties(this.settings);
		console.log(this.settingsKeys);
		for (const key of this.settingsKeys) {
			this.form.addControl(key, new FormControl(0));
		}
	}

	keyToLabel(text: string) {
		const result = text.replace(/([A-Z])/g, ' $1');
		return result.charAt(0).toUpperCase() + result.slice(1);
	}

	async getSettings() {
		this.settings = await this.uni.getSettings();
		for (const key of this.settingsKeys) {
			this.form.controls[key].setValue(BinarySerializer.getProperty(this.settings, key));
		}
	}

	async saveSettings() {
		const v = this.form.value;

		for (const key of this.settingsKeys) {
			BinarySerializer.setProperty(this.settings, key, v[key]);
		}

		const success = await this.uni.saveSettings(this.settings);
		const toast = await this.toastController.create({
			message: success ? 'Saved!' : 'Failed to save!',
			duration: 1500,
			position: 'bottom'
		});
		await toast.present();
		console.log(this.settings);
	}
}
