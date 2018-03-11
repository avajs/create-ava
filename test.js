import path from 'path';
import fs from 'fs';
import execa from 'execa';
import tempWrite from 'temp-write';
import dotProp from 'dot-prop';
import test from 'ava';
import m from '.';

const get = dotProp.get;

function run(pkg, additionalOpts) {
	const filepath = tempWrite.sync(JSON.stringify(pkg), 'package.json');
	const opts = Object.assign({
		cwd: path.dirname(filepath),
		skipInstall: true
	}, additionalOpts);

	return m(opts).then(() => JSON.parse(fs.readFileSync(filepath, 'utf8')));
}

test('empty package.json', async t => {
	t.is(get(await run({}), 'scripts.test'), 'ava');
});

test('has scripts', async t => {
	const pkg = await run({
		scripts: {
			start: ''
		}
	});

	t.is(get(pkg, 'scripts.test'), 'ava');
});

test('has default test', async t => {
	const pkg = await run({
		scripts: {
			test: 'echo "Error: no test specified" && exit 1'
		}
	});

	t.is(get(pkg, 'scripts.test'), 'ava');
});

test('has only AVA', async t => {
	const pkg = await run({
		scripts: {
			test: 'ava'
		}
	});

	t.is(get(pkg, 'scripts.test'), 'ava');
});

test('has test', async t => {
	const pkg = await run({
		scripts: {
			test: 'foo'
		}
	});

	t.is(get(pkg, 'scripts.test'), 'foo && ava');
});

test('has cli args', async t => {
	const args = ['--foo'];

	const pkg = await run({
		scripts: {
			start: ''
		}
	}, {args});

	t.is(get(pkg, 'scripts.test'), 'ava --foo');
});

test('has cli args and existing binary', async t => {
	const args = ['--foo', '--bar'];

	const pkg = await run({
		scripts: {
			test: 'foo'
		}
	}, {args});

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

test('invokes via cli', async t => {
	const cliFilepath = path.resolve(__dirname, './cli.js');
	const filepath = tempWrite.sync(JSON.stringify({}), 'package.json');
	await execa(cliFilepath, [], {cwd: path.dirname(filepath)});

	t.is(get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'scripts.test'), 'ava');
});

test('interprets cli arguments', async t => {
	const cliFilepath = path.resolve(__dirname, './cli.js');
	const filepath = tempWrite.sync(JSON.stringify({}), 'package.json');
	await execa(cliFilepath, ['--foo', '--bar'], {cwd: path.dirname(filepath)});

	t.is(get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'scripts.test'), 'ava --foo --bar');
});
