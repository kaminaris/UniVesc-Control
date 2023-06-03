import { BinaryField, BinarySerializable } from 'src/app/BinarySerializer';
import { BasePacket, PacketType }          from 'src/app/Packets/BasePacket';

@BinarySerializable({ layout: 'sequential' })
export class FileReadRequest extends BasePacket {
	override t = PacketType.GET_FILE;

	@BinaryField({ size: 4, type: 'number' })
	position: number = 0;

	@BinaryField({ size: 128, type: 'string' })
	fileName: string = '';
}