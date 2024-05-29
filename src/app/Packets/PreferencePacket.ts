import { PreferenceType } from './BasePacket';
import { BinaryField }    from '../BinarySerializer';

export class PreferencePacket {
	@BinaryField({ size: 4, type: 'number' })
	type: PreferenceType = PreferenceType.PT_I8;

	@BinaryField({ size: 2, type: 'number', unsigned: true })
	length: number = 0;

	@BinaryField({ size: 16, type: 'string' })
	name: string = '';

	@BinaryField({ type: 'number', size: 1, arraySize: 370, array: true })
	value: any;
}