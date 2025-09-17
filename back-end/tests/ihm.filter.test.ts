import IHMService from '../src/services/IHMService';

test('IHMService excludes system backup files and keeps data files', () => {
  const shouldExclude = [
    'Relatorio_09_25_SYS.csv',
    'Relatorio_02.csv',
    'something_SYS.csv',
    'Relatorio_2025_01_SYS.csv'
  ];

  const shouldInclude = [
    'Relatorio_01.csv', // *_01.csv are required
    'Relatorio_2025_08.csv',
    'Relatorio_2025_10.csv',
    'Relatorio_2024_12.csv',
    'custom_report.csv'
  ];

  for (const s of shouldExclude) expect(IHMService.isExcludedFile(s)).toBeTruthy();
  for (const s of shouldInclude) expect(IHMService.isExcludedFile(s)).toBeFalsy();
});
