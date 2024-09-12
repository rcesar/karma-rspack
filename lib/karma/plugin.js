const KR_Framework = require('../karma-rspack/framework');
const KR_Preprocessor = require('../karma-rspack/preprocessor');

const KR_KarmaPlugin = {
  'preprocessor:rspack': ['factory', KR_Preprocessor],
  'framework:rspack': ['factory', KR_Framework],
};

module.exports = KR_KarmaPlugin;
