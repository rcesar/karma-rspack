const path = require('path');

const glob = require('glob');
const { minimatch } = require('minimatch');

const { ensureRspackFrameworkSet } = require('../karma/validation');
const { hash } = require('../utils/hash');

const KR_Controller = require('./controller');

function getPathKey(filePath, withExtension = false) {
  const pathParts = path.parse(filePath);
  const key = `${pathParts.name}.${hash(filePath)}`;
  return withExtension ? `${key}${pathParts.ext}` : key;
}

function configToRspackEntries(config) {
  const filteredPreprocessorsPatterns = [];
  const { preprocessors } = config;

  let files = [];
  const exclude = config.exclude || [];
  const excluded = (filePath) =>
    exclude.find((exPat) => minimatch(filePath, exPat));

  config.files.forEach((fileEntry, i) => {
    // forcefully disable karma watch as we use rspack watch only
    config.files[i].watched = false;
    files = [...files, ...glob.sync(fileEntry.pattern)];
  });

  Object.keys(preprocessors).forEach((pattern) => {
    if (preprocessors[pattern].includes('rspack')) {
      filteredPreprocessorsPatterns.push(pattern);
    }
  });

  const filteredFiles = [];
  files.forEach((filePath) => {
    filteredPreprocessorsPatterns.forEach((pattern) => {
      if (minimatch(filePath, pattern) && !excluded(filePath)) {
        filteredFiles.push(filePath);
      }
    });
  });

  const rspackEntries = {};
  filteredFiles.forEach((filePath) => {
    rspackEntries[getPathKey(filePath)] = filePath;
  });

  return rspackEntries;
}

function KR_Preprocessor(config, emitter) {
  const controller = new KR_Controller();
  config.__karmaRspackController = controller;
  ensureRspackFrameworkSet(config);

  // one time setup
  if (controller.isActive === false) {
    controller.updateRspackOptions({
      entry: configToRspackEntries(config),
      watch: config.autoWatch,
    });

    if (config.rspack.entry) {
      console.warn(`
karma-rspack does not currently support custom entries, if this is something you need,
consider opening an issue.
ignoring attempt to set the entry option...
      `);
      delete config.rspack.entry;
    }

    controller.updateRspackOptions(config.rspack);
    controller.karmaEmitter = emitter;
  }

  const normalize = (file) => file.replace(/\\/g, '/');

  const transformPath =
    config.rspack.transformPath ||
    ((filepath) => {
      // force *.js files by default
      const info = path.parse(filepath);
      return `${path.join(info.dir, info.name)}.js`;
    });

  return function processFile(content, file, done) {
    controller.bundle().then(() => {
      file.path = normalize(file.path); // eslint-disable-line no-param-reassign

      const transformedFilePath = transformPath(getPathKey(file.path, true));
      const bundleContent = controller.bundlesContent[transformedFilePath];

      file.path = transformedFilePath;

      done(null, bundleContent);
    });
  };
}

KR_Preprocessor.$inject = ['config', 'emitter'];

module.exports = KR_Preprocessor;
