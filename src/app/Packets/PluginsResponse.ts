import { BinaryField, BinarySerializable } from 'src/app/BinarySerializer';
import { ResponseCode }                    from './BasePacket';

@BinarySerializable({ layout: 'sequential' })
export class PluginsResponse {
	@BinaryField({ type: 'number', size: 1 })
	code: ResponseCode = 0;

	@BinaryField({ size: 370, type: 'string', stripNulls: true })
	plugins: string = '';
}