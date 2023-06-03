import { BinaryField, BinarySerializable } from '../BinarySerializer';

@BinarySerializable({ layout: 'sequential' })
export class ClockResponse {
	@BinaryField({ type: 'number', size: 2, unsigned: true })
	year: number = 0;

	month: number = 0;
	day: number = 0;
	hour: number = 0;
	minute: number = 0;
	second: number = 0;

	toString() {
		return this.year + '-' + this.month + '-' + this.day + ' ' + this.hour + ':' + this.minute + ':' + this.second;
	}
}