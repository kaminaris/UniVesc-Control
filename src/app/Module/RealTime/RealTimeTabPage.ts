import { Component, OnDestroy, OnInit }          from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RealTimeData }                          from 'src/app/Packets/RealTimeData';
import { BluetoothTransport }           from 'src/app/Service/BluetoothTransport';
import { UniService }                   from 'src/app/Service/UniService';

@Component({
	selector: 'real-time-tab',
	templateUrl: 'RealTimeTabPage.html'
})
export class RealTimeTabPage implements OnInit {
	data = new RealTimeData();

	interval: any;

	constructor(
		protected bt: BluetoothTransport,
		protected uni: UniService,
		protected router: Router
	) {
		this.router.events.subscribe((e) => {
			if (e instanceof NavigationEnd) {
				if (e.url !== '/tabs/real-time') {
					this.stopInterval();
				} else {
					this.startInterval();
				}
			}
		});
		this.startInterval();
	}

	ngOnInit() {
		this.startInterval();
	}

	stopInterval() {
		if (this.interval) {
			window.clearInterval(this.interval);
			this.interval = undefined;
		}
	}

	startInterval() {
		if (!this.interval) {
			this.interval = window.setInterval(async () => {
				if (!this.bt.connected) {
					return;
				}
				this.data = await this.uni.getRealTimeData();
			}, 1000);
		}
	}
}
