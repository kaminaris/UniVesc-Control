import { BinaryFieldInfo } from './BinaryFieldInfo';

export interface ConverterInterface {
	defaultSize: number;

	toBinary(value: any, info: BinaryFieldInfo): number[];

	toValue(value: any, info: BinaryFieldInfo): any;
}