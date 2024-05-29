import { ConverterInterface } from '../Interface/ConverterInterface';
import { BinaryFieldInfo }    from '../Interface/BinaryFieldInfo';

export class StringConverter implements ConverterInterface {
	defaultSize = 1;
	encoder = new TextEncoder();
	decoder = new TextDecoder();

	toBinary(value: any, info: BinaryFieldInfo): any {
		const out = [...this.encoder.encode(value)];
		if (info.size && info.size !== 'var') {

			// String is longer than space for it
			if (info.size < out.length) {
				const r = out.slice(0, info.size);
				// last byte has to be zero
				r[r.length - 1] = 0;
				return r;
			}

			// String is shorter than space, fill remaining with zeros
			if (info.size > out.length) {
				const origLength = out.length;
				out.length = info.size;
				out.fill(0, origLength);
			}

			// Make sure last byte is zero regardless
			out[out.length - 1] = 0;
		}
		else {
			// null terminated string
			out.push(0);
		}

		return out;
	}

	toValue(value: any, info: BinaryFieldInfo): any {
		const uiArray = value instanceof Uint8Array || value instanceof ArrayBuffer ? value : new Uint8Array(value);
		const str = this.decoder.decode(uiArray);

		if (info.stripNulls) {
			const firstNull = str.indexOf('\x00');
			if (firstNull >= 0) {
				return str.substr(0, firstNull);
			}
		}

		return str;
	}

}
