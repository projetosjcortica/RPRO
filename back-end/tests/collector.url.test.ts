import { SERVER_URL } from '../src/collector/collector';

test('SERVER_URL includes protocol when env var missing', () => {
  expect(SERVER_URL.match(/^https?:\/\//)).toBeTruthy();
});
