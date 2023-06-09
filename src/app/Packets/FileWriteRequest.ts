import { BinaryField, BinarySerializable } from 'src/app/BinarySerializer';
import { BasePacket, PacketType }          from 'src/app/Packets/BasePacket';

@BinarySerializable({ layout: 'sequential' })
export class FileWriteRequest extends BasePacket {
	override t = PacketType.WRITE_FILE;

	@BinaryField({ type: 'string', size: 128 })
	fileName: string = '';

	@BinaryField({ type: 'number', size: 4 })
	position: number = 0;

	@BinaryField({ type: 'number', size: 2 })
	size: number = 0;

	@BinaryField({ type: 'number', size: 4 })
	checksum: number = 0;

	@BinaryField({ type: 'number', array: true, arraySize: 370 })
	d: number[] = [];
}