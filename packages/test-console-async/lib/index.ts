/**
 * Another version of test-console
 * using AsyncLocalStorage to prevent race condition
 * @license MIT
 * @author n9gc
 */
declare module './index.ts';

export * from './types.ts';

import { addOptions, getOptions } from './storage.ts';
import type { InspectOption } from './types.ts';

/**
 * Hijack `process.stderr` and `process.stdout`
 *
 * - Modify `stream.isTTY`
 * - Take over `stream.write`
 */
function hijack() {
	if (hijack.wasHijacked) return;
	hijack.wasHijacked = true;
	for (const name of ['stdout', 'stderr'] as const) {
		const isTTYOriginal = process[name].isTTY;
		Object.defineProperty(process[name], 'isTTY', {
			get: (): boolean => getOptions()
				.map(option => option.isTTY)
				.map(n => (typeof n === 'object' ? n[name] : n))
				.find(n => n !== void 0)
				?? isTTYOriginal,
		});
		const writeOriginal = process[name].write;
		process[name].write = (
			data: string | Uint8Array,
			encoding?: ((error?: Error | null) => void) | BufferEncoding,
			callback?: (error?: Error | null) => void,
		) => {
			if (typeof encoding !== 'string') {
				callback = encoding;
				encoding = void 0;
			}
			let wasFlushed = false;
			const interceptor = getOptions()
				.map(option => option[name])
				.filter(n => n !== void 0)
				.reduceRight<(data: string | Uint8Array) => boolean>(
					(write, interceptor) => data => {
						interceptor(data, write);
						return wasFlushed;
					},
					(data: string | Uint8Array) => {
						return wasFlushed = writeOriginal(data, encoding, callback);
					},
				);
			interceptor(data);
			return wasFlushed;
		};
	}
}
declare namespace hijack {
	/**Flag to prevent run twice */
	let wasHijacked: true | undefined;
}

/**
 * Inspect stdout/stderr while the `operation` is running
 * @param operation the operation you want to run, sync or async
 * @param [inspectOption={}] the option for the inspection
 * @returns the result of the `operation`
 */
export function inspect<T>(
	operation: () => T,
	inspectOption: InspectOption = {},
): T {
	hijack();
	return addOptions([inspectOption], operation);
}

/**The return value of {@link restore}*/
export interface Restored<T> {
	/**The result of the operation */
	result: T;
	/**The output resotred from stderr */
	stderr: (string | Uint8Array)[];
	/**The output resotred from stdout */
	stdout: (string | Uint8Array)[];
}
/**
 * Inspect stdout/stderr and restore the output for an async `operation`
 * @param operation the operation you want to run
 * @param [inspectOption={}] the option for the inspection
 * @returns the result of the `operation` and outputs resotred
 */
export async function restore<T>(
	operation: () => Promise<T>,
	inspectOption: InspectOption = {},
): Promise<Restored<T>> {
	hijack();
	const stderr: (string | Uint8Array)[] = [];
	const stdout: (string | Uint8Array)[] = [];
	const result = await addOptions([{
		stderr(data, write) {
			stderr.push(data);
			write(data);
		},
		stdout(data, write) {
			stdout.push(data);
			write(data);
		},
	}, inspectOption], operation);
	return { stderr, stdout, result };
}

/**
 * Suppresse a function, make it quiet
 * @param operation the operation to be suppressed, sync or async
 * @returns the result of the `operation`
 */
export function ignore<T>(operation: () => T) {
	return inspect(operation, {
		isTTY: false,
		stderr: () => void 0,
		stdout: () => void 0,
	});
}


