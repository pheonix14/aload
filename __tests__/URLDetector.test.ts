import { detectURLInfo } from '../src/services/URLDetector';

describe('URLDetector by phoenix14', () => {
  test('detects youtube', () => {
    expect(detectURLInfo('https://youtube.com/watch?v=1').platform).toBe('youtube');
  });
  test('detects pinterest board', () => {
    expect(detectURLInfo('https://pinterest.com/user/board/').isBoardUrl).toBe(true);
  });
});
