import { Component }  from '@angular/core';
import { UniService } from 'src/app/Service/UniService';

@Component({
	selector: 'firmware-tab-page',
	templateUrl: 'FirmwareTabPage.html'
})
export class FirmwareTabPage {
	progress = 0;

	constructor(protected uni: UniService) {}

	progressCb(pct: number) {
		this.progress = pct / 100;
	}

	async uploadFirmware(event: Event) {
		const element = event.currentTarget as HTMLInputElement;
		let fileList: FileList | null = element.files;
		if (fileList && fileList.length > 0) {
			const firmware = fileList.item(0)!;
			await this.uni.writeFirmware(firmware, this.progressCb.bind(this));

			// console.log(chunked);
		}
	}
}
