/**
 * Another version of test-console
 * using AsyncLocalStorage to prevent race condition
 * @license MIT
 * @author n9gc
 */
declare module './index.ts';
export * from './types.ts';
import type { InspectOption } from './types.ts';
/**
 * Inspect stdout/stderr while the `operation` is running
 * @param operation the operation you want to run, sync or async
 * @param [inspectOption={}] the option for the inspection
 * @returns the result of the `operation`
 */
export declare function inspect<T>(operation: () => T, inspectOption?: InspectOption): T;
/**
 * Suppresse a function, make it quiet
 * @param operation the operation to be suppressed, sync or async
 * @returns the result of the `operation`
 */
export declare function ignore<T>(operation: () => T): T;
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
 * @param [inspectOption={}] the option for the inspection,
 * or `false` if you want to suppresse the output of the `operation`
 * @returns the result of the `operation` and outputs resotred
 */
export declare function restore<T>(operation: () => Promise<T>, inspectOption?: InspectOption | false): Promise<Restored<T>>;
