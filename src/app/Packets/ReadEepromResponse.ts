import { BinaryField, BinarySerializable } from '../BinarySerializer';

@BinarySerializable({ layout: 'sequential' })
export class ReadEepromResponse {
	@BinaryField({ size: 1, arraySize: 128, unsigned: true, type: 'number' })
	data: number[] = [];
}