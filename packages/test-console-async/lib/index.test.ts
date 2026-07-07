import { test } from 'tape';
import { inspect } from './index.ts';
import { getOptions } from './storage.ts';

const isTTY = [
	process.stdout.isTTY,
	process.stderr.isTTY,
] as const;
const stream = {
	get 0() {
		return process.stdout;
	},
	get 1() {
		return process.stderr;
	},
};

test('isTTY changed', t => {
	const count = 4 * 7;

	t.plan(count);

	function clean() {
		t.same(isTTY[0], stream[0].isTTY, 'clean stdout');
		t.same(isTTY[1], stream[1].isTTY, 'clean stderr');
	}

	inspect(() => {
		t.same(isTTY[0], stream[0].isTTY);
		t.same(isTTY[1], stream[1].isTTY);
	});
	clean();

	inspect(() => {
		t.same(isTTY[0], stream[0].isTTY);
		t.same(isTTY[1], stream[1].isTTY);
	}, {
		isTTY: {
			stdout: isTTY[0],
			stderr: isTTY[1],
		},
	});
	clean();

	inspect(() => {
		t.notSame(isTTY[0], stream[0].isTTY);
		t.same(isTTY[1], stream[1].isTTY);
	}, {
		isTTY: {
			stdout: !isTTY[0],
			stderr: isTTY[1],
		},
	});
	clean();

	inspect(() => {
		t.same(isTTY[0], stream[0].isTTY);
		t.notSame(isTTY[1], stream[1].isTTY);
	}, {
		isTTY: {
			stdout: isTTY[0],
			stderr: !isTTY[1],
		},
	});
	clean();

	inspect(() => {
		t.notSame(isTTY[0], stream[0].isTTY);
		t.notSame(isTTY[1], stream[1].isTTY);
	}, {
		isTTY: {
			stdout: !isTTY[0],
			stderr: !isTTY[1],
		},
	});
	clean();

	for (const isNow of [false, true]) {
		inspect(() => {
			t.same(isNow, stream[0].isTTY);
			t.same(isNow, stream[1].isTTY);
		}, {
			isTTY: isNow,
		});
		clean();
	}
});

test('isTTY shadow', t => {
	t.plan(4);

	inspect(() => {
		t.notSame(isTTY[0], stream[0].isTTY, 'changed');
		inspect(() => {
			t.notSame(isTTY[0], stream[0].isTTY, 'shadowed');
			inspect(() => {
				t.same(isTTY[0], stream[0].isTTY, 'changed');
				t.notSame(isTTY[0], stream[1].isTTY, 'shadowed');
			}, { isTTY: { stdout: isTTY[0] } });
		});
	}, { isTTY: !isTTY[0] });
});

