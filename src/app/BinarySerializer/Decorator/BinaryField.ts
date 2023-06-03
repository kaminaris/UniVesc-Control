import { BinaryFieldInfo } from '../Interface/BinaryFieldInfo';

export function BinaryField(opts: BinaryFieldInfo) {
	return (target: any, propertyKey: string | symbol) => {
		const allMetadata = Reflect.getMetadata('BinaryField', target) || {};

		/**
		 * Make copy of metadata
		 * https://github.com/rbuckton/reflect-metadata/issues/53
		 */
		const newMetadata: any = {};
		for (const key of Object.keys(allMetadata)) {
			newMetadata[key] = allMetadata[key];
		}

		/**
		 * Add and register new metadata
		 */
		newMetadata[propertyKey] = opts;
		Reflect.defineMetadata('BinaryField', newMetadata, target);
	};
}