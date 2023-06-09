import { BinaryField, BinarySerializable } from '../BinarySerializer';
import { BasePacket }                      from './BasePacket';

@BinarySerializable({ layout: 'sequential' })
export class Ping extends BasePacket {
	override t = 1;

	@BinaryField({ type: 'number' })
	r = 128;
}