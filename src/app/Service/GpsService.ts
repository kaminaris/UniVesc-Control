import { Injectable }                    from '@angular/core';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { Position }                      from '@capacitor/geolocation/dist/esm/definitions';
import { BehaviorSubject }               from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GpsService {
	entries = new BehaviorSubject<Microsoft.Maps.Location[]>([]);

	permissions?: PermissionStatus;
	watchId?: string;

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
		this.entries.value.push(this.convertToMsLocation(position));
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
		await this.requestPermissions();
		const center = await this.getCoordinates();

		this.testInterval = window.setInterval(() => {
			this.entries.value.push(new Microsoft.Maps.Location(
				center.coords.latitude + Math.random(),
				center.coords.longitude + Math.random()
			));
			this.entries.next(this.entries.value);
			console.log('Adding random pos');
		}, 5000);
	}

	async stopRandomTest() {
		if (this.testInterval) {
			window.clearInterval(this.testInterval);
		}
	}

	convertToMsLocation(pos: Position): Microsoft.Maps.Location {
		return new Microsoft.Maps.Location(pos.coords.latitude, pos.coords.longitude);
	}
}