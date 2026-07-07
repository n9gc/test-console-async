import { test } from 'tape';
import { ignore, inspect, restore } from './index.ts';

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

test('interceptor order', t => {
	const l: string[] = [];
	inspect(() => {
		inspect(() => {
			console.log('jjq');
			console.log('ok 666 good');
			console.log('abc');
		}, {
			stdout(data, write) {
				l.push(`${data}_2`);
				if (data !== 'abc\n') write(data);
			},
		});
	}, {
		stdout(data, write) {
			l.push(`${data}_1`);
			if (data !== 'jjq\n') write(data);
		},
		isTTY: false,
	});
	t.deepEqual(l, [
		'jjq\n_2',
		'jjq\n_1',
		'ok 666 good\n_2',
		'ok 666 good\n_1',
		'abc\n_2',
	]);
	t.end();
});

test('ignore', t => {
	ignore(() => {
		console.log('error 999 not ok!');
	});
	t.end();
});

test('restore', async t => {
	const { stdout } = await restore(async () => {
		console.log('888');
		console.log(999);
	});
	t.same(stdout, [
		'888\n',
		'999\n',
	]);
	const hh: string[] = [];
	const { stderr } = await restore(async () => {
		console.log(555);
		console.log(432);
		console.error(667);
	}, {
		stdout(data) {
			hh.push(data.toString());
		},
		stderr: () => void 0,
	});
	t.same(hh, ['555\n', '432\n']);
	t.same(stderr, ['667\n']);
	t.end();
});

