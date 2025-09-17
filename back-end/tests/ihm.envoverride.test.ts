import IHMService from '../src/services/IHMService';

test('IHM_EXCLUDE_REGEX env overrides default behavior', () => {
  process.env.IHM_EXCLUDE_REGEX = '^custom_exclude';
  expect(IHMService.isExcludedFile('custom_exclude_file.csv')).toBeTruthy();
  delete process.env.IHM_EXCLUDE_REGEX;
});
