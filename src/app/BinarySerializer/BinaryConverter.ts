import { BinaryFieldInfo }     from './Interface/BinaryFieldInfo';
import { ConverterInterface }  from './Interface/ConverterInterface';
import { BinaryDataDirection } from './BinaryDataDirection';

export class BinaryConverter {
	static converters = new Map<string, ConverterInterface>();

	/**
	 * Register a converter, if the converter is already registered, error will be thrown
	 *
	 * @param type
	 * @param converter
	 */
	static registerConverter(type: string, converter: ConverterInterface) {
		if (BinaryConverter.converters.has(type)) {
			throw new Error(`Converter of type: ${ type } is already registered`);
		}

		BinaryConverter.converters.set(type, converter);
	}

	/**
	 * Register a converter. Does nothing if the converter is already registered
	 *
	 * @param type
	 * @param converter
	 */
	static register(type: string, converter: ConverterInterface) {
		if (BinaryConverter.converters.has(type)) {
			return;
		}

		BinaryConverter.converters.set(type, converter);
	}

	static toBinary(value: any, info: BinaryFieldInfo, entity: any): number[] {
		if (!info.array) {
			return BinaryConverter.toBinarySingle(value, info);
		}

		if (!info.arraySize && info.arraySize !== 0) {
			throw new Error(`Array size is not defined`);
		}

		const arraySize = typeof info.arraySize === 'string' ? entity[info.arraySize] : info.arraySize;
		if (!arraySize && arraySize !== 0) {
			throw new Error(`Array size is not defined`);
		}

		const out: number[] = [];
		for (let i = 0; i < arraySize; i++) {
			out.push(...BinaryConverter.toBinarySingle(value[i], info));
		}

		return out;
	}

	static toBinarySingle(value: any, info: BinaryFieldInfo): number[] {
		if (typeof value === 'undefined') {
			if (info.size === 'var') {
				return new Array(1).fill(0); // immediately null terminated string
			} else {
				return new Array(info.size).fill(0);
			}
		}

		if (info.toBinary) {
			return info.toBinary(value, info);
		}

		if (!info.type || !BinaryConverter.converters.has(info.type)) {
			if (typeof info.type === 'undefined') {
				return value;
			}

			throw new Error(`Unrecognized converter type: ${ info.type }`);
		}

		return BinaryConverter.converters.get(info.type)!.toBinary(value, info);
	}

	static toValue(value: number[], info: BinaryFieldInfo, entity: any): any {
		if (!info.array) {
			return BinaryConverter.toValueSingle(value, info);
		}

		if (!info.arraySize && info.arraySize !== 0) {
			throw new Error(`Array size is not defined`);
		}

		const arraySize = typeof info.arraySize === 'string' ? entity[info.arraySize] : info.arraySize;
		if (!arraySize && arraySize !== 0) {
			throw new Error(`Array size is not defined`);
		}

		const out: any[] = [];

		if (info.size === 'var') {
			throw new Error('Array of variable size is not supported');
		} else {
			const cellSize = info.size ?? 1;
			for (let i = 0; i < arraySize; i++) {
				out.push(BinaryConverter.toValueSingle(
					value.slice(i * cellSize, (i + 1) * cellSize),
					info
				));
			}
		}

		return out;
	}

	static toValueSingle(value: number[], info: BinaryFieldInfo): any {
		if (typeof value === 'undefined') {
			return undefined;
		}

		if (info.toValue) {
			return info.toValue(value, info);
		}

		if (!info.type || !BinaryConverter.converters.has(info.type)) {
			if (typeof info.type === 'undefined') {
				return value;
			}

			throw new Error(`Unrecognized converter type: ${ info.type }`);
		}

		return BinaryConverter.converters.get(info.type)!.toValue(value, info);
	}
}