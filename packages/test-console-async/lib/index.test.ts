import { test } from 'tape';
import { inspect } from './index.ts';

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
	t.plan(8);

	t.same(isTTY[0], stream[0].isTTY, 'clean');
	inspect(() => {
		t.notSame(isTTY[0], stream[0].isTTY, 'changed');
		inspect(() => {
			t.notSame(isTTY[0], stream[0].isTTY, 'shadowed');
			inspect(() => {
				t.same(isTTY[0], stream[0].isTTY, 'changed');
				t.notSame(isTTY[0], stream[1].isTTY, 'shadowed');
			}, { isTTY: { stdout: isTTY[0] } });
			t.notSame(isTTY[0], stream[0].isTTY, 'clean');
		});
		t.notSame(isTTY[0], stream[0].isTTY, 'clean');
	}, { isTTY: !isTTY[0] });
	t.same(isTTY[0], stream[0].isTTY, 'clean');
});

test('assign isTTY', async t => {
	t.plan(4);

	await new Promise<void>(resolve => setTimeout(() => {
		stream[0].isTTY = false;
		t.same(stream[0].isTTY, false, 'isTTY false');
		stream[0].isTTY = true;
		t.same(stream[0].isTTY, true, 'isTTY true');
		stream[0].isTTY = !isTTY[0];
		t.same(stream[0].isTTY, !isTTY[0], 'isTTY neg');
		resolve();
	}, 50));

	t.same(stream[0].isTTY, isTTY[0], 'isTTY');
});

