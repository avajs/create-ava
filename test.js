import path from 'path';
import fs from 'fs';
import tempWrite from 'temp-write';
import dotProp from 'dot-prop';
import test from 'ava';
import m from './';

const originalArgv = process.argv.slice();
const get = dotProp.get;

function run(pkg) {
	const filepath = tempWrite.sync(JSON.stringify(pkg), 'package.json');

	return m({
		cwd: path.dirname(filepath),
		skipInstall: true
	}).then(() => JSON.parse(fs.readFileSync(filepath, 'utf8')));
}

test('empty package.json', async t => {
	process.argv = ['ava', '--init'];
	t.is(get(await run({}), 'scripts.test'), 'ava');
});

test('has scripts', async t => {
	process.argv = ['ava', '--init'];

	const pkg = await run({
		scripts: {
			start: ''
		}
	});

	t.is(get(pkg, 'scripts.test'), 'ava');
});

test('has default test', async t => {
	process.argv = ['ava', '--init'];

	const pkg = await run({
		scripts: {
			test: 'echo "Error: no test specified" && exit 1'
		}
	});

	t.is(get(pkg, 'scripts.test'), 'ava');
});

test('has only AVA', async t => {
	process.argv = ['ava', '--init'];

	const pkg = await run({
		scripts: {
			test: 'ava'
		}
	});

	t.is(get(pkg, 'scripts.test'), 'ava');
});

test('has test', async t => {
	process.argv = ['ava', '--init'];

	const pkg = await run({
		scripts: {
			test: 'foo'
		}
	});

	t.is(get(pkg, 'scripts.test'), 'foo && ava');
});

test('has cli args', async t => {
	process.argv = ['ava', '--init', '--foo'];

	const pkg = await run({
		scripts: {
			start: ''
		}
	});

	process.argv = originalArgv;
	t.is(get(pkg, 'scripts.test'), 'ava --foo');
});

test('has cli args and existing binary', async t => {
	process.argv = ['ava', '--init', '--foo', '--bar'];

	const pkg = await run({
		scripts: {
			test: 'foo'
		}
	});

	process.argv = originalArgv;
	t.is(get(pkg, 'scripts.test'), 'foo && ava --foo --bar');
});

test('installs the AVA dependency', async t => {
	const filepath = tempWrite.sync(JSON.stringify({}), 'package.json');

	await m({cwd: path.dirname(filepath)});

	t.truthy(get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'devDependencies.ava'));
});

test('installs via yarn if there\'s a lockfile', async t => {
	const yarnLock = tempWrite.sync('', 'yarn.lock');

	await m({cwd: path.dirname(yarnLock)});

	t.regex(fs.readFileSync(yarnLock, 'utf8'), /ava/);
});
