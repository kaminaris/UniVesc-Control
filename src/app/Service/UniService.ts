import { Injectable }                                         from '@angular/core';
import { Subscription }                                       from 'rxjs';
import { BinarySerializer }                                   from 'src/app/BinarySerializer';
import { BasePacket, BaseResponse, PacketType, ResponseCode } from 'src/app/Packets/BasePacket';
import { ClockResponse }                                      from 'src/app/Packets/ClockResponse';
import { FileContentResponse }                                from 'src/app/Packets/FileContentResponse';
import { FileItemResponse }                                   from 'src/app/Packets/FileItemResponse';
import { FileReadRequest }                                    from 'src/app/Packets/FileReadRequest';
import { FileWriteRequest }                                   from 'src/app/Packets/FileWriteRequest';
import { FirmwareUpdate, FirmwareUpdateChunkSize }            from 'src/app/Packets/FirmwareUpdate';
import { GetChipInfo }                                        from 'src/app/Packets/GetChipInfo';
import { GetClock }                                           from 'src/app/Packets/GetClock';
import { Ping }                                               from 'src/app/Packets/Ping';
import { PlayRequest }                                        from 'src/app/Packets/PlayRequest';
import { ReadEepromRequest }                                  from 'src/app/Packets/ReadEepromRequest';
import { ReadEepromResponse }                                 from 'src/app/Packets/ReadEepromResponse';
import { SetVolumeRequest }                                   from 'src/app/Packets/SetVolumeRequest';
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

	readSpiffsCb(value: number[]) {
		const packetType = value.shift();

		switch (packetType) {
			case ResponseCode.FILE:
				const f = BinarySerializer.deserialize(FileItemResponse, value);
				console.log(f, value);

				break;

			case ResponseCode.OK:
				this.dataSub?.unsubscribe();
				console.log('Reading finished');
				break;
			default:
				console.log('Unknown Response!');
				break;
		}
	}

	async readSpiffsFiles() {
		const req = new BasePacket();
		req.t = PacketType.GET_FILE_LIST;

		this.dataSub = this.bt.emData.subscribe(this.readSpiffsCb.bind(this));

		const b = BinarySerializer.serialize(req) as number[];
		const res = await this.bt.write(b);
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
		const req = new PlayRequest();
		req.fileName = file;

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

	firmwareUpdateCb(value: number[]) {
		const packetType = value[0];

		switch (packetType) {
			case 10:
				console.log('Progress: ${value[1]}%');
				break;
			case 7: {
				console.log('Progress: 100%');
				console.log('Flashing finished, restarting');
				this.restart().catch(console.error);
				this.dataSub?.unsubscribe();
				break;
			}
			case 8:
				console.log('Flashing FAILED!');
				break;
			default:
				console.log('Unknown Response!');
				break;
		}
	}

	async writeFirmware(f: File) {
		const data = await this.convertFileToByteArray(f);
		const chunked = this.chunkArray(data, FirmwareUpdateChunkSize);

		this.dataSub = this.bt.emData.subscribe(this.firmwareUpdateCb.bind(this));

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

			console.log(fw.d.length);
			const b = BinarySerializer.serialize(fw) as number[];
			console.log(fw, b.length, fw.d[0], this.convertToHexString(b));

			const res = await this.bt.write(b);
			console.log(res);
		}
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