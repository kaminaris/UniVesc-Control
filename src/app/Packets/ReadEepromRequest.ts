import { BinaryField, BinarySerializable } from '../BinarySerializer';
import { BasePacket }                      from './BasePacket';

@BinarySerializable({ layout: 'sequential' })
export class ReadEepromRequest extends BasePacket{
	override t = 3;
	@BinaryField({ type: 'number', size: 2 })
	address = 0;
}