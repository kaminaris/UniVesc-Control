import { Component }          from '@angular/core';
import { BluetoothTransport } from 'src/app/Service/BluetoothTransport';

@Component({
	selector: 'connection-status',
	template: `
		<ion-badge [color]="connected ? 'success' : 'danger'">
			{{ connected ? 'Connected' : 'Disconnected' }}
		</ion-badge>
		<ion-button (click)="connect()">connect</ion-button>
	`
})
export class ConnectionStatusComponent {
	connected = false;

	constructor(protected bt: BluetoothTransport) {
		bt.emConnected.subscribe((v) => {
			this.connected = v;
		});
	}

	async connect() {
		await this.bt.connect();
	}
}