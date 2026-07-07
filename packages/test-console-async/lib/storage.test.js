import { test } from 'tape';
import { addOptions, getOptions } from "./storage.js";
test('storage success', t => {
    const option = {};
    const flag = Symbol();
    const result = addOptions([option], () => {
        const options = getOptions();
        t.equal(options.at(0), option, 'Can get the storage');
        return flag;
    });
    t.deepEqual([], getOptions(), 'Cannot get the storage anymore');
    t.equal(flag, result, 'Can return true value');
    t.end();
});
test('storage sorted', t => {
    const outer = {};
    const inner = {};
    addOptions([outer], () => {
        addOptions([inner], () => {
            const [o1, o2, ...o] = getOptions();
            t.equal(o1, inner, 'sorted');
            t.equal(o2, outer, 'sorted');
            t.deepEqual([], o, 'no more');
        });
        const [o1, ...o] = getOptions();
        t.equal(outer, o1, 'clean');
        t.deepEqual([], o, 'no more');
    });
    t.deepEqual([], getOptions(), 'clean');
    t.end();
});
