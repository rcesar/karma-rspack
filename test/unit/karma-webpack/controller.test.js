const os = require('os');
const path = require('path');

const KW_Controller = require('../../../lib/karma-rspack/controller');
const DefaultRspackOptionsFactory = require('../../../lib/rspack/defaults');

const defaultRspackOptions = DefaultRspackOptionsFactory.create();

describe('KW_Controller', () => {
  const EXPECTED_DEFAULT_PATH_PREFIX = '_karma_rspack_';

  let controller;

  beforeEach(() => (controller = new KW_Controller()));

  it('initializes with a rspackOptions object', () => {
    expect(controller.rspackOptions).toBeDefined();
  });

  it('correctly sets the default output path prefix', () => {
    expect(
      controller.rspackOptions.output.path.startsWith(
        path.join(os.tmpdir(), EXPECTED_DEFAULT_PATH_PREFIX)
      )
    ).toBeTruthy();
  });

  it('correctly postfixes a random number to the end of the rspack options output path for parallel runs', () => {
    const postfix = controller.rspackOptions.output.path.split(
      EXPECTED_DEFAULT_PATH_PREFIX
    )[1];
    expect(isNaN(postfix)).toBe(false);
  });

  it('should otherwise be equal to a newly instantiated default rspack options object', () => {
    controller.rspackOptions.output.path = EXPECTED_DEFAULT_PATH_PREFIX;
    defaultRspackOptions.output.path = EXPECTED_DEFAULT_PATH_PREFIX;
    expect(controller.rspackOptions).toEqual(defaultRspackOptions);
  });

  it('can provide custom nested rspackOptions', () => {
    controller.updateRspackOptions({
      output: {
        path: 'foo',
        publicPath: 'bar',
      },
    });
    expect(controller.rspackOptions.output.path).toBe('foo');
    expect(controller.rspackOptions.output.publicPath).toBe('bar');
    expect(controller.rspackOptions.output.filename).toBe(
      defaultRspackOptions.output.filename
    );
  });
});
