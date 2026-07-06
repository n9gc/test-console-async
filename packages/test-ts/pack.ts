import { build } from 'esbuild';
import { glob } from 'tinyglobby';

await build({
	entryPoints: await glob(
		[
			'lib/**/*.ts',
		],
		{
			onlyFiles: true,
			cwd: new URL('.', import.meta.url),
		},
	),
	bundle: false,
	outdir: '.',
	format: 'esm',
	platform: 'node',
	target: 'esnext',
});
