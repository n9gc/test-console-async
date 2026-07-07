import './lib/storage.test.ts';
import { restore } from './lib/index.ts';

export async function hh() {
	const r = restore(async () => {
		console.log(123);
		console.log(321);
		await new Promise(resolve => setTimeout(resolve, 1000));
		console.error(9999);
	});

	console.log(0);
	await new Promise(resolve => setTimeout(resolve, 500));
	console.log(666);

	console.log(await r);
}

