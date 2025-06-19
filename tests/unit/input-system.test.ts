import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputManager, InputState } from '../../src/input/InputManager';
import { InputComponent } from '../../src/ecs/components/InputComponent';

describe('Phase 1.4: Input System with Buffering Tests', () => {
  let inputManager: InputManager;

  beforeEach(() => {
    // Mock keyboard events
    const mockKeyboard = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    global.window = { addEventListener: vi.fn(), removeEventListener: vi.fn() } as any;
    inputManager = new InputManager();
  });

  describe('InputManager', () => {
    it('should create InputManager instance', () => {
      expect(inputManager).toBeDefined();
      expect(inputManager).toBeInstanceOf(InputManager);
    });

    it('should detect keyboard input states', () => {
      // Simulate key press
      inputManager.setKeyState('ArrowLeft', true);
      expect(inputManager.isKeyDown('ArrowLeft')).toBe(true);
      expect(inputManager.isKeyDown('ArrowRight')).toBe(false);
    });

    it('should track input press/release events', () => {
      // Test just pressed detection
      inputManager.setKeyState('ArrowUp', true);
      expect(inputManager.isKeyJustPressed('ArrowUp')).toBe(true);
      
      // After update, should not be just pressed
      inputManager.update();
      expect(inputManager.isKeyJustPressed('ArrowUp')).toBe(false);
      expect(inputManager.isKeyDown('ArrowUp')).toBe(true);
    });
  });

  describe('Input Buffer System', () => {
    it('should store inputs in 10-frame buffer', () => {
      const buffer = inputManager.getInputBuffer();
      expect(buffer.getCapacity()).toBe(10);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should maintain frame-based input history', () => {
      // Add input events over multiple frames
      inputManager.addBufferedInput('jump', 1);
      inputManager.addBufferedInput('dash', 3);
      inputManager.addBufferedInput('jump', 5);
      
      const buffer = inputManager.getInputBuffer();
      expect(buffer.getInputsAtFrame(1)).toContain('jump');
      expect(buffer.getInputsAtFrame(3)).toContain('dash');
      expect(buffer.getInputsAtFrame(5)).toContain('jump');
    });

    it('should retrieve inputs within time window', () => {
      inputManager.addBufferedInput('jump', 5);
      
      // Should find input within window: frame 5 is within 5 frames of frame 8 (8-5=3)
      expect(inputManager.wasInputBuffered('jump', 8, 5)).toBe(true);
      // Should find input within window: frame 5 is within 10 frames of frame 12 (12-5=7)
      expect(inputManager.wasInputBuffered('jump', 12, 10)).toBe(true);
      
      // Should not find outside window: frame 5 is 15 frames away from frame 20
      expect(inputManager.wasInputBuffered('jump', 20, 5)).toBe(false);
    });

    it('should expire old inputs after 10 frames', () => {
      inputManager.addBufferedInput('jump', 1);
      
      // Input should exist initially
      expect(inputManager.wasInputBuffered('jump', 5, 10)).toBe(true);
      
      // Simulate 15 frames passing
      for (let i = 0; i < 15; i++) {
        inputManager.update();
      }
      
      // Input should be expired
      expect(inputManager.wasInputBuffered('jump', 16, 10)).toBe(false);
    });

    it('should handle buffer overflow correctly', () => {
      // Fill buffer beyond capacity
      for (let i = 0; i < 15; i++) {
        inputManager.addBufferedInput('test', i);
      }
      
      const buffer = inputManager.getInputBuffer();
      expect(buffer.getSize()).toBeLessThanOrEqual(10);
      
      // Oldest entries should be removed
      expect(buffer.getInputsAtFrame(0)).toHaveLength(0);
      expect(buffer.getInputsAtFrame(14)).toContain('test');
    });
  });

  describe('Input State Management', () => {
    it('should track just pressed state', () => {
      expect(inputManager.isKeyJustPressed('Space')).toBe(false);
      
      inputManager.setKeyState('Space', true);
      expect(inputManager.isKeyJustPressed('Space')).toBe(true);
      
      inputManager.update();
      expect(inputManager.isKeyJustPressed('Space')).toBe(false);
    });

    it('should track just released state', () => {
      // Start with key pressed
      inputManager.setKeyState('Space', true);
      inputManager.update();
      expect(inputManager.isKeyJustReleased('Space')).toBe(false);
      
      // Release key
      inputManager.setKeyState('Space', false);
      expect(inputManager.isKeyJustReleased('Space')).toBe(true);
      
      // Should only be true for one frame
      inputManager.update();
      expect(inputManager.isKeyJustReleased('Space')).toBe(false);
    });

    it('should track held state duration', () => {
      inputManager.setKeyState('ArrowLeft', true);
      
      inputManager.update();
      expect(inputManager.getKeyHeldDuration('ArrowLeft')).toBe(1);
      
      inputManager.update();
      expect(inputManager.getKeyHeldDuration('ArrowLeft')).toBe(2);
      
      inputManager.setKeyState('ArrowLeft', false);
      inputManager.update();
      expect(inputManager.getKeyHeldDuration('ArrowLeft')).toBe(0);
    });

    it('should handle simultaneous inputs', () => {
      inputManager.setKeyState('ArrowLeft', true);
      inputManager.setKeyState('ArrowUp', true);
      
      expect(inputManager.isKeyDown('ArrowLeft')).toBe(true);
      expect(inputManager.isKeyDown('ArrowUp')).toBe(true);
      expect(inputManager.isKeyJustPressed('ArrowLeft')).toBe(true);
      expect(inputManager.isKeyJustPressed('ArrowUp')).toBe(true);
    });
  });

  describe('InputComponent', () => {
    it('should create InputComponent for entities', () => {
      const inputComponent = new InputComponent();
      expect(inputComponent).toBeDefined();
      expect(inputComponent.type).toBe('input');
    });

    it('should bind input mappings to actions', () => {
      const inputComponent = new InputComponent();
      inputComponent.bindAction('move_left', 'ArrowLeft');
      inputComponent.bindAction('jump', 'ArrowUp');
      
      expect(inputComponent.getActionBinding('move_left')).toBe('ArrowLeft');
      expect(inputComponent.getActionBinding('jump')).toBe('ArrowUp');
    });

    it('should support custom input configurations', () => {
      const config = {
        moveLeft: 'ArrowLeft',
        moveRight: 'ArrowRight',
        jump: 'ArrowUp',
        dash: 'KeyX'
      };
      
      const inputComponent = new InputComponent(config);
      expect(inputComponent.getActionBinding('moveLeft')).toBe('ArrowLeft');
      expect(inputComponent.getActionBinding('dash')).toBe('KeyX');
    });
  });

  describe('Debug Visualization', () => {
    it('should display current input state', () => {
      inputManager.setKeyState('ArrowLeft', true);
      inputManager.setKeyState('ArrowUp', true);
      
      const debugInfo = inputManager.getDebugInfo();
      expect(debugInfo.activeKeys).toContain('ArrowLeft');
      expect(debugInfo.activeKeys).toContain('ArrowUp');
      expect(debugInfo.activeKeys).not.toContain('ArrowRight');
    });

    it('should show input buffer history', () => {
      inputManager.addBufferedInput('jump', 5);
      inputManager.addBufferedInput('dash', 7);
      
      const debugInfo = inputManager.getDebugInfo();
      expect(debugInfo.bufferHistory).toBeDefined();
      expect(debugInfo.bufferHistory.length).toBeGreaterThan(0);
    });

    it('should highlight buffered inputs', () => {
      inputManager.addBufferedInput('jump', 5);
      
      const debugInfo = inputManager.getDebugInfo();
      expect(debugInfo.bufferedInputs).toContain('jump');
      expect(debugInfo.bufferFrames).toContain(5);
    });
  });
});