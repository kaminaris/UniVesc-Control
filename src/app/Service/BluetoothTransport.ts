/// <reference types="web-bluetooth" />
import { EventEmitter, Injectable }                                   from '@angular/core';
import { Platform }                                                   from '@ionic/angular';
import { BleClient, BleDevice, dataViewToNumbers, numbersToDataView } from '@capacitor-community/bluetooth-le';
import { Subscription }                                               from 'rxjs';

export const Delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable({ providedIn: 'root' })
export class BluetoothTransport {
	static SRD_SERVICE = '9c12d201-cbc3-413b-963b-9e49ff7e7d31';
	static CONTROL_POINT = '9c12d202-cbc3-413b-963b-9e49ff7e7d31';
	static WRITE_POINT = '9c12d203-cbc3-413b-963b-9e49ff7e7d31';
	static DEBUG_POINT = '9c12d204-cbc3-413b-963b-9e49ff7e7d31';

	busy = false;
	bleDevice?: BleDevice;
	device?: BluetoothDevice;
	gattServer?: BluetoothRemoteGATTServer;
	ctrlChar?: BluetoothRemoteGATTCharacteristic;
	writeChar?: BluetoothRemoteGATTCharacteristic;
	debugChar?: BluetoothRemoteGATTCharacteristic;

	lastData: number[] = [];
	emData = new EventEmitter<any>(true);
	emLog = new EventEmitter<number[]>(true);
	emConnected = new EventEmitter<boolean>(true);

	get connected(): boolean {
		return !!(this.bleDevice || this.device);
	}

	get isWebBluetooth() {
		return !this.platform?.is('android') && typeof navigator.bluetooth.getDevices !== 'function';
	}

	constructor(protected platform: Platform) {
	}

	async connect(): Promise<boolean> {
		if (this.isWebBluetooth) {
			await this.listDevices();
			console.log('Connecting Via WebBluetooth');
			return await this.connectViaBrowser();
		}

		console.log('Connecting Via Capacitor');
		return await this.connectViaCapacitor();
	}

	async disconnect() {
		if (this.isWebBluetooth) {
			console.log('Connecting Via WebBluetooth');
			return await this.disconnectViaBrowser();
		}

		console.log('Connecting Via Capacitor');
		return await this.disconnectViaCapacitor();
	}

	async resolver(a?: DataView | any) {
		if (!a) {
			console.log('BROKEN!', a);
			return;
		}

		const data = a.target?.value ? dataViewToNumbers(a.target.value) : dataViewToNumbers(a);
		this.emData.emit(data);
		console.log('we got sumtin', data);
		this.lastData = data;
	};

	async debugResolver(a?: DataView | any) {
		if (!a) {
			console.log('BROKEN!', a);
			return;
		}

		const data = a.target?.value ? dataViewToNumbers(a.target.value) : dataViewToNumbers(a);
		this.emLog.emit(data);
	};

	async connectViaBrowser() {
		if (!this.device) {
			return false;
		}

		this.gattServer = await this.device.gatt!.connect();
		this.device.ongattserverdisconnected = this.onDisconnect.bind(this);

		let btService = await this.gattServer.getPrimaryService(BluetoothTransport.SRD_SERVICE);

		this.ctrlChar = await btService.getCharacteristic(BluetoothTransport.CONTROL_POINT);
		this.ctrlChar.addEventListener('characteristicvaluechanged', this.resolver.bind(this));

		this.debugChar = await btService.getCharacteristic(BluetoothTransport.DEBUG_POINT);
		this.debugChar.addEventListener('characteristicvaluechanged', this.debugResolver.bind(this));

		await this.ctrlChar.startNotifications();
		await this.debugChar.startNotifications();

		this.writeChar = await btService.getCharacteristic(BluetoothTransport.WRITE_POINT);
		console.log(this.ctrlChar, this.writeChar);
		// await this.readPPCPValue(this.ctrlChar);
		// await this.readPPCPValue(this.writeChar);
		await Delay(1000);
		await this.emConnected.emit(true);

		return true;
	}

	async disconnectViaBrowser() {
		if (!this.device) {
			return false;
		}

		this.gattServer?.disconnect();
		this.writeChar = undefined;
		this.ctrlChar = undefined;
		this.gattServer = undefined;
		this.device = undefined;
		await this.emConnected.emit(false);

		return true;
	}

	async connectViaCapacitor() {
		try {
			await BleClient.initialize({
				// androidNeverForLocation: true
			});

			if (this.bleDevice) {
				await this.disconnectViaCapacitor();
			}

			console.log('dos2');
			this.bleDevice = await BleClient.requestDevice({
				services: [BluetoothTransport.SRD_SERVICE]
			});

			// connect to device, the onDisconnect callback is optional
			await BleClient.connect(
				this.bleDevice.deviceId,
				this.onDisconnect.bind(this),
				{ timeout: 5000 }
			);
			console.log('connected to device', this.bleDevice);

			await BleClient.startNotifications(
				this.bleDevice!.deviceId,
				BluetoothTransport.SRD_SERVICE,
				BluetoothTransport.CONTROL_POINT,
				this.resolver.bind(this)
			);

			await Delay(1000);
			await this.emConnected.emit(true);
			return true;
		}
		catch (e) {
			console.log('cannot connect via capacitor', e);
			return false;
		}

	}

	async disconnectViaCapacitor() {
		if (!this.bleDevice) {
			throw new Error('Device not connected');
		}

		try {
			await BleClient.stopEnabledNotifications();
			await BleClient.disconnect(this.bleDevice.deviceId);
			this.bleDevice = undefined;
			await this.emConnected.emit(false);
			return true;
		}
		catch (e) {
			console.log(e);
			return false;
		}
	}

