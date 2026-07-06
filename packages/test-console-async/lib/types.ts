/**
 * Type definations
 * @license MIT
 * @author n9gc
 */
declare module './types.ts';

/**Interceptor of stdout/stderr */
export type Interceptor = (
	/**The data currently being written to stderr/stdout */
	data: string | Uint8Array,
	/**
	 * The original `write` function of stderr/stdout.
	 *
	 * If already in an inspection, this function acts as the `Interceptor`
	 * for that inspection.
	 *
	 * Returns `true` if the entire data was flushed successfully to the kernel buffer.
	 * Returns `false` if all or part of the data was queued in user memory
	 * or the output was suppressed.
	 *
	 * To avoid infinite recursion, use this function to output to the console.
	 */
	// eslint-disable-next-line unicorn/consistent-boolean-name
	write: (data: string | Uint8Array) => boolean,
) => void;

/**What do you want to do during the inspection */
export interface InspectOption {
	/**
	 * Modified `process.stdout.isTTY` or `process.stderr.isTTY`.
	 *
	 * If left blank, it will use the value from external inspection (if any)
	 * or the original value.
	 */
	readonly isTTY?: boolean | {
		/**Modified `process.stdout.isTTY` */
		readonly stdout?: boolean;
		/**Modified `process.stderr.isTTY` */
		readonly stderr?: boolean;
	};
	/**
	 * Interceptor of stdout
	 *
	 * If the `write` function is not called in the interceptor,
	 * the output will be suppressed
	 */
	readonly stdout?: Interceptor;
	/**
	 * Interceptor of stderr
	 *
	 * If the `write` function is not called in the interceptor,
	 * the output will be suppressed
	 */
	readonly stderr?: Interceptor;
}

