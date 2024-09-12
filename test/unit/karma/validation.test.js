const { ensureRspackFrameworkSet } = require('../../../lib/karma/validation');

describe('karmaConfigValidation', () => {
  describe('ensureRspackFrameworkExists', () => {
    let config;
    beforeEach(() => {
      config = { frameworks: [] };
      jest.spyOn(console, 'warn').mockImplementation();
    });

    it('should add rspack to the list of karma config frameworks if it did not already exist', () => {
      ensureRspackFrameworkSet(config);
      expect(config.frameworks.length).toBe(1);
      expect(config.frameworks[0]).toBe('rspack');
    });

    it('should throw a warning that rspack is automatically appending the rspack framework', () => {
      ensureRspackFrameworkSet(config);
      expect(console.warn).toHaveBeenCalledWith(
        `rspack was not included as a framework in karma configuration, setting this automatically...`
      );
    });

    it('should add rspack to an existing list of frameworks', () => {
      config.frameworks = ['foo', 'bar'];
      ensureRspackFrameworkSet(config);
      expect(config.frameworks.length).toBe(3);
      expect(config.frameworks).toContain('rspack');
    });
    it('should create a frameworks array if one does not exist', () => {
      delete config.frameworks;
      ensureRspackFrameworkSet(config);
      expect(config.frameworks.length).toBe(1);
      expect(config.frameworks[0]).toBe('rspack');
    });
  });
});
