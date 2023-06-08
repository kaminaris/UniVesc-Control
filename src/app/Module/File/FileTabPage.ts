import { Component, OnInit }      from '@angular/core';
import { FileItemResponse }       from 'src/app/Packets/FileItemResponse';
import { FilesystemInfoResponse } from 'src/app/Packets/FilesystemInfoResponse';
import { DownloadHelper }         from 'src/app/Service/DownloadHelper';
import { UniService }             from 'src/app/Service/UniService';

@Component({
	selector: 'file-tab-page',
	templateUrl: 'FileTabPage.html'
})
export class FileTabPage implements OnInit {
	items: FileItemResponse[] = [];
	info = new FilesystemInfoResponse();
	fileNameToUpload = '';

	constructor(protected uni: UniService) {
	}

	async ngOnInit() {
		await this.getFiles();
	}

	async getFiles() {
		try {
			await this.getFilesystemInfo();

			const response = await this.uni.readSpiffsFiles();
			if (response) {
				this.items = response;
			}
			console.log(this.items);
		}
		catch (e) {
			console.log(e);
		}
	}

	async play(item: FileItemResponse) {
		await this.uni.play(item.fileName);
	}

	async download(item: FileItemResponse) {
		const fName = item.fileName.startsWith('/') ? item.fileName : '/' + item.fileName;
		const f = await this.uni.readFile(fName);
		if (f) {
			const b = new Blob([new Uint8Array(f.content!)]);
			DownloadHelper.saveBlobAs(b, item.fileName);
		}
	}

	async getFilesystemInfo() {
		this.info = await this.uni.getFileSystemInfo();
	}

	async uploadFile(event: Event) {
		const element = event.currentTarget as HTMLInputElement;
		let fileList: FileList | null = element.files;
		if (fileList && fileList.length > 0) {
			await this.uni.writeFileToSpiffs('/' + this.fileNameToUpload, fileList.item(0)!);

			// console.log(chunked);
		}
	}
}
