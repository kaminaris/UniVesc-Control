import { BinaryField, BinarySerializable } from 'src/app/BinarySerializer';

@BinarySerializable({ layout: 'sequential' })
export class FileContentResponse {
	@BinaryField({ type: 'number', size: 4 })
	position: number = 0;

	@BinaryField({ type: 'number', size: 2 })
	size: number = 0;

	@BinaryField({ type: 'number', size: 4 })
	totalSize: number = 0;

	@BinaryField({ type: 'number', size: 1, arraySize: 256, array: true })
	d: number[] = [];
}