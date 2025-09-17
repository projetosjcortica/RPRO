import { postJson } from '../src/utils/http';

test('postJson throws on invalid URL', async () => {
  await expect(postJson('not-a-valid-url', { a: 1 })).rejects.toBeTruthy();
});
