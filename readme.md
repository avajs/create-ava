# create-ava [![Build Status: Linux](https://travis-ci.org/avajs/create-ava.svg?branch=master)](https://travis-ci.org/avajs/create-ava) [![Build status: Windows](https://ci.appveyor.com/api/projects/status/abj17qsw0j1rts7l/branch/master?svg=true)](https://ci.appveyor.com/project/ava/create-ava/branch/master)

> Add [AVA](https://ava.li) to your project


## CLI

```
$ npm init ava [options]
```


## API

```
$ npm install create-ava
```

### Usage

```js
const createAva = require('create-ava');

(async () => {
	await createAva();
})();
```

### createAva(options?)

Returns a `Promise`.

#### options

Type: `object`

#### cwd

Type: `string`<br>
Default: `process.cwd()`

Current working directory.

#### args

Type: `string[]`<br>
Default: CLI arguments *(`process.argv.slice(2)`)*

For instance, with the arguments `['--foo', '--bar']`, the following will be put in package.json:

```json
{
	"name": "awesome-package",
	"scripts": {
		"test": "ava --foo --bar"
	}
}
```

#### next

Type: `boolean`<br>
Default: `false`

Install `ava@next` instead of `ava`.
