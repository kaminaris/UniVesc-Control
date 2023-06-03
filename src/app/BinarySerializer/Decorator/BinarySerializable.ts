import { ClassBinaryOptions } from '../Interface/ClassBinaryOptions';

export function BinarySerializable(opts: ClassBinaryOptions) {
	return (constructor: any) => {
		Reflect.defineMetadata('BinarySerializable', opts, constructor);
	};
}