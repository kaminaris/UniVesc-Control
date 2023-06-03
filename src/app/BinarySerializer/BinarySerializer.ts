import 'reflect-metadata';

import { BinaryFieldInfo }     from './Interface/BinaryFieldInfo';
import { ClassBinaryOptions }  from './Interface/ClassBinaryOptions';
import { BinaryDataDirection } from './BinaryDataDirection';
import { BinaryConverter }     from './BinaryConverter';

function upperCaseFirst(s: string) {
	return s.substr(0, 1).toUpperCase() + s.substr(1);
}

/**
 * Main serializer class.
 */
export class BinarySerializer {
	/**
	 * Maximum level of nesting for dehydration, useful for objects with circular references
	 */
	public static MaxNesting = 10;

	/**
	 * Should we warn about exceeding nesting level?
	 */
	public static WarnNesting = false;

	/**
	 * Sets a single property to entity, respects setters ex 'someProp'
	 * will try to check if function `setSomeProp` exists
	 *
	 * @param entity class object
	 * @param prop property name
	 * @param value property value
	 */
	static setProperty(entity: unknown, prop: string, value: unknown): void;
	static setProperty(entity: any, prop: string, value: any) {
		const setter = 'set' + upperCaseFirst(prop);
		if (entity[setter]) {
			entity[setter](value);
		}
		else {
			entity[prop] = value;
		}

		return entity;
	}

	/**
	 * Gets a single property from entity, respects getters ex 'someprop'
	 * will try to check if function `getSomeProp` exists
	 *
	 * @param entity class object
	 * @param prop property name
	 */
	static getProperty(entity: unknown, prop: string): void;
	static getProperty(entity: any, prop: string) {
		const getter = 'get' + upperCaseFirst(prop);
		if (entity[getter]) {
			return entity[getter]();
		}
		else {
			return entity[prop];
		}
	}

	/**
	 * Gets a class properties, those properties either had to be intialized with a value or decorated
	 * with {@link BinaryField}
	 *
	 * @param entity object of some class
	 */
	static getClassProperties(entity: any) {
		const fieldTypes = Reflect.getMetadata('BinaryField', entity);
		const keys = Object.keys(entity);

		for (const customKey in fieldTypes) {
			if (!Object.prototype.hasOwnProperty.call(fieldTypes, customKey)) {
				continue;
			}

			if (keys.indexOf(customKey) > -1) {
				continue;
			}

			keys.push(customKey);
		}

		return keys;
	}

	static copyInto(source: number[], destination: number[], index = 0, length = source.length) {
		// destination is too short, fill with zeros
		if (destination.length - 1 < index + length) {
			destination.push(...new Array(index + length - destination.length).fill(0));
		}

		for (let i = 0; i < length; i++) {
			destination[index + i] = source[i];
		}
	}

	static getBinaryFieldInfo(
		classInfo: ClassBinaryOptions,
		info: Partial<BinaryFieldInfo> | undefined
	): BinaryFieldInfo {
		if (!info) {
			info = {};
		}

		if (!info.size) {
			info.size = classInfo.defaultSize ?? 1;
		}

		if (!info.type) {
			info.type = classInfo.defaultType ?? 'number';
		}

		if (!info.endian) {
			info.endian = classInfo.defaultEndian ?? 'le';
		}

		if (typeof info.unsigned === 'undefined') {
			info.unsigned = classInfo.defaultUnsigned ?? false;
		}

		return info;
	}

