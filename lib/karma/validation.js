function ensureRspackFrameworkSet(karmaConfig) {
  if (!Array.isArray(karmaConfig.frameworks)) {
    karmaConfig.frameworks = [];
  }
  if (karmaConfig.frameworks.indexOf('rspack') === -1) {
    console.warn(
      'rspack was not included as a framework in karma configuration, setting this automatically...'
    );
    karmaConfig.frameworks.push('rspack');
  }
}

module.exports = { ensureRspackFrameworkSet };
