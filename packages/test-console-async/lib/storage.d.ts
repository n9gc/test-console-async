/**
 * Manager of `AsyncLocalStorage`
 * @license MIT
 * @author n9gc
 */
declare module './index.ts';
import type { InspectOption } from './types.ts';
/**
 * Get the current options
 * @returns options
 */
export declare function getOptions(): readonly InspectOption[];
/**
 * Run a function with some new options
 * @param options options to run with
 * @param callback what you want to do
 * @returns the result of the function
 */
export declare function addOptions<T>(options: readonly InspectOption[], callback: () => T): T;
/**
 * Simulate assigning values to `isTTY`
 * Only effective in the current asynchronous context
 * @param isTTY now value of `isTTY`
 * @param name what stream you need to assign
 */
export declare function enterIsTTY(isTTY: boolean, name: 'stdout' | 'stderr'): void;
