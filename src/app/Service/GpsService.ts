import { Injectable }                    from '@angular/core';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { Position }                      from '@capacitor/geolocation/dist/esm/definitions';
import { BehaviorSubject }               from 'rxjs';
import { GpsHistoryEntry }               from 'src/app/Module/Gps/Interface/GpsHistoryEntry';

@Injectable({ providedIn: 'root' })
export class GpsService {
	entries = new BehaviorSubject<Position[]>([]);

	permissions?: PermissionStatus;
	watchId?: string;
	history: GpsHistoryEntry[] = [];

	constructor() {
		const history = localStorage.getItem('gps-history');
		if (history) {
			this.history = JSON.parse(history);
			console.log('Loaded history', this.history);
		}
	}

	saveHistory() {
		for (const e of this.history) {
			e.entries = e.entries.map(v => this.toRawPosition(v));
		}
		console.log('Saving history', this.history);
		localStorage.setItem('gps-history', JSON.stringify(this.history));
	}

	/**
	 * This is needed because js object does not serialize well
	 */
	toRawPosition(pos: Position): Position {
		return {
			timestamp: pos.timestamp,
			coords: {
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude,
				altitude: pos.coords.altitude,
				accuracy: pos.coords.accuracy,
				heading: pos.coords.heading,
				altitudeAccuracy: pos.coords.altitudeAccuracy,
				speed: pos.coords.speed
			}
		};
	}

	async requestPermissions() {
		console.log(this.permissions);
		if (this.permissions?.location === 'granted') {
			return true;
		}

		try {
			this.permissions = await Geolocation.requestPermissions({ permissions: ['location'] });
		}
		catch (e) {
			console.log(e);
		}

		return this.permissions?.location === 'granted';
	}

	watcher(position: Position | null, err?: any) {
		if (err || !position) {
			console.log(err);
			return;
		}
		console.log(position);
		this.entries.value.push(position);
		this.entries.next(this.entries.value);
	}

	async startWatching() {
		await this.requestPermissions();
		this.entries.next([]);
		this.watchId = await Geolocation.watchPosition(
			{ timeout: 1000 * 10, maximumAge: 10 * 1000 },
			this.watcher.bind(this)
		);

	}

	async stopWatching() {
		if (this.watchId) {
			await Geolocation.clearWatch({ id: this.watchId });
		}

		return this.entries;
	}

	async getCoordinates() {
		return await Geolocation.getCurrentPosition();
	}

	testInterval?: number;

	async startRandomTest() {
		this.entries.next([]);
		await this.requestPermissions();
		const center = await this.getCoordinates();

		this.testInterval = window.setInterval(() => {
			this.entries.value.push({
				timestamp: new Date().getDate() / 1000,
				coords: {
					latitude: center.coords.latitude + Math.random() / 100,
					longitude: center.coords.longitude + Math.random() / 100,
					accuracy: 1,
					speed: null,
					heading: null,
					altitude: null,
					altitudeAccuracy: null
				}
			});
			this.entries.next(this.entries.value);
			console.log('Adding random pos');
		}, 5000);
	}

	async stopRandomTest() {
		if (this.testInterval) {
			window.clearInterval(this.testInterval);
			return this.entries;
		}

		return null;
	}

	convertToMsLocation(pos: Position): Microsoft.Maps.Location {
		return new Microsoft.Maps.Location(pos.coords.latitude, pos.coords.longitude);
	}
}