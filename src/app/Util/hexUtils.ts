export function logHex(numbers: number[], split = true) {
	let data: string[] = [];
	for (const n of numbers) {
		data.push(n.toString(16).toUpperCase());
	}

	console.log(data.join(split ? ' ' : ''));
}