	async requestPermissions(): Promise<boolean> {
		try {
			if (this.isWebBluetooth) {
				return this.connectViaBrowser();
			}

			await BleClient.initialize({
				// androidNeverForLocation: true
			});
		}
		catch (e: any) {

			console.log(e, 'tes asdsadsasd');
			return false;
		}

		return true;
	}

	async listDevices(): Promise<any[] | null> {
		if (this.isWebBluetooth) {
			// made for reconnect purpose on both web and electron
			if (this.platform?.is('electron')) {
				(window as any).bluetoothDeviceList(undefined, []);

				try {
					console.log('DIS');
					console.log('DIS');
					await navigator.bluetooth.requestDevice(
						{
							filters: [{ 'name': 'UART Service' }]
						}
					).then((devices) => {
						(window as any).onBluetoothConnected(devices);
					});

					return [this.device];
				}
				catch (e) {
					return null;
				}
			}

			try {
				console.log('doxxx');
				this.device = await navigator.bluetooth.requestDevice(
					{ filters: [{ 'name': 'UART Service' }], optionalServices: [BluetoothTransport.SRD_SERVICE] }
				);

				return [this.device];
			}
			catch (e) {
				console.log('123 E 123 123 123', e);
				return null;
			}

		}
		console.log('normal bt');

		await this.requestPermissions();
		try {
			this.bleDevice = await BleClient.requestDevice({
				services: [BluetoothTransport.SRD_SERVICE]
			});
		}
		catch (e) {
			console.log(e);
			return [];
		}

		// const list = await BleClient.getDevices([]);
		console.log('BLE DEV', this.bleDevice);
		return [this.bleDevice];
	}

	async write(data: number[]): Promise<boolean> {
		if (this.busy) {
			console.log('Device busy');
			return false;
		}

		this.busy = true;
		if (this.bleDevice) {
			await BleClient.write(
				this.bleDevice!.deviceId,
				BluetoothTransport.SRD_SERVICE,
				BluetoothTransport.WRITE_POINT,
				numbersToDataView(data)
			);
			this.busy = false;
			return true;
		}

		if (this.device) {
			try {
				await this.writeChar!.writeValueWithoutResponse(new Uint8Array(data));
			}
			catch (e) {
				console.log(e);
				this.busy = false;
				return false;
			}

			this.busy = false;
			return true;
		}

		this.busy = false;
		return false;
	}

	async readPPCPValue(characteristic: any) {
		const value = await characteristic.readValue();
		console.log('> Peripheral Preferred Connection Parameters: ');
		console.log('  > Minimum Connection Interval: ' +
			(value.getUint8(0) | value.getUint8(1) << 8) * 1.25 + 'ms');
		console.log('  > Maximum Connection Interval: ' +
			(value.getUint8(2) | value.getUint8(3) << 8) * 1.25 + 'ms');
		console.log('  > Latency: ' +
			(value.getUint8(4) | value.getUint8(5) << 8) + 'ms');
		console.log('  > Connection Supervision Timeout Multiplier: ' +
			(value.getUint8(6) | value.getUint8(7) << 8));
	}

	async exchange(data: number[], timeout: number): Promise<number[]> {
		this.busy = true;

		// console.log('EXCHANGE', data);
		if (this.bleDevice) {
			this.busy = true;
			return new Promise(async (resolve, reject) => {
				let sub: Subscription;
				let timer = window.setTimeout(async () => {
					sub?.unsubscribe();
					reject(new Error('Unable to send data' + JSON.stringify(data)));
					this.busy = false;
				}, timeout);

				const resolver = async (a: number[]) => {
					window.clearTimeout(timer);
					resolve(a);
					sub?.unsubscribe();
					this.busy = false;
				};

				sub = this.emData.subscribe(resolver);

				await BleClient.write(
					this.bleDevice!.deviceId,
					BluetoothTransport.SRD_SERVICE,
					BluetoothTransport.WRITE_POINT,
					numbersToDataView(data)
				);
			});
		}

		if (this.device) {
			return new Promise(async (resolve, reject) => {
				if (!this.ctrlChar || !this.writeChar) {
					this.busy = false;
					reject(null);
					return;
				}
				let sub: Subscription;
				let timer = window.setTimeout(() => {
					sub?.unsubscribe();
					reject(new Error('Unable to send data' + JSON.stringify(data)));
					this.busy = false;
				}, timeout);

				const resolver = async (a: number[]) => {
					console.log('we got', a);
					window.clearTimeout(timer);
					sub?.unsubscribe();
					await Delay(1);
					resolve(a);
					this.busy = false;
				};

				sub = this.emData.subscribe(resolver);
				let retryCount = 0;
				do {
					retryCount++;
					try {
						await this.writeChar.writeValueWithoutResponse(new Uint8Array(data));
						break;
					}
					catch (e) {
						if (retryCount < 5) {
							console.log('Retrying ', retryCount, e);
							await Delay(100);
							continue;
						}

						this.busy = false;
						window.clearTimeout(timer);
						sub?.unsubscribe();
						console.log(e);
						reject(null);
					}
				} while (retryCount < 5);
			});
		}

		this.busy = false;
		throw new Error('Device unavailable');
	}

	async onDisconnect() {
		this.device = undefined;
		this.bleDevice = undefined;
		await this.emConnected.emit(false);
	}

}