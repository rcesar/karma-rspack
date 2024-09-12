const { rspack } = require('@rspack/core');
const merge = require('webpack-merge');

const KR_RspackPlugin = require('../rspack/plugin');
const DefaultRspackOptionsFactory = require('../rspack/defaults');

class KW_Controller {
  constructor() {
    this.isActive = false;
    this.bundlesContent = {};
    this.hasBeenBuiltAtLeastOnce = false;
    this.rspackOptions = DefaultRspackOptionsFactory.create();
  }

  set rspackOptions(options) {
    this.__rspackOptions = options;
  }

  get rspackOptions() {
    return this.__rspackOptions;
  }

  updateRspackOptions(newOptions) {
    if (newOptions.output && newOptions.output.filename) {
      if (newOptions.output.filename !== '[name].js') {
        console.warn(
          `
karma-rspack does not currently support customized filenames via
rspack output.filename, if this is something you need consider opening an issue.
defaulting ${newOptions.output.filename} to [name].js.`.trim()
        );
      }
      delete newOptions.output.filename;
    }

    if (newOptions.optimization) {
      console.warn(
        'karma-rspack may behave unexpectedly when using customized optimizations.'
      );
    }

    this.rspackOptions = merge(this.rspackOptions, newOptions);
    console.log('this.rspackOptions', this.rspackOptions.optimization);
  }

  set karmaEmitter(emitter) {
    this.__karmaEmitter = emitter;

    this.__rspackOptions.plugins.push(
      new KR_RspackPlugin({
        karmaEmitter: emitter,
        controller: this,
      })
    );
  }

  get karmaEmitter() {
    return this.__karmaEmitter;
  }

  get outputPath() {
    return this.rspackOptions.output.path;
  }

  setupExitHandler(compiler) {
    this.karmaEmitter.once('exit', (done) => {
      compiler.close(() => {
        console.log('rspack stopped watching.');
        done();
      });
    });
  }

  bundle() {
    if (this.isActive === false && this.hasBeenBuiltAtLeastOnce === false) {
      console.log('rspack bundling...');
      this._activePromise = this._bundle();
    }
    return this._activePromise;
  }

  _bundle() {
    this.isActive = true;

    return new Promise((resolve) => {
      if (this.rspackOptions.watch === true) {
        console.log('rspack starts watching...');
        this.compiler = rspack(this.rspackOptions, (err, stats) =>
          this.handleBuildResult(err, stats, resolve)
        );

        this.setupExitHandler(this.compiler);
      } else {
        this.compiler = rspack(this.rspackOptions).run((err, stats) =>
          this.handleBuildResult(err, stats, resolve)
        );
      }
    });
  }

  handleBuildResult(err, stats, resolve) {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    this.isActive = false;
    this.hasBeenBuiltAtLeastOnce = true;

    console.log(stats.toString(this.rspackOptions.stats));
    resolve();
  }
}

module.exports = KW_Controller;
