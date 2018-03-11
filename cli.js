#!/usr/bin/env node
'use strict';
const arrExclude = require('arr-exclude');
const init = require('.');

const cli = process.argv.slice(2);
const args = arrExclude(cli, ['--unicorn']);

const unicorn = cli.indexOf('--unicorn') !== -1;

const opts = {args, unicorn};
init(opts);
