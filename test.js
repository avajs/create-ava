import path from 'path';
import fs from 'fs';

import test from 'ava';
import dotProp from 'dot-prop';
import execa from 'execa';
import tempWrite from 'temp-write';

import createAva from '.';

const {get} = dotProp;

async function runWithoutInstall(pkg, additionalOpts) {
	const filepath = tempWrite.sync(JSON.stringify(pkg), 'package.json');

	const opts = Object.assign({
		cwd: path.dirname(filepath),
		skipInstall: true
	}, additionalOpts);

	await createAva(opts);
	return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

test('empty package.json', async t => {
	t.is(get(await runWithoutInstall({}), 'scripts.test'), 'ava');
});

test('has scripts', async t => {
	const pkg = await runWithoutInstall({
		scripts: {
			start: ''
		}
	});

	t.is(get(pkg, 'scripts.test'), 'ava');
});

test('has default test', async t => {
	const pkg = await runWithoutInstall({
		scripts: {
			test: 'echo "Error: no test specified" && exit 1'
		}
	});

	t.is(get(pkg, 'scripts.test'), 'ava');
});

test('has only AVA', async t => {
	const pkg = await runWithoutInstall({
		scripts: {
			test: 'ava'
		}
	});

	t.is(get(pkg, 'scripts.test'), 'ava');
});

test('has test', async t => {
	const pkg = await runWithoutInstall({
		scripts: {
			test: 'foo'
		}
	});

	t.is(get(pkg, 'scripts.test'), 'foo && ava');
});

test('has cli args', async t => {
	const args = ['--foo'];

	const pkg = await runWithoutInstall({
		scripts: {
			start: ''
		}
	}, {args});

	t.is(get(pkg, 'scripts.test'), 'ava --foo');
});

test('has cli args and existing binary', async t => {
	const args = ['--foo', '--bar'];

	const pkg = await runWithoutInstall({
		scripts: {
			test: 'foo'
		}
	}, {args});

	t.is(get(pkg, 'scripts.test'), 'foo && ava --foo --bar');
});

test('does not remove empty dependency properties', async t => {
	const pkg = await runWithoutInstall({
		dependencies: {},
		devDependencies: {},
		optionalDependencies: {},
		peerDependencies: {}
	});

	t.truthy(get(pkg, 'dependencies'));
	t.truthy(get(pkg, 'devDependencies'));
	t.truthy(get(pkg, 'optionalDependencies'));
	t.truthy(get(pkg, 'peerDependencies'));
});

test.serial('installs the AVA dependency', async t => {
	const filepath = tempWrite.sync(JSON.stringify({}), 'package.json');

	await createAva({cwd: path.dirname(filepath)});

	const installed = get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'devDependencies.ava');
	t.truthy(installed);
	t.regex(installed, /^\^/);
});

test.serial('installs AVA@next', async t => {
	const filepath = tempWrite.sync(JSON.stringify({}), 'package.json');

	await createAva({cwd: path.dirname(filepath), next: true});

	const installed = get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'devDependencies.ava');
	t.truthy(installed);
	t.regex(installed, /^\d/);
});

test.serial('installs via yarn if there\'s a lockfile', async t => {
	const yarnLock = tempWrite.sync('', 'yarn.lock');

	await createAva({cwd: path.dirname(yarnLock)});

	t.regex(fs.readFileSync(yarnLock, 'utf8'), /ava/);
});

test.serial('installs AVA@next via yarn if there\'s a lockfile', async t => {
	const filepath = tempWrite.sync(JSON.stringify({}), 'package.json');
	const yarnLock = path.join(path.dirname(filepath), 'yarn.lock');
	fs.writeFileSync(yarnLock, '');

	await createAva({cwd: path.dirname(yarnLock), next: true});

	t.regex(fs.readFileSync(yarnLock, 'utf8'), /ava/);

	const installed = get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'devDependencies.ava');
	t.truthy(installed);
	t.regex(installed, /^\d/);
});

test.serial('invokes via cli', async t => {
	const cliFilepath = path.resolve(__dirname, './cli.js');
	const filepath = tempWrite.sync(JSON.stringify({}), 'package.json');
	await execa(cliFilepath, [], {cwd: path.dirname(filepath)});

	t.is(get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'scripts.test'), 'ava');
});

test.serial('interprets cli arguments', async t => {
	const cliFilepath = path.resolve(__dirname, './cli.js');
	const filepath = tempWrite.sync(JSON.stringify({}), 'package.json');
	await execa(cliFilepath, ['--foo', '--bar'], {cwd: path.dirname(filepath)});

	t.is(get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'scripts.test'), 'ava --foo --bar');
});
