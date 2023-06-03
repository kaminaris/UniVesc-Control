import { BinaryField, BinarySerializable } from 'src/app/BinarySerializer';
import { BasePacket, PacketType }          from 'src/app/Packets/BasePacket';

@BinarySerializable({ layout: 'sequential' })
export class SetVolumeRequest extends BasePacket {
	override t = PacketType.SET_VOLUME;

	@BinaryField({ type: 'number', size: 1 })
	volume: number = 0;

}