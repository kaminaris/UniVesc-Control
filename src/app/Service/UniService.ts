import { Injectable }                                         from '@angular/core';
import { Subscription }                                       from 'rxjs';
import { BinarySerializer }                                   from 'src/app/BinarySerializer';
import { BasePacket, BaseResponse, PacketType, ResponseCode } from 'src/app/Packets/BasePacket';
import { ClockResponse }                                      from 'src/app/Packets/ClockResponse';
import { FileContentResponse }                                from 'src/app/Packets/FileContentResponse';
import { FileItemResponse }                                   from 'src/app/Packets/FileItemResponse';
import { FileReadRequest }                                    from 'src/app/Packets/FileReadRequest';
import { FilesystemInfoResponse }                             from 'src/app/Packets/FilesystemInfoResponse';
import { FileWriteRequest }                                   from 'src/app/Packets/FileWriteRequest';
import { FirmwareUpdate, FirmwareUpdateChunkSize }            from 'src/app/Packets/FirmwareUpdate';
import { GetChipInfo }                                        from 'src/app/Packets/GetChipInfo';
import { GetClock }                                           from 'src/app/Packets/GetClock';
import { Ping }                                               from 'src/app/Packets/Ping';
import { PlayRequest }                                        from 'src/app/Packets/PlayRequest';
import { ReadEepromRequest }                                  from 'src/app/Packets/ReadEepromRequest';
import { ReadEepromResponse } from 'src/app/Packets/ReadEepromResponse';
import { RealTimeData }       from 'src/app/Packets/RealTimeData';
import { SetVolumeRequest }   from 'src/app/Packets/SetVolumeRequest';
import { VescSettings }                                       from 'src/app/Packets/VescSettings';
import { BluetoothTransport, Delay }                          from 'src/app/Service/BluetoothTransport';
import { crc32 }                                              from 'src/app/Util/crc32';

@Injectable({ providedIn: 'root' })
export class UniService {
	dataSub?: Subscription;

	constructor(protected bt: BluetoothTransport) {}

	async ping(): Promise<boolean> {
		const ping = new Ping();
		const b = BinarySerializer.serialize(ping) as number[];

		const res = await this.bt.exchange(b, 1000);
		return res[0] === ResponseCode.OK;
	}

	async getClock() {
		const gc = new GetClock();
		const b = BinarySerializer.serialize(gc) as number[];

		const res = await this.bt.exchange(b, 1000);
		return BinarySerializer.deserialize(ClockResponse, res);
	}

	async getEeprom(address: number) {
		const ee = new ReadEepromRequest();
		ee.address = address;
		const b = BinarySerializer.serialize(ee) as number[];

		const res = await this.bt.exchange(b, 1000);

		return BinarySerializer.deserialize(ReadEepromResponse, res);
	}

	async getChipInfo() {
		const ee = new GetChipInfo();
		const b = BinarySerializer.serialize(ee) as number[];

		const res = await this.bt.exchange(b, 1000);

		return BinarySerializer.deserialize(BaseResponse, res);
	}

	async writeFileToSpiffs(fileName: string, f: File) {
		const file = await this.convertFileToByteArray(f);
		const chunked = this.chunkArray(file, 256);

		let position = 0;
		for (let i = 0; i < chunked.length; i++) {
			const fw = new FileWriteRequest();
			fw.fileName = fileName;
			fw.d = chunked[i];
			fw.size = fw.d.length;
			fw.position = position;
			fw.checksum = crc32(fw.d);
			if (fw.d.length < 256) {
				fw.d = this.padArrayWithZeros(fw.d, 256);
			}

			const b = BinarySerializer.serialize(fw) as number[];
			console.log(fw, this.convertToHexString(b));

			const res = await this.bt.exchange(b, 2000);
			await Delay(5);
			console.log(res);
			position += fw.size;
		}
	}

	async getFileSystemInfo() {
		const r = await this.bt.exchange([PacketType.GET_FILESYSTEM_INFO], 1000);
		return BinarySerializer.deserialize(FilesystemInfoResponse, r);
	}

	readSpiffsFiles(timeout = 1000): Promise<FileItemResponse[] | null> {
		return new Promise(async (resolve, reject) => {
			const req = new BasePacket();
			req.t = PacketType.GET_FILE_LIST;

			const result: FileItemResponse[] = [];
			let sub: Subscription;
			let timer: number;

			let startTimeout = () => {
				if (timer) {
					window.clearTimeout(timer);
				}
				timer = window.setTimeout(async () => {
					sub?.unsubscribe();
					reject(new Error('Unable to get files'));
				}, timeout);
			};
			startTimeout();

			const resolver = async (a: any[]) => {
				window.clearTimeout(timer);
				resolve(a);
				sub?.unsubscribe();
			};

			let readSpiffsCb = (value: number[]) => {
				const packetType = value.shift();

				switch (packetType) {
					case ResponseCode.FILE:
						const f = BinarySerializer.deserialize(FileItemResponse, value);
						result.push(f);
						startTimeout();

						break;

					case ResponseCode.OK:
						resolver(result);
						sub?.unsubscribe();
						console.log('Reading finished');
						break;
					default:
						reject();
						sub?.unsubscribe();
						console.log('Unknown Response!');
						break;
				}
			};

			sub = this.bt.emData.subscribe(readSpiffsCb.bind(this));

			const b = BinarySerializer.serialize(req) as number[];
			const res = await this.bt.write(b);
		});

	}

