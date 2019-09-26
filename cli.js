#!/usr/bin/env node
'use strict';
const arrExclude = require('arr-exclude');
const createAva = require('.');

const cli = process.argv.slice(2);
const args = arrExclude(cli, ['--next']);
const next = cli.includes('--next');

createAva({args, next});
