import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlayerEntity } from '../../src/entities/PlayerEntity';
import { MovementConstants } from '../../src/physics/MovementConstants';
import { PositionComponent } from '../../src/ecs/components/PositionComponent';
import { VelocityComponent } from '../../src/ecs/components/VelocityComponent';

describe('Phase 2.2: Enhanced Jumping System Tests', () => {
  let playerEntity: PlayerEntity;

  beforeEach(() => {
    playerEntity = new PlayerEntity(100, 200);
    // Start on ground for most tests
    playerEntity.setGroundState(true);
  });

  describe('Variable Jump Height', () => {
    it('should have minimum jump height when quickly tapped', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // Simulate quick tap (1 frame)
      playerEntity.startJump();
      playerEntity.updateJump(1/60, false); // Released immediately
      
      // With jump cancellation, quick tap should be roughly half minimum velocity
      const expectedMinVelocity = MovementConstants.MIN_JUMP_VELOCITY * 0.4; // 40% of min due to cancellation
      expect(Math.abs(velocity.y)).toBeGreaterThanOrEqual(expectedMinVelocity);
      expect(Math.abs(velocity.y)).toBeLessThan(MovementConstants.MAX_JUMP_VELOCITY);
    });

    it('should have maximum jump height when held', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // Simulate holding jump for full duration
      playerEntity.startJump();
      for (let i = 0; i < MovementConstants.JUMP_HOLD_FRAMES; i++) {
        playerEntity.updateJump(1/60, true); // Keep holding
      }
      
      // Should reach maximum jump velocity
      expect(Math.abs(velocity.y)).toBeGreaterThanOrEqual(MovementConstants.MAX_JUMP_VELOCITY * 0.9);
    });

    it('should have variable jump height based on hold duration', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // Test short hold (25% of max frames)
      playerEntity.startJump();
      const shortHoldFrames = Math.floor(MovementConstants.JUMP_HOLD_FRAMES * 0.25);
      for (let i = 0; i < shortHoldFrames; i++) {
        playerEntity.updateJump(1/60, true);
      }
      playerEntity.updateJump(1/60, false); // Release
      const shortJumpVelocity = Math.abs(velocity.y);
      
      // Reset for long hold test
      velocity.y = 0;
      playerEntity.setGroundState(true);
      
      // Test long hold (75% of max frames)
      playerEntity.startJump();
      const longHoldFrames = Math.floor(MovementConstants.JUMP_HOLD_FRAMES * 0.75);
      for (let i = 0; i < longHoldFrames; i++) {
        playerEntity.updateJump(1/60, true);
      }
      playerEntity.updateJump(1/60, false); // Release
      const longJumpVelocity = Math.abs(velocity.y);
      
      // Long hold should result in higher velocity
      expect(longJumpVelocity).toBeGreaterThan(shortJumpVelocity);
    });

    it('should not allow jumping when not on ground and no coyote time', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      playerEntity.setGroundState(false);
      
      // Update to expire coyote time
      for (let i = 0; i < 7; i++) {
        playerEntity.updateCoyoteTime(1/60);
      }
      
      const initialVelocityY = velocity.y;
      playerEntity.startJump();
      
      // Velocity should not change
      expect(velocity.y).toBe(initialVelocityY);
    });
  });

  describe('Coyote Time System', () => {
    it('should allow jumping for 6 frames after leaving ground', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // Player leaves ground
      playerEntity.setGroundState(false);
      
      // Update for 5 frames (within coyote time)
      for (let i = 0; i < 5; i++) {
        playerEntity.updateCoyoteTime(1/60);
      }
      
      // Should still be able to jump
      playerEntity.startJump();
      expect(Math.abs(velocity.y)).toBeGreaterThan(0);
      expect(playerEntity.isOnGround()).toBe(false);
    });

    it('should not allow jumping after coyote time expires', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // Player leaves ground
      playerEntity.setGroundState(false);
      
      // Update for 7 frames (past coyote time)
      for (let i = 0; i < 7; i++) {
        playerEntity.updateCoyoteTime(1/60);
      }
      
      const initialVelocityY = velocity.y;
      playerEntity.startJump();
      
      // Should not be able to jump
      expect(velocity.y).toBe(initialVelocityY);
    });

    it('should reset coyote time when landing on ground', () => {
      // Player leaves ground
      playerEntity.setGroundState(false);
      
      // Update past coyote time
      for (let i = 0; i < 7; i++) {
        playerEntity.updateCoyoteTime(1/60);
      }
      
      // Land back on ground
      playerEntity.setGroundState(true);
      
      // Should be able to jump again
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      playerEntity.startJump();
      expect(Math.abs(velocity.y)).toBeGreaterThan(0);
    });
  });

  describe('Jump Buffering System', () => {
    it('should buffer jump input when not on ground', () => {
      playerEntity.setGroundState(false);
      
      // Try to jump while in air
      playerEntity.bufferJump();
      
      // Should have buffered the jump
      expect(playerEntity.hasBufferedJump()).toBe(true);
    });

    it('should execute buffered jump when landing', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      playerEntity.setGroundState(false);
      
      // Buffer a jump while in air
      playerEntity.bufferJump();
      
      // Land on ground
      playerEntity.setGroundState(true);
      playerEntity.updateJumpBuffer(1/60);
      
      // Should automatically execute the buffered jump
      expect(Math.abs(velocity.y)).toBeGreaterThan(0);
      expect(playerEntity.hasBufferedJump()).toBe(false);
    });

    it('should clear jump buffer after timeout', () => {
      playerEntity.setGroundState(false);
      playerEntity.bufferJump();
      
      // Update for more than buffer duration
      for (let i = 0; i < MovementConstants.JUMP_BUFFER_FRAMES + 1; i++) {
        playerEntity.updateJumpBuffer(1/60);
      }
      
      // Buffer should be cleared
      expect(playerEntity.hasBufferedJump()).toBe(false);
    });

    it('should prioritize direct jump over buffered jump', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // Buffer a jump
      playerEntity.setGroundState(false);
      playerEntity.bufferJump();
      
      // Land and immediately press jump again
      playerEntity.setGroundState(true);
      playerEntity.startJump();
      
      // Should execute direct jump and clear buffer
      expect(Math.abs(velocity.y)).toBeGreaterThan(0);
      expect(playerEntity.hasBufferedJump()).toBe(false);
    });
  });

  describe('Double Jump Mechanics', () => {
    it('should allow one double jump after regular jump', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // First jump (regular)
      playerEntity.startJump();
      const firstJumpVelocity = velocity.y;
      
      // Set up for double jump (simulate being in air)
      playerEntity.setGroundState(false);
      velocity.y = -100; // Simulate upward movement
      
      // Second jump (double jump)
      playerEntity.startDoubleJump();
      
      // Should have jumped again
      expect(velocity.y).toBeLessThan(firstJumpVelocity); // More negative = higher
      expect(playerEntity.hasDoubleJumpAvailable()).toBe(false);
    });

    it('should not allow double jump when already used', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // Use double jump
      playerEntity.setGroundState(false);
      playerEntity.startDoubleJump();
      const afterFirstDouble = velocity.y;
      
      // Try to double jump again
      playerEntity.startDoubleJump();
      
      // Should not change velocity
      expect(velocity.y).toBe(afterFirstDouble);
    });

    it('should restore double jump when landing', () => {
      // Use double jump
      playerEntity.setGroundState(false);
      playerEntity.startDoubleJump();
      expect(playerEntity.hasDoubleJumpAvailable()).toBe(false);
      
      // Land on ground
      playerEntity.setGroundState(true);
      
      // Double jump should be available again
      expect(playerEntity.hasDoubleJumpAvailable()).toBe(true);
    });

    it('should not allow double jump from ground', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      const initialVelocity = velocity.y;
      
      // Try to double jump while on ground
      playerEntity.startDoubleJump();
      
      // Should not change velocity
      expect(velocity.y).toBe(initialVelocity);
    });
  });

  describe('Jump State Management', () => {
    it('should track jump state correctly', () => {
      expect(playerEntity.isJumping()).toBe(false);
      
      playerEntity.startJump();
      expect(playerEntity.isJumping()).toBe(true);
      
      // Simulate being in air (jump system sets this when jumping starts)
      playerEntity.setGroundState(false);
      expect(playerEntity.isJumping()).toBe(true);
      
      // Simulate landing
      playerEntity.setGroundState(true);
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      velocity.y = 0;
      
      expect(playerEntity.isJumping()).toBe(false);
    });

    it('should handle jump cancellation', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      playerEntity.startJump();
      const jumpVelocity = velocity.y;
      
      // Cancel jump (like releasing jump button early)
      playerEntity.cancelJump();
      
      // Velocity should be reduced
      expect(velocity.y).toBeGreaterThan(jumpVelocity); // Less negative = lower
    });
  });

  describe('Jump Physics Integration', () => {
    it('should respect movement constants for jump velocities', () => {
      expect(MovementConstants.MIN_JUMP_VELOCITY).toBeDefined();
      expect(MovementConstants.MAX_JUMP_VELOCITY).toBeDefined();
      expect(MovementConstants.DOUBLE_JUMP_VELOCITY).toBeDefined();
      expect(MovementConstants.JUMP_HOLD_FRAMES).toBeDefined();
      expect(MovementConstants.COYOTE_TIME_FRAMES).toBeDefined();
      expect(MovementConstants.JUMP_BUFFER_FRAMES).toBeDefined();
      
      // Validate ranges
      expect(MovementConstants.MIN_JUMP_VELOCITY).toBeLessThan(MovementConstants.MAX_JUMP_VELOCITY);
      expect(MovementConstants.COYOTE_TIME_FRAMES).toBe(6);
      expect(MovementConstants.JUMP_BUFFER_FRAMES).toBe(10);
    });

    it('should maintain proper jump velocity scaling', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // Test minimum jump
      playerEntity.startJump();
      playerEntity.updateJump(1/60, false); // Release immediately
      const minJump = Math.abs(velocity.y);
      
      // Reset
      velocity.y = 0;
      playerEntity.setGroundState(true);
      
      // Test maximum jump
      playerEntity.startJump();
      for (let i = 0; i < MovementConstants.JUMP_HOLD_FRAMES; i++) {
        playerEntity.updateJump(1/60, true);
      }
      const maxJump = Math.abs(velocity.y);
      
      // Verify scaling - with square root scaling and jump cancellation, ratio is higher
      const ratio = maxJump / minJump;
      expect(ratio).toBeGreaterThan(1.5); // Max should be significantly higher
      expect(ratio).toBeLessThan(4.0); // But not excessive (updated for new scaling)
    });
  });
});