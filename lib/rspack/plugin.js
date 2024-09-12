const fs = require('fs');
const path = require('path');

class KR_RspackPlugin {
  constructor(options) {
    this.karmaEmitter = options.karmaEmitter;
    this.controller = options.controller;
  }

  apply(compiler) {
    this.compiler = compiler;

    // rspack bundles are finished
    compiler.hooks.done.tap('KR_RspackPlugin', (stats) => {
      // read generated file content and store for karma preprocessor
      this.controller.bundlesContent = {};
      stats.toJson().assets.forEach((rspackFileObj) => {
        const filePath = path.resolve(
          compiler.options.output.path,
          rspackFileObj.name
        );
        this.controller.bundlesContent[rspackFileObj.name] = fs.readFileSync(
          filePath,
          'utf-8'
        );
      });

      // karma refresh
      this.karmaEmitter.refreshFiles();
    });
  }
}

module.exports = KR_RspackPlugin;
