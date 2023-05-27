import { Component }          from '@angular/core';
import { BinarySerializer }   from 'binary-serializer-next';
import { Ping }               from '../Packets/Ping';
import { BluetoothTransport } from '../Service/BluetoothTransport';
import { logHex }             from '../Util/hexUtils';

@Component({
	selector: 'real-time-tab',
	templateUrl: 'RealTimeTabPage.html',
})
export class RealTimeTabPage {

	constructor(protected bt: BluetoothTransport) {}

	async searchBt() {
		await this.bt.connect();
	}

	async writeBt() {
		const data = [];
		for (let i = 33; i < 100; i++) {
			data.push(i);
		}
		// await this.bt.write(data);
		const ping = new Ping();
		const b = BinarySerializer.serialize(ping);
		logHex(b!);
		console.log(ping);
	}
}
