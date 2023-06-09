import { BinarySerializable } from 'src/app/BinarySerializer';
import { PacketType }         from 'src/app/Packets/BasePacket';
import { PlayRequest }        from 'src/app/Packets/PlayRequest';

@BinarySerializable({ layout: 'sequential' })
export class FileDeleteRequest extends PlayRequest {
	override t = PacketType.DELETE_FILE;
}