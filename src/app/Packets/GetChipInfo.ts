import { BasePacket, PacketType } from 'src/app/Packets/BasePacket';

export class GetChipInfo extends BasePacket {
	override t = PacketType.GET_CHIP_INFO;
}