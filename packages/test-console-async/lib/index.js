export * from "./types.js";
import { addOptions, enterIsTTY, getOptions } from "./storage.js";
/**
 * Hijack `process.stderr` and `process.stdout`
 *
 * - Modify `stream.isTTY`
 * - Take over `stream.write`
 */
function hijack() {
    if (hijack.wasHijacked)
        return;
    hijack.wasHijacked = true;
    for (const name of ['stdout', 'stderr']) {
        const isTTYOriginal = process[name].isTTY;
        Object.defineProperty(process[name], 'isTTY', {
            get: () => (getOptions()
                .filter(option => 'isTTY' in option)
                .map(option => option.isTTY)
                .map(n => (typeof n === 'object' ? n : { [name]: n }))
                .find(n => name in n)
                ?? { [name]: isTTYOriginal })[name],
            set: (isTTY) => enterIsTTY(isTTY, name),
        });
        const writeOriginal = process[name].write.bind(process[name]);
        process[name].write = (data, encoding, callback) => {
            if (typeof encoding !== 'string') {
                callback = encoding;
                encoding = void 0;
            }
            let wasFlushed = false;
            const interceptor = getOptions()
                .map(option => option[name])
                .filter(n => n !== void 0)
                .reduceRight((write, interceptor) => data => {
                interceptor(data, write);
                return wasFlushed;
            }, (data) => {
                return wasFlushed = writeOriginal(data, encoding, callback);
            });
            interceptor(data);
            return wasFlushed;
        };
    }
}
/**
 * Inspect stdout/stderr while the `operation` is running
 * @param operation the operation you want to run, sync or async
 * @param [inspectOption={}] the option for the inspection
 * @returns the result of the `operation`
 */
export function inspect(operation, inspectOption = {}) {
    hijack();
    return addOptions([inspectOption], operation);
}
/**Option to ignore all output */
const ignoreOption = {
    isTTY: false,
    stderr: () => void 0,
    stdout: () => void 0,
};
/**
 * Suppresse a function, make it quiet
 * @param operation the operation to be suppressed, sync or async
 * @returns the result of the `operation`
 */
export function ignore(operation) {
    return inspect(operation, ignoreOption);
}
/**
 * Inspect stdout/stderr and restore the output for an async `operation`
 * @param operation the operation you want to run
 * @param [inspectOption={}] the option for the inspection,
 * or `false` if you want to suppresse the output of the `operation`
 * @returns the result of the `operation` and outputs resotred
 */
export async function restore(operation, inspectOption = false) {
    hijack();
    const stderr = [];
    const stdout = [];
    const result = await addOptions([
        {
            stderr(data, write) {
                stderr.push(data);
                write(data);
            },
            stdout(data, write) {
                stdout.push(data);
                write(data);
            },
        },
        inspectOption || ignoreOption,
    ], operation);
    return { stderr, stdout, result };
}
