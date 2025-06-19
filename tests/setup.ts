// Test setup file
import { beforeAll, afterAll } from 'vitest';

// Mock Phaser for testing
beforeAll(() => {
  // Create a mock canvas element
  const canvas = document.createElement('canvas');
  canvas.id = 'game';
  canvas.width = 1024;
  canvas.height = 768;
  document.body.appendChild(canvas);

  // Mock requestAnimationFrame
  global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(callback, 16);
  };

  global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };
});

afterAll(() => {
  // Clean up
  const canvas = document.getElementById('game');
  if (canvas) {
    canvas.remove();
  }
});