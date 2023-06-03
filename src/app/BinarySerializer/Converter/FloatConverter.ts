import { BinaryFieldInfo }    from '../Interface/BinaryFieldInfo';
import { ConverterInterface } from '../Interface/ConverterInterface';

export class FloatConverter implements ConverterInterface {
	defaultSize = 4;

	toBinary(value: any, info: BinaryFieldInfo): any {
		if (info.size === 'var') {
			throw new Error('Float converter does not support variable size');
		}
		const size = info.size ?? this.defaultSize;
		const endian = info.endian ?? 'le';

		const ab = new ArrayBuffer(size);
		const view = new DataView(ab);

		switch (size) {
			case 4:
				view.setFloat32(0, value, endian === 'le');
				break;
			case 8:
				view.setFloat64(0, value, endian === 'le');
				break;
			default:
				throw new Error('Number byte size invalid, supported options: 4, 8');
		}

		return [...new Uint8Array(ab)];
	}

	toValue(value: ArrayLike<number>, info: BinaryFieldInfo): any {
		if (info.size === 'var') {
			throw new Error('Float converter does not support variable size');
		}
		const size = info.size ?? this.defaultSize;
		const endian = info.endian ?? 'le';

		const view = new DataView(new Uint8Array(value).buffer);
		switch (size) {
			case 4:
				return view.getFloat32(0, endian === 'le');
			case 8:
				return view.getFloat64(0, endian === 'le');
			default:
				throw new Error('Number byte size invalid, supported options: 4, 8');
		}
	}
}