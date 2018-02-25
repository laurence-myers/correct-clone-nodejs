import * as assert from 'assert';
import * as crypto from 'crypto';

const cclone = require('..');

// const NODE_VERSION = process.version.replace(/v([\d]+)\..*/, '$1');

describe('correct-clone-nodejs unit tests', () => {
    it('should clone a POJO object', () => {
        const src = {
            foo: 'bar',
            bar: {
                baz: {
                    qux: 'qux'
                }
            },
            qux: [1, 'foo', 3.14, { bar: 'baz' }]
        };

        const target = cclone(src);

        assert.deepEqual(src, target);
        assert.notStrictEqual(src, target);
        assert.notStrictEqual(src.bar, target.bar);
        assert.notStrictEqual(src.bar.baz, target.bar.baz);
    });

    it('should carry over circular references', () => {
        interface ISrc {
            foo? : string;
            bar? : ISrc;
            baz? : ISrc;
        }
        const src : ISrc = {
            foo: 'bar',
            bar: {}
        };

        src.bar!.baz = src;

        const target = cclone(src);

        /*
          cannot do a deepEqual on node v5 as it ends up
          in a stack overflow, looping over the circular
          references
         */
        assert.notStrictEqual(src, target);
        assert.equal(src.foo, target.foo);
        assert.strictEqual(target.bar.baz, target);
        assert.notStrictEqual(target.bar.baz, src);
    });

    it('should return the provided argument if it is not an object', () => {
        for (const arg of [undefined, null, 3.14, 123, 'foobar']) {
            assert.strictEqual(arg, cclone(arg));
        }
    });

    it('scalar values', () => {
        const src = {
            str: 'foobar',
            int: 123,
            float: 3.14,
            bool: false,
            nil: null,
            undef: undefined
        };

        const cloned = cclone(src);

        assert.deepEqual(src, cloned);

        for (const key of Object.keys(src)) {
            assert.strictEqual(src[key as keyof typeof src], cloned[key]);
        }
    });

    it('clone/copy: Map', () => {
        const src = {
            foo: 'bar',
            bar: 123,
            baz: new Map([[1, 2], [2, 3], [3, 4]])
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);

        // no spread operator in Node v4 :-(
        assert.equal(src.baz.size, copied.baz.size);
        const itcopied = src.baz.entries();
        for (const [originalKey, originalValue] of src.baz.entries()) {
            const [copiedKey, copiedValue] = itcopied.next().value;
            assert.deepEqual(originalKey, copiedKey);
            assert.deepEqual(originalValue, copiedValue);
        }
    });

    it('clone/copy: class extending Map', () => {
        let customMethodWasCalled = false;

        class CustomMap<K, V> extends Map<K, V> {
            public readonly myCustomProperty = 'someValue';

            constructor(iterable? : [K, V][]) {
                super(iterable);
            }

            get(key : K) {
                customMethodWasCalled = true;
                return super.get(key);
            }
        }

        const src = {
            foo: 'bar',
            bar: 123,
            baz: new CustomMap([[1, 2], [2, 3], [3, 4]])
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);

        // no spread operator in Node v4 :-(
        assert.equal(src.baz.size, copied.baz.size);
        const itcopied = src.baz.entries();
        for (const [originalKey, originalValue] of src.baz.entries()) {
            const [copiedKey, copiedValue] = itcopied.next().value;
            assert.deepEqual(originalKey, copiedKey);
            assert.deepEqual(originalValue, copiedValue);
        }

        copied.baz.get('anything');

        assert.strictEqual(src.baz.myCustomProperty, copied.baz.myCustomProperty);
        assert.strictEqual(src.baz.get, copied.baz.get);
        assert.ok(customMethodWasCalled);
    });

    it('clone/copy: Set', () => {
        const src = {
            foo: 'bar',
            bar: 123,
            baz: new Set([1, 2, 3, 4, 5])
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);

        // no spread operator in Node v4 :-(
        assert.equal(src.baz.size, copied.baz.size);
        const itcopied = src.baz.values();
        for (const original of src.baz.values()) {
            assert.deepEqual(original, itcopied.next().value);
        }
    });

    it('clone/copy: class extending Set', () => {
        let customMethodWasCalled = false;

        class CustomSet<V> extends Set<V> {
            public readonly myCustomProperty = 'someValue';

            constructor(iterable? : V[]) {
                super(iterable);
            }

            has(key : V) {
                customMethodWasCalled = true;
                return super.has(key);
            }
        }

        const src = {
            foo: 'bar',
            bar: 123,
            baz: new CustomSet([1, 2, 3, 4, 5])
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);

        // no spread operator in Node v4 :-(
        assert.equal(src.baz.size, copied.baz.size);
        const itcopied = src.baz.values();
        for (const original of src.baz.values()) {
            assert.deepEqual(original, itcopied.next().value);
        }

        copied.baz.has('anything');

        assert.strictEqual(src.baz.myCustomProperty, copied.baz.myCustomProperty);
        assert.strictEqual(src.baz.has, copied.baz.has);
        assert.ok(customMethodWasCalled);
    });

    it('clone/copy: Buffer', () => {
        const src = {
            foo: 'bar',
            bar: 123,
            baz: crypto.randomBytes(12)
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);

        assert.equal(src.baz.length, copied.baz.length);
        assert.deepEqual(src.baz, copied.baz);
    });

    xit('clone/copy: Float64Array', () => {
        const src = {
            foo: 'bar',
            bar: 123,
            baz: new Float64Array(crypto.randomBytes(12))
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);
        assert.equal(src.baz.length, copied.baz.length);
        assert.deepEqual(src.baz, copied.baz);
    });

    xit('clone/copy: Float32Array', () => {
        const src = {
            foo: 'bar',
            bar: 123,
            baz: new Float32Array(crypto.randomBytes(12))
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);
        assert.equal(src.baz.length, copied.baz.length);
        assert.deepEqual(src.baz, copied.baz);
    });

    xit('clone/copy: Int32Array', () => {
        const src = {
            foo: 'bar',
            bar: 123,
            baz: new Int32Array(crypto.randomBytes(12))
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);
        assert.equal(src.baz.length, copied.baz.length);
        assert.deepEqual(src.baz, copied.baz);
    });

    xit('clone/copy: Int16Array', () => {
        const src = {
            foo: 'bar',
            bar: 123,
            baz: new Int16Array(crypto.randomBytes(12))
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);
        assert.equal(src.baz.length, copied.baz.length);
        assert.deepEqual(src.baz, copied.baz);
    });

    xit('clone/copy: Int8Array', () => {
        const src = {
            foo: 'bar',
            bar: 123,
            baz: new Int8Array(crypto.randomBytes(12))
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);
        assert.equal(src.baz.length, copied.baz.length);
        assert.deepEqual(src.baz, copied.baz);
    });

    xit('clone/copy: Uint8Array', () => {
        const src = {
            foo: 'bar',
            bar: 123,
            baz: new Uint8Array(crypto.randomBytes(12))
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);
        assert.equal(src.baz.length, copied.baz.length);
        assert.deepEqual(src.baz, copied.baz);
    });

    xit('clone/copy: Uint8ClampedArray', () => {
        const src = {
            foo: 'bar',
            bar: 123,
            baz: new Uint8ClampedArray(crypto.randomBytes(12))
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);
        assert.equal(src.baz.length, copied.baz.length);
        assert.deepEqual(src.baz, copied.baz);
    });

    it('clone/copy: Date', () => {
        const src = {
            foo: 'bar',
            bar: 123,
            baz: new Date()
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);
        assert.deepEqual(src.baz.valueOf(), copied.baz.valueOf());
    });

    it('clone/copy: RegExp', () => {
        const src = {
            foo: 'bar',
            bar: 123,
            baz: /^foobar/ig
        };

        const copied = cclone(src);

        assert.deepEqual(src, copied);
        assert.notStrictEqual(src.baz, copied.baz);
        assert.deepEqual(src.baz.toString(), copied.baz.toString());
    });

    it('clone: uncopiable objects', () => {
        const src = {
            wmap: new WeakMap(),
            wset: new WeakSet(),
            string: String('foobar'),
            number: Number(123),
            boolean: Boolean(true),
            error: new Error('foobar'),
            func: () => {
            },
            generator: function* gen() : any {
            },
            sym: Symbol()
        };

        const cloned = cclone(src);

        assert.deepEqual(src, cloned);

        for (const key of Object.keys(src)) {
            assert.strictEqual(src[key as keyof typeof src], cloned[key]);
        }
    });
});
