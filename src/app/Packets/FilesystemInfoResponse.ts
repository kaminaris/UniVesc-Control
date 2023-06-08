import { BinaryField, BinarySerializable } from 'src/app/BinarySerializer';

@BinarySerializable({ layout: 'sequential' })
export class FilesystemInfoResponse {

	@BinaryField({ size: 4, type: 'number' })
	totalBytes: number = 0;

	@BinaryField({ size: 4, type: 'number' })
	usedBytes: number = 0;
}