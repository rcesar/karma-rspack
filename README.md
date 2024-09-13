<div align="center">
  <a href='https://github.com/karma-runner/karma'>
    <img width="180" height="180"
      src="https://worldvectorlogo.com/logos/karma.svg">
  </a>
  <picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://assets.rspack.dev/rspack/rspack-banner-plain-dark.png">
  <img alt="Rspack Banner" src="https://assets.rspack.dev/rspack/rspack-banner-plain-light.png">
</picture>
  <h1>Karma Rspack</h1>
  <p>Use rspack to preprocess files in karma<p>
</div>

<h2 align="center">Install</h2>

npm `npm i -D karma-rspack`

yarn `yarn add -D karma-rspack`

<h2 align="center">Usage</h2>

**karma.conf.js**
```js
module.exports = (config) => {
  config.set({
    // ... normal karma configuration

    // make sure to include rspack as a framework
    frameworks: ['mocha', 'rspack'],
    
    plugins: [
      'karma-rspack',
      'karma-mocha',
    ],

    files: [
      // all files ending in ".test.js"
      // !!! use watched: false as we use rspacks watch
      { pattern: 'test/**/*.test.js', watched: false }
    ],

    preprocessors: {
      // add rspack as preprocessor
      'test/**/*.test.js': [ 'rspack' ]
    },

    rspack: {
      // karma watches the test entry points
      // Do NOT specify the entry option
      // rspack watches dependencies

      // rspack configuration
    },
  });
}
```

### Default rspack configuration

This configuration will be merged with what gets provided via karma's config.rspack.

```js
const defaultRspackOptions = {
  mode: 'development',
  output: {
    filename: '[name].js',
    path: path.join(os.tmpdir(), '_karma_rspack_') + Math.floor(Math.random() * 1000000),
  },
  stats: {
    modules: false,
    colors: true,
  },
  watch: false,
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 1,
        },
      },
    },
  },
  plugins: [],
};
```

### How it works

This project is a framework and preprocessor for Karma that combines test files and dependencies into 2 shared bundles and 1 chunk per test file. It relies on rspack to generate the bundles/chunks and to keep it updated during `autoWatch=true`.

The first preproccessor triggers the build of all the bundles/chunks and all following files just return the output of this one build process.

### Rspack typescript support

By default karma-rspack forces *.js files so if you test *.ts files and use rspack to build typescript to javascript it works out of the box.

If you have a different need you can override by setting `rspack.transformPath`

```js
// this is the by default applied transformPath
rspack: {
  transformPath: (filepath) => {
      // force *.js files by default
      const info = path.parse(filepath);
      return `${path.join(info.dir, info.name)}.js`;
    },
},
```

### `Source Maps`

You can use the `karma-sourcemap-loader` to get the source maps generated for your test bundle.

```bash
npm i -D karma-sourcemap-loader
```

And then add it to your preprocessors.

**karma.conf.js**
```js
preprocessors: {
  'test/test_index.js': [ 'rspack', 'sourcemap' ]
}
```

And tell `rspack` to generate sourcemaps.

**rspack.config.js**
```js
rspack: {
  // ...
  devtool: 'inline-source-map'
}
```