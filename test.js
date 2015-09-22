'use strict';
var path = require('path');
var fs = require('fs');
var tempWrite = require('temp-write');
var dotProp = require('dot-prop');
var test = require('ava');
var fn = require('./');
var originalArgv = process.argv.slice();
var get = dotProp.get;

function run(pkg) {
	var filepath = tempWrite.sync(JSON.stringify(pkg), 'package.json');

	return fn({
		cwd: path.dirname(filepath),
		skipInstall: true
	}).then(function () {
		return JSON.parse(fs.readFileSync(filepath, 'utf8'));
	});
}

test('empty package.json', function (t) {
	return run({}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'ava');
	});
});

test('has scripts', function (t) {
	return run({
		scripts: {
			start: ''
		}
	}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'ava');
	});
});

test('has default test', function (t) {
	return run({
		scripts: {
			test: 'echo "Error: no test specified" && exit 1'
		}
	}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'ava');
	});
});

test('has only AVA', function (t) {
	return run({
		scripts: {
			test: 'ava'
		}
	}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'ava');
	});
});

test('has test', function (t) {
	return run({
		scripts: {
			test: 'foo'
		}
	}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'foo && ava');
	});
});

test('has cli args', function (t) {
	process.argv = originalArgv.concat(['--init', '--foo']);

	return run({
		scripts: {
			start: ''
		}
	}).then(function (pkg) {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.test'), 'ava --foo');
	});
});

test('has cli args and existing binary', function (t) {
	process.argv = originalArgv.concat(['--init', '--foo', '--bar']);

	return run({
		scripts: {
			test: 'foo'
		}
	}).then(function (pkg) {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.test'), 'foo && ava --foo --bar');
	});
});

test('installs the AVA dependency', function (t) {
	var filepath = tempWrite.sync(JSON.stringify({}), 'package.json');

	return fn({
		cwd: path.dirname(filepath)
	}).then(function () {
		t.ok(get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'devDependencies.ava'));
	});
});
