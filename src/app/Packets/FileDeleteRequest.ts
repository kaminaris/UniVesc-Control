import { BinaryField, BinarySerializable } from 'src/app/BinarySerializer';
import { BasePacket, PacketType }          from 'src/app/Packets/BasePacket';

@BinarySerializable({ layout: 'sequential' })
export class FileDeleteRequest extends BasePacket {
	override t = PacketType.DELETE_FILE;

	@BinaryField({ size: 128, type: 'string' })
	fileName: string = '';
}