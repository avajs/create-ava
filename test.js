'use strict';
var path = require('path');
var fs = require('fs');
var tempWrite = require('temp-write');
var dotProp = require('dot-prop');
var test = require('ava');
var fn = require('./');
var originalArgv = process.argv.slice();
var get = dotProp.get;

function run(t, pkg) {
	var filepath = tempWrite.sync(JSON.stringify(pkg), 'package.json');

	return fn({
		cwd: path.dirname(filepath)
	}).then(function () {
		var pkg2 = JSON.parse(fs.readFileSync(filepath, 'utf8'));
		t.true(get(pkg2, 'devDependencies.ava'));
		return pkg2;
	});
}

test('empty package.json', function (t) {
	return run(t, {}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'ava');
	});
});

test('has scripts', function (t) {
	return run(t, {
		scripts: {
			start: ''
		}
	}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'ava');
	});
});

test('has default test', function (t) {
	return run(t, {
		scripts: {
			test: 'echo "Error: no test specified" && exit 1'
		}
	}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'ava');
	});
});

test('has only AVA', function (t) {
	return run(t, {
		scripts: {
			test: 'ava'
		}
	}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'ava');
	});
});

test('has test', function (t) {
	return run(t, {
		scripts: {
			test: 'foo'
		}
	}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'foo && ava');
	});
});

test('has cli args', function (t) {
	process.argv = originalArgv.concat(['--init', '--foo']);

	return run(t, {
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

	return run(t, {
		scripts: {
			test: 'foo'
		}
	}).then(function (pkg) {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.test'), 'foo && ava --foo --bar');
	});
});
