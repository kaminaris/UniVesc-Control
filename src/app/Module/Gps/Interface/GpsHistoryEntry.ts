import { Position } from '@capacitor/geolocation';

export interface GpsHistoryEntry {
	time: string;
	entries: Position[];
}