import { BinaryField, BinarySerializable } from 'src/app/BinarySerializer';
import { BasePacket, PacketType }          from 'src/app/Packets/BasePacket';

@BinarySerializable({ layout: 'sequential' })
export class PlayRequest extends BasePacket {
	override t = PacketType.PLAY;

	@BinaryField({ size: 128, type: 'string' })
	fileName: string = '';
}