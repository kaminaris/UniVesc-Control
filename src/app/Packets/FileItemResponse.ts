import { BinaryField, BinarySerializable } from 'src/app/BinarySerializer';

@BinarySerializable({ layout: 'sequential' })
export class FileItemResponse {
	@BinaryField({ size: 4, type: 'number' })
	index: number = 0;

	@BinaryField({ size: 4, type: 'number' })
	size: number = 0;

	@BinaryField({ size: 128, type: 'string', stripNulls: true })
	fileName: string = '';
}