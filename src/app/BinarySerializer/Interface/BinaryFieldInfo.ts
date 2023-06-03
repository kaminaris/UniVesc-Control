export interface BinaryFieldInfo {
	/**
	 * Size it takes in bytes
	 */
	size?: number | 'var';

	/**
	 * If this field has specific offset, mutually exclusive with padding
	 */
	offset?: number;

	/**
	 * how much padding does it have vs previous field, mutually exclusive with offset
	 */
	padding?: number

	/**
	 * Endianness for numbers, default is little endian
	 */
	endian?: 'le' | 'be';

	/**
	 * Should we treat numbers as unsigned?
	 */
	unsigned?: boolean;

	/**
	 * Type of field, converters has to be registered in order for this field to even work
	 */
	type?: string;

	/**
	 * Nested class object type or `forwardRef` of that class object
	 */
	nested?: any;

	/**
	 * Indicate that field is an array
	 */
	array?: boolean;

	/**
	 * Amount of elements in array, if there is a previous property that holds array length, use that property
	 */
	arraySize?: number | string;

	/**
	 * For strings, default converter only supports to utf8, if you wish to support other encodings write your own
	 */
	encoding?: string;

	/**
	 * After decoding buffer to string, should we trim nulls from string?
	 */
	stripNulls?: boolean;

	/**
	 * Custom converter function
	 *
	 * @param value - value passed to converter
	 * @param type - `string` passed as type of field
	 */
	toBinary?: (value: any, info: BinaryFieldInfo) => any;

	/**
	 * Custom converter function
	 *
	 * @param value - value passed to converter
	 * @param type - `string` passed as type of field
	 */
	toValue?: (value: ArrayLike<number>, info: BinaryFieldInfo) => any;

	/**
	 * Value will be ignored when coming or going to binary or plain object
	 */
	ignore?: boolean;
}