	/**
	 * Converts entity class to binary data
	 *
	 * @param entity object of some class
	 */
	static serialize(
		entity: any
	): number[] | null | undefined {
		if (entity === null) {
			return null;
		}

		if (entity === undefined) {
			return undefined;
		}

		const classInfo: ClassBinaryOptions = Reflect.getMetadata(
			'BinarySerializable',
			entity.constructor
		) || {};

		const layout = classInfo.layout ?? 'sequential';

		const result: number[] = [];
		const binaryInfos = Reflect.getMetadata('BinaryField', entity);
		const keys = BinarySerializer.getClassProperties(entity);

		let workIndex = 0;
		for (const key of keys) {
			let value: any = BinarySerializer.getProperty(entity, key);

			const binaryInfo = BinarySerializer.getBinaryFieldInfo(classInfo, binaryInfos[key]);

			if (binaryInfo.ignore === true) {
				continue;
			}

			if (binaryInfo.nested) {
				if (typeof value === 'undefined') {
					continue;
				}

				if (binaryInfo.array) {
					value = BinarySerializer.serializeArray(value);
				}
				else {
					value = BinarySerializer.serialize(value);
				}
			}
			else {
				value = BinaryConverter.toBinary(value, binaryInfo, entity);
			}

			workIndex += binaryInfo.padding ?? 0;

			BinarySerializer.copyInto(value, result, workIndex, value.length);
			if (layout === 'sequential' || layout === 'dynamic') {
				workIndex += value.length;
			}
		}

		return result;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Serializes array of classes back to binary stream
	 *
	 * @param entities object of some class
	 */
	static serializeArray<T>(
		entities: T[]
	) {
		const out = [];
		for (const entity of entities) {
			const data = BinarySerializer.serialize(entity);
			if (!data) {
				throw new Error('Cannot serialize entity in array');
			}
			out.push(...data);
		}

		return out;
	}

	/**
	 * Converts binary data into it's class representation
	 *
	 * @param entity object of some class
	 * @param data data to insert into new class
	 * @param x internal work index object, do not set manually unless you wish to see where serializer finished or
	 * you want to set initial offset yourself
	 */
	static deserialize<T>(
		entity: Exclude<T, Function> | (new() => T),
		data: number[],
		x = { workIndex: 0 }
	): T {
		if (typeof entity === 'function') {
			entity = new (entity as any)() as Exclude<T, Function>;
		}

		const classInfo: ClassBinaryOptions = Reflect.getMetadata(
			'BinarySerializable',
			(entity as any).constructor
		) || {};

		const layout = classInfo.layout ?? 'sequential';

		const binaryInfos = Reflect.getMetadata('BinaryField', entity as any);
		const keys = BinarySerializer.getClassProperties(entity);

		for (const key of keys) {
			let value;

			const binaryInfo = BinarySerializer.getBinaryFieldInfo(classInfo, binaryInfos[key]);

			if (binaryInfo.ignore === true) {
				continue;
			}

			const offset = binaryInfo.offset ? binaryInfo.offset : x.workIndex + (binaryInfo.padding ?? 0);
			let size = 1;
			let cutData: number[];

			if (binaryInfo.size === 'var') {
				cutData = data.slice(offset);
			}
			else {
				size = binaryInfo.size ?? 1;
				if (binaryInfo.arraySize) {
					size *=
						typeof binaryInfo.arraySize === 'string'
						? (entity as any)[binaryInfo.arraySize]
						: binaryInfo.arraySize;
				}
				cutData = data.slice(offset, offset + size);
			}

			if (binaryInfo.nested) {
				if (typeof data[x.workIndex] === 'undefined') {
					continue;
				}

				const nestedType = binaryInfo.nested.prototype ? binaryInfo.nested : binaryInfo.nested();

				if (binaryInfo.array) {
					const arraySize =
						typeof binaryInfo.arraySize === 'string'
						? (entity as any)[binaryInfo.arraySize]
						: binaryInfo.arraySize;

					if (!arraySize && arraySize !== 0) {
						throw new Error('Array size is not defined');
					}

					value = BinarySerializer.deserializeArray(nestedType, data, arraySize, x);
				}
				else {
					value = BinarySerializer.deserialize(nestedType, data, x);
				}

				// We do not increase size here because child deserialize takes care of work index manually
				size = 0;
			}
			else {
				value = BinaryConverter.toValue(cutData, binaryInfo, entity);
				// TODO: implement different values not just null terminated strings
				if (binaryInfo.size === 'var') {
					size = value.length + 1;
				}
			}

			x.workIndex += size;

			// do not set undefined variables on partial data
			if (typeof value === 'undefined') {
				continue;
			}

			BinarySerializer.setProperty(entity, key, value);
		}

		return entity as T;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Converts array of bytes to array of classes
	 *
	 * @param entityClass object of some class
	 * @param data array of data to pass
	 * @param arraySize
	 * @param x internal work index object, do not set manually unless you wish to see where serializer finished or
	 * you want to set initial offset yourself
	 */
	static deserializeArray<T>(
		entityClass: new () => T,
		data: number[],
		arraySize: number,
		x = { workIndex: 0 }
	): T[] {

		const result: T[] = [];
		for (let i = 0; i < arraySize; i++) {
			result.push(BinarySerializer.deserialize<T>(entityClass, data, x));
		}

		return result;
	}
}