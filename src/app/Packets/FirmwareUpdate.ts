import { BinaryField, BinarySerializable } from '../BinarySerializer';
import { BasePacket }                      from './BasePacket';

export const FirmwareUpdateChunkSize = 450;

@BinarySerializable({ layout: 'sequential' })
export class FirmwareUpdate extends BasePacket {

	override t = 5;

	@BinaryField({ type: 'number', size: 4 })
	chunk: number = 0;

	@BinaryField({ type: 'number', size: 4 })
	chunks: number = 0;

	@BinaryField({ type: 'number', size: 2 })
	size: number = 0;

	@BinaryField({ type: 'number', size: 4 })
	totalSize: number = 0;

	@BinaryField({ type: 'number', size: 4 })
	checksum: number = 0;

	@BinaryField({ type: 'number', size: 1, arraySize: FirmwareUpdateChunkSize, array: true })
	d: number[] = [];
}