	fileCache: { name: string, content: number[] } = { name: '', content: [] };
	fileCb?: (f: { name: string, content: number[] }) => void;

	async readFile(fileName: string): Promise<null | { name: string, content: number[] }> {
		const req = new FileReadRequest();
		req.fileName = fileName;
		req.position = 0;

		this.fileCache = { name: fileName, content: [] };

		let totalSize = 0;
		do {
			const b = BinarySerializer.serialize(req) as number[];

			const res = await this.bt.exchange(b, 2000);
			const packetType = res.shift();

			switch (packetType) {
				case ResponseCode.FILE_CONTENT:
					const f = BinarySerializer.deserialize(FileContentResponse, res);
					totalSize = f.totalSize;
					console.log('TOTAL FILE SIZE', f.totalSize);
					this.fileCache.content.push(...(f.d.slice(0, f.size)));
					req.position += f.size;
					console.log('REQ POS', req.position, totalSize);
					break;

				case ResponseCode.FAIL:
					console.log('Reading failed');
					return null;
					break;
				default:
					console.log('Unknown Response!');
					break;
			}
		} while (req.position <= totalSize - 1);

		return this.fileCache;
	}

	async restart() {
		await this.bt.write([PacketType.RESTART]);
	}

	async beepTest() {
		await this.bt.write([PacketType.BEEP_TEST]);
	}

	async getSettings() {
		const r = await this.bt.exchange([PacketType.GET_SETTINGS], 1000);
		const settings = BinarySerializer.deserialize(VescSettings, r);

		return settings;
	}

	async saveSettings(settings: VescSettings) {
		const s = BinarySerializer.serialize(settings)!;
		s.unshift(PacketType.SAVE_SETTINGS);

		const r = await this.bt.exchange(s, 1000);

		return r[0] == ResponseCode.OK;
	}

	async play(file: string) {
		const fName = file.startsWith('/') ? file : '/' + file;
		const req = new PlayRequest();
		req.fileName = fName;

		const b = BinarySerializer.serialize(req) as number[];
		const r = await this.bt.exchange(b, 1000);
		console.log(r);
	}

	async setVolume(volume: number) {
		if (volume > 21) {
			volume = 21;
		}

		const req = new SetVolumeRequest();
		req.volume = volume;

		const b = BinarySerializer.serialize(req) as number[];
		const r = await this.bt.exchange(b, 1000);
		return r[0] == ResponseCode.OK;
	}

	async getRealTimeData() {
		const r = await this.bt.exchange([PacketType.GET_REALTIME_DATA], 1000);
		return BinarySerializer.deserialize(RealTimeData, r);
	}

	async writeFirmware(f: File, progressCb: (pct: number) => void): Promise<void> {
		return new Promise(async (resolve, reject) => {
			const data = await this.convertFileToByteArray(f);
			const chunked = this.chunkArray(data, FirmwareUpdateChunkSize);

			let firmwareUpdateCb = (value: number[]) => {
				const packetType = value[0];

				switch (packetType) {
					case 10:
						console.log(`Progress: ${value[1]}%`);
						progressCb(value[1]);
						break;
					case 7: {
						console.log('Progress: 100%');
						console.log('Flashing finished, restarting');
						this.restart().catch(console.error);
						this.dataSub?.unsubscribe();

						progressCb(100);
						resolve();
						break;
					}
					case 8:
						reject(new Error('Flashing FAILED!'));
						console.log('Flashing FAILED!');
						break;
					default:
						console.log('Unknown Response!');
						break;
				}
			}

			this.dataSub = this.bt.emData.subscribe(firmwareUpdateCb.bind(this));

			for (let i = 0; i < chunked.length; i++) {
				const fw = new FirmwareUpdate();
				fw.chunks = chunked.length;
				fw.chunk = i + 1;
				fw.d = chunked[i];
				fw.size = fw.d.length;
				fw.checksum = crc32(fw.d);
				if (fw.d.length < FirmwareUpdateChunkSize) {
					fw.d = this.padArrayWithZeros(fw.d, FirmwareUpdateChunkSize);
				}
				fw.totalSize = data.length;

				const b = BinarySerializer.serialize(fw) as number[];
				const res = await this.bt.write(b);
			}
		});
	}

	/**
	 * Utils
	 */
	convertFileToByteArray(file: File): Promise<number[]> {
		return new Promise((resolve, reject) => {
			const fileReader = new FileReader();
			fileReader.onerror = () => {
				fileReader.abort();
				reject(new DOMException('Error parsing file.'));
			};

			fileReader.onload = () => {
				const arrayBuffer = fileReader.result as ArrayBuffer;
				resolve(Array.from(new Uint8Array(arrayBuffer)));
			};

			fileReader.readAsArrayBuffer(file);
		});
	}

	chunkArray(array: number[], chunkSize: number): number[][] {
		const chunks: number[][] = [];
		const numChunks = Math.ceil(array.length / chunkSize);
		for (let i = 0; i < numChunks; i++) {
			const start = i * chunkSize;
			const end = (i + 1) * chunkSize;
			chunks.push(array.slice(start, end));
		}
		return chunks;
	}

	padArrayWithZeros(arr: number[], desiredLength: number) {
		return arr.concat(new Array(desiredLength - arr.length).fill(0));
	}

	convertToHexString(numArray: number[]): string {
		return numArray
			.map(num => num.toString(16).toUpperCase().padStart(2, '0'))
			.join(' ');
	}
}