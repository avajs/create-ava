# create-ava

> Add [AVA](https://avajs.dev) to your project

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

Type: `string`\
Default: `process.cwd()`

Current working directory.

#### args

Type: `string[]`\
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

Type: `boolean`\
Default: `false`

Install `ava@next` instead of `ava`.
