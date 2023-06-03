export interface ClassBinaryOptions {
	/**
	 * How the binary layout should be de/serialized, `sequential` is default
	 */
	layout?: 'sequential' | 'explicit' | 'dynamic';

	/**
	 * Default endianness for numbers, default is little endian
	 */
	defaultEndian?: 'le' | 'be';

	/**
	 * Default amount of bytes for numbers, 1 byte is default if not set
	 */
	defaultSize?: number;

	/**
	 * If not specified, should we treat all numbers as unsigned, default is false
	 */
	defaultUnsigned?: boolean;

	/**
	 * What is the default field type, if not set, we use `number`
	 */
	defaultType?: string;
}