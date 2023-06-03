import { ConverterInterface } from '../Interface/ConverterInterface';
import { BinaryFieldInfo }    from '../Interface/BinaryFieldInfo';

export class NumberConverter implements ConverterInterface {
	defaultSize = 1;

	toBinary(value: any, info: BinaryFieldInfo): any {
		if (info.size === 'var') {
			throw new Error('Float converter does not support variable size');
		}
		const size = info.size ?? this.defaultSize;
		const endian = info.endian ?? 'le';

		const ab = new ArrayBuffer(size);
		const view = new DataView(ab);

		if (info.unsigned) {
			switch (size) {
				case 1:
					view.setUint8(0, value);
					break;
				case 2:
					view.setUint16(0, value, endian === 'le');
					break;
				case 4:
					view.setUint32(0, value, endian === 'le');
					break;
				case 8:
					view.setBigUint64(0, BigInt(value), endian === 'le');
					break;
				default:
					throw new Error('Number byte size invalid, supported options: 1, 2, 4, 8, float, double');
			}
		}
		else {
			switch (size) {
				case 1:
					view.setInt8(0, value);
					break;
				case 2:
					view.setInt16(0, value, endian === 'le');
					break;
				case 4:
					view.setInt32(0, value, endian === 'le');
					break;
				case 8:
					view.setBigInt64(0, BigInt(value), endian === 'le');
					break;
				default:
					throw new Error('Number byte size invalid, supported options: 1, 2, 4, 8');
			}
		}

		return [...new Uint8Array(ab)];
	}

	toValue(value: any, info: BinaryFieldInfo): any {
		if (info.size === 'var') {
			throw new Error('Float converter does not support variable size');
		}
		const size = info.size ?? this.defaultSize;
		const endian = info.endian ?? 'le';

		const view2 = new DataView(new Uint8Array(value).buffer);

		if (info.unsigned) {
			switch (size) {
				case 1:
					return view2.getUint8(0);
				case 2:
					return view2.getUint16(0, endian === 'le');
				case 4:
					return view2.getUint32(0, endian === 'le');
				case 8:
					return view2.getBigUint64(0, endian === 'le');
				default:
					throw new Error('Number byte size invalid, supported options: 1, 2, 4, 8');
			}
		}
		else {
			switch (size) {
				case 1:
					return view2.getInt8(0);
				case 2:
					return view2.getInt16(0, endian === 'le');
				case 4:
					return view2.getInt32(0, endian === 'le');
				case 8:
					return view2.getBigInt64(0, endian === 'le');
				default:
					throw new Error('Number byte size invalid, supported options: 1, 2, 4, 8');
			}
		}
	}
}