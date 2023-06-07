import { Component, ElementRef, ViewChild } from '@angular/core';
import { BluetoothTransport }               from 'src/app/Service/BluetoothTransport';
import { DownloadHelper }                   from 'src/app/Service/DownloadHelper';
import { UniService }                       from 'src/app/Service/UniService';

@Component({
	selector: 'real-time-tab',
	templateUrl: 'RealTimeTabPage.html'
})
export class RealTimeTabPage {
	encoder = new TextEncoder();
	decoder = new TextDecoder();

	logText = '';
	volume = 5;

	firmware?: File;
	@ViewChild('scroller') protected scrollContainer?: ElementRef;

	constructor(
		protected bt: BluetoothTransport,
		protected uv: UniService
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
		await this.uv.ping();
	}

	async getClock() {
		const clock = await this.uv.getClock();
		console.log(clock.toString());
	}

	async getEeprom() {
		const eeprom = this.uv.getEeprom(0);
		console.log(eeprom.toString());
	}

	async getChipInfo() {
		const r = await this.uv.getChipInfo();
		console.log(r);
	}

	async setFile(event: Event) {
		const element = event.currentTarget as HTMLInputElement;
		let fileList: FileList | null = element.files;
		if (fileList && fileList.length > 0) {
			this.firmware = fileList.item(0)!;
			await this.uv.writeFirmware(this.firmware);

			// console.log(chunked);
		}
	}

	async setFile2(event: Event) {
		const element = event.currentTarget as HTMLInputElement;
		let fileList: FileList | null = element.files;
		if (fileList && fileList.length > 0) {
			await this.uv.writeFileToSpiffs('/never.ogg', fileList.item(0)!);

			// console.log(chunked);
		}
	}

	async readFiles() {
		await this.uv.readSpiffsFiles();
	}

	async beepTest() {
		await this.uv.beepTest();
	}

	async playTest() {
		await this.uv.play('/never.ogg');
	}

	async setVolume() {
		await this.uv.setVolume(this.volume);
	}

	async readFile() {
		const f = await this.uv.readFile('/beep.mp3');
		console.log('END FILE', f);
		if (f) {
			const b = new Blob([new Uint8Array(f.content!)]);
			DownloadHelper.saveBlobAs(b, 'beep.mp3');
		}

	}
}
