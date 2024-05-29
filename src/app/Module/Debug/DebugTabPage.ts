import { Component, ElementRef, ViewChild } from '@angular/core';
import { BluetoothTransport }               from 'src/app/Service/BluetoothTransport';
import { DownloadHelper }                   from 'src/app/Service/DownloadHelper';
import { UniService }                       from 'src/app/Service/UniService';

@Component({
	selector: 'debug-tab-page',
	templateUrl: 'DebugTabPage.html'
})
export class DebugTabPage {
	encoder = new TextEncoder();
	decoder = new TextDecoder();

	logText = '';
	volume = 5;

	@ViewChild('scroller') protected scrollContainer?: ElementRef;

	constructor(
		protected bt: BluetoothTransport,
		protected uni: UniService
	) {
		bt.emLog.subscribe((v: any) => {
			const str = this.decoder.decode(new Uint8Array(v));
			console.log(v, str);
			this.logText += str;
			setTimeout(() => {
				this.scrollToBottom();
			}, 50);
		});
	}

	scrollToBottom(): void {
		try {
			if (this.scrollContainer) {
				const native = this.scrollContainer.nativeElement;
				if (native.scrollTop === (native.scrollHeight - native.offsetHeight)) {
					native.scrollTop = native.scrollHeight;
				}
			}
		}
		catch (err) {
		}
	}

	async searchBt() {
		await this.bt.connect();
	}

	async writeBt() {
		await this.uni.ping();
	}

	async getPlugins() {
		console.log(await this.uni.getPlugins());
	}

	async getClock() {
		// const clock = await this.uni.getClock();
		// console.log(clock.toString());
	}

	async getEeprom() {
		// const eeprom = this.uni.getEeprom(0);
		// console.log(eeprom.toString());
	}

	async getChipInfo() {
		const r = await this.uni.getChipInfo();
		console.log(r);
	}

	async readFiles() {
		await this.uni.readSpiffsFiles();
	}

	async beepTest() {
		// await this.uni.beepTest();
	}


	async tuneTest() {
		// await this.uni.tuneTest();
	}


	async readFile() {
		const f = await this.uni.readFile('/beep.mp3');
		console.log('END FILE', f);
		if (f) {
			const b = new Blob([new Uint8Array(f.content!)]);
			DownloadHelper.saveBlobAs(b, 'beep.mp3');
		}

	}
}
