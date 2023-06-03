/**
 * Used when you wish to reference class which does not exist yet or has circular dependencies
 * @example
 * ```ts
 * class Car {
 *	name: string = '';
 *	@FieldType({ nested: forwardRef(() => CarPrototype) })
 *	prototype: CarPrototype;
 *}
 *
 *class CarPrototype {
 *	name: string = '';
 *
 *	@FieldType({ nested: forwardRef(() => Car), array: true })
 *	cars: Car[];
 *}
 * ```
 * @param type - anonymous function returning class type
 */
export function forwardRef<T>(type: () => (new () => T)): () => (new () => T) {
	return type;
}