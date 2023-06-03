import { BinarySerializable } from '../BinarySerializer';
import { BasePacket }         from './BasePacket';

@BinarySerializable({ layout: 'sequential' })
export class GetClock extends BasePacket {

	override t = 2;
}