import { Component }              from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastController }        from '@ionic/angular';
import { BinarySerializer }       from 'src/app/BinarySerializer';
import { VescSettings }           from 'src/app/Packets/VescSettings';
import { UniService }             from 'src/app/Service/UniService';
import { PreferenceType }         from '../../Packets/BasePacket';

@Component({
	selector: 'control-tab-page',
	templateUrl: 'ControlTabPage.html'
})
export class ControlTabPage {
	form: FormGroup;
	settingsKeys: string[];
	settings = new VescSettings();
	settingTypes: any[] = [
		{ label: 'I8', value: PreferenceType.PT_I8 },
		{ label: 'U8', value: PreferenceType.PT_U8 },
		{ label: 'I16', value: PreferenceType.PT_I16 },
		{ label: 'U16', value: PreferenceType.PT_U16 },
		{ label: 'I32', value: PreferenceType.PT_I32 },
		{ label: 'U32', value: PreferenceType.PT_U32 },
		{ label: 'I64', value: PreferenceType.PT_I64 },
		{ label: 'U64', value: PreferenceType.PT_U64 },
		{ label: 'STR', value: PreferenceType.PT_STR },
		{ label: 'BLOB', value: PreferenceType.PT_BLOB },
	];

	constructor(
		protected uni: UniService,
		protected toastController: ToastController
	) {
		this.form = new FormGroup({});
		this.form.addControl('newKey', new FormControl());
		this.form.addControl('newValue', new FormControl());
		this.form.addControl('newType', new FormControl());

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
		const settingList = await this.uni.listSettings();
		console.log(settingList);
		// this.settings =
		// for (const key of this.settingsKeys) {
		// 	this.form.controls[key].setValue(BinarySerializer.getProperty(this.settings, key));
		// }
	}

	// async saveSettings() {
	// 	const v = this.form.value;
	//
	// 	for (const key of this.settingsKeys) {
	// 		BinarySerializer.setProperty(this.settings, key, v[key]);
	// 	}
	//
	// 	const success = await this.uni.savePreference(this.settings);
	// 	const toast = await this.toastController.create({
	// 		message: success ? 'Saved!' : 'Failed to save!',
	// 		duration: 1500,
	// 		position: 'bottom'
	// 	});
	// 	await toast.present();
	// 	console.log(this.settings);
	// }

	async setSetting() {
		const v = this.form.value;
		console.log(v);
		await this.uni.savePreference(v.newType as any, v.newKey, v.newValue);
	}
}
