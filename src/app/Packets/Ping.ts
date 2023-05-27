import { BinaryField, BinarySerializable } from 'binary-serializer-next';

@BinarySerializable({ layout: 'sequential' })
export class Ping {
	@BinaryField({ type: 'string', size: 8, stripNulls: true })
	data = 'ping';
}