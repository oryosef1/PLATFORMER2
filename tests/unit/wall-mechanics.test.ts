import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerEntity } from '../../src/entities/PlayerEntity';
import { PositionComponent } from '../../src/ecs/components/PositionComponent';
import { VelocityComponent } from '../../src/ecs/components/VelocityComponent';
import { MovementConstants } from '../../src/physics/MovementConstants';

describe('Phase 2.4: Wall Mechanics Tests', () => {
  let player: PlayerEntity;
  let position: PositionComponent;
  let velocity: VelocityComponent;

  beforeEach(() => {
    player = new PlayerEntity(100, 200);
    position = player.getComponent('position') as PositionComponent;
    velocity = player.getComponent('velocity') as VelocityComponent;
  });

  describe('Wall Detection', () => {
    it('should detect wall contact on the left', () => {
      player.setWallContact(true, false);
      expect(player.isTouchingWall()).toBe(true);
      
      const debugInfo = player.getDebugInfo();
      expect(debugInfo.wall.touchingLeft).toBe(true);
      expect(debugInfo.wall.touchingRight).toBe(false);
    });

    it('should detect wall contact on the right', () => {
      player.setWallContact(false, true);
      expect(player.isTouchingWall()).toBe(true);
      
      const debugInfo = player.getDebugInfo();
      expect(debugInfo.wall.touchingLeft).toBe(false);
      expect(debugInfo.wall.touchingRight).toBe(true);
    });

    it('should detect no wall contact', () => {
      player.setWallContact(false, false);
      expect(player.isTouchingWall()).toBe(false);
      
      const debugInfo = player.getDebugInfo();
      expect(debugInfo.wall.touchingLeft).toBe(false);
      expect(debugInfo.wall.touchingRight).toBe(false);
    });

    it('should handle both walls touched simultaneously', () => {
      player.setWallContact(true, true);
      expect(player.isTouchingWall()).toBe(true);
      
      const debugInfo = player.getDebugInfo();
      expect(debugInfo.wall.touchingLeft).toBe(true);
      expect(debugInfo.wall.touchingRight).toBe(true);
    });
  });

  describe('Wall Sliding', () => {
    it('should not wall slide when on ground', () => {
      player.setGroundState(true);
      player.setWallContact(true, false);
      velocity.y = 200; // Falling
      
      player.updateWallSlide(true, false); // Pressing towards wall
      
      expect(player.isWallSliding()).toBe(false);
      expect(velocity.y).toBe(200); // Unchanged
    });

    it('should not wall slide when moving upward', () => {
      player.setGroundState(false);
      player.setWallContact(true, false);
      velocity.y = -200; // Moving up
      
      player.updateWallSlide(true, false); // Pressing towards wall
      
      expect(player.isWallSliding()).toBe(false);
      expect(velocity.y).toBe(-200); // Unchanged
    });

    it('should wall slide when falling against a wall and pressing towards it', () => {
      player.setGroundState(false);
      player.setWallContact(true, false); // Left wall
      velocity.y = 300; // Falling fast
      
      player.updateWallSlide(true, false); // Pressing left
      
      expect(player.isWallSliding()).toBe(true);
    });

    it('should consume double jump when starting wall slide', () => {
      player.setGroundState(false);
      player.setWallContact(true, false); // Left wall
      velocity.y = 300; // Falling fast
      
      expect(player.hasDoubleJumpAvailable()).toBe(true); // Should have double jump initially
      
      player.updateWallSlide(true, false); // Pressing left - starts wall sliding
      
      expect(player.isWallSliding()).toBe(true);
      expect(player.hasDoubleJumpAvailable()).toBe(false); // Double jump should be consumed
    });

    it('should keep double jump consumed throughout wall sliding', () => {
      player.setGroundState(false);
      player.setWallContact(true, false); // Left wall
      velocity.y = 300; // Falling fast
      
      expect(player.hasDoubleJumpAvailable()).toBe(true); // Should have double jump initially
      
      // Start wall sliding
      player.updateWallSlide(true, false); // Pressing left - starts wall sliding
      expect(player.hasDoubleJumpAvailable()).toBe(false); // Double jump consumed
      
      // Continue wall sliding for multiple frames
      for (let i = 0; i < 10; i++) {
        player.updateWallSlide(true, false); // Keep sliding
        expect(player.hasDoubleJumpAvailable()).toBe(false); // Should stay consumed
      }
    });

    it('should not wall slide when not pressing towards wall', () => {
      player.setGroundState(false);
      player.setWallContact(true, false); // Left wall
      velocity.y = 300; // Falling fast
      
      player.updateWallSlide(false, false); // Not pressing towards wall
      
      expect(player.isWallSliding()).toBe(false);
    });

    it('should limit fall speed to wall slide speed', () => {
      player.setGroundState(false);
      player.setWallContact(false, true); // Right wall
      velocity.y = 300; // Falling fast
      
      // Calculate how many frames it takes to slow down
      const decelPerFrame = MovementConstants.WALL_SLIDE_ACCELERATION * MovementConstants.FIXED_TIMESTEP;
      const framesToSlowDown = Math.ceil((300 - MovementConstants.WALL_SLIDE_SPEED) / decelPerFrame);
      
      // Simulate enough frames to reach wall slide speed
      for (let i = 0; i < framesToSlowDown + 5; i++) {
        player.updateWallSlide(false, true); // Pressing right
      }
      
      // Should be at wall slide speed
      expect(velocity.y).toBe(MovementConstants.WALL_SLIDE_SPEED);
    });

    it('should set consistent wall slide speed regardless of starting velocity', () => {
      player.setGroundState(false);
      player.setWallContact(true, false); // Left wall
      
      // Test with high velocity (falling fast)
      velocity.y = 400;
      player.updateWallSlide(true, false); // Pressing left
      expect(velocity.y).toBe(MovementConstants.WALL_SLIDE_SPEED);
      
      // Reset and test with low velocity (jumping to wall)
      player.setWallContact(false, false); // Leave wall
      player.updateWallSlide(false, false); // Stop sliding
      player.setWallContact(true, false); // Touch wall again
      velocity.y = 10; // Very slow fall
      player.updateWallSlide(true, false); // Pressing left
      expect(velocity.y).toBe(MovementConstants.WALL_SLIDE_SPEED); // Should still be consistent
    });

    it('should stop wall sliding when leaving wall', () => {
      player.setGroundState(false);
      player.setWallContact(true, false); // Left wall
      velocity.y = 100;
      
      player.updateWallSlide(true, false); // Pressing left
      expect(player.isWallSliding()).toBe(true);
      
      player.setWallContact(false, false);
      player.updateWallSlide(true, false);
      expect(player.isWallSliding()).toBe(false);
    });

    it('should stop wall sliding when landing', () => {
      player.setGroundState(false);
      player.setWallContact(true, false); // Left wall
      velocity.y = 100;
      
      player.updateWallSlide(true, false); // Pressing left
      expect(player.isWallSliding()).toBe(true);
      
      player.setGroundState(true);
      player.updateWallSlide(true, false);
      expect(player.isWallSliding()).toBe(false);
    });
  });

  describe('Wall Jump Mechanics', () => {
    it('should not allow wall jump when on ground', () => {
      player.setGroundState(true);
      player.setWallContact(true, false);
      
      expect(player.canWallJump()).toBe(false);
      expect(player.executeWallJump()).toBe(false);
    });

    it('should not allow wall jump when not touching wall', () => {
      player.setGroundState(false);
      player.setWallContact(false, false);
      
      expect(player.canWallJump()).toBe(false);
      expect(player.executeWallJump()).toBe(false);
    });

    it('should allow wall jump when in air and touching wall', () => {
      player.setGroundState(false);
      player.setWallContact(true, false);
      
      expect(player.canWallJump()).toBe(true);
    });

    it('should jump away from left wall correctly', () => {
      player.setGroundState(false);
      player.setWallContact(true, false); // Touching left wall
      velocity.y = 100; // Falling
      
      const result = player.executeWallJump();
      
      expect(result).toBe(true);
      expect(velocity.x).toBe(MovementConstants.WALL_JUMP_HORIZONTAL_VELOCITY); // Jump right
      expect(velocity.y).toBe(-MovementConstants.WALL_JUMP_VERTICAL_VELOCITY); // Jump up
    });

    it('should jump away from right wall correctly', () => {
      player.setGroundState(false);
      player.setWallContact(false, true); // Touching right wall
      velocity.y = 100; // Falling
      
      const result = player.executeWallJump();
      
      expect(result).toBe(true);
      expect(velocity.x).toBe(-MovementConstants.WALL_JUMP_HORIZONTAL_VELOCITY); // Jump left
      expect(velocity.y).toBe(-MovementConstants.WALL_JUMP_VERTICAL_VELOCITY); // Jump up
    });

    it('should set control lockout after wall jump', () => {
      player.setGroundState(false);
      player.setWallContact(true, false);
      
      expect(player.hasWallJumpControlLockout()).toBe(false);
      
      player.executeWallJump();
      
      expect(player.hasWallJumpControlLockout()).toBe(true);
      const debugInfo = player.getDebugInfo();
      expect(debugInfo.wall.jumpLockout).toBe(MovementConstants.WALL_JUMP_CONTROL_LOCKOUT_FRAMES);
    });

    it('should NEVER restore double jump after wall jump (only ground does)', () => {
      player.setGroundState(false);
      player.setWallContact(true, false);
      
      // Use up double jump first
      player.startDoubleJump();
      expect(player.hasDoubleJumpAvailable()).toBe(false);
      
      // Wall jump should NEVER restore double jump
      player.executeWallJump();
      expect(player.hasDoubleJumpAvailable()).toBe(false); // Should stay false
    });

    it('should NOT restore double jump when wall jumping from wall slide', () => {
      player.setGroundState(false);
      player.setWallContact(true, false);
      velocity.y = 200; // Falling
      
      // Start wall sliding (this consumes double jump)
      player.updateWallSlide(true, false);
      expect(player.isWallSliding()).toBe(true);
      expect(player.hasDoubleJumpAvailable()).toBe(false);
      
      // Wall jump from wall slide should NOT restore double jump
      player.executeWallJump();
      expect(player.hasDoubleJumpAvailable()).toBe(false); // Should stay consumed
    });

    it('should stop wall sliding after wall jump', () => {
      player.setGroundState(false);
      player.setWallContact(true, false); // Left wall
      velocity.y = 200; // Falling
      
      player.updateWallSlide(true, false); // Pressing left
      expect(player.isWallSliding()).toBe(true);
      
      player.executeWallJump();
      expect(player.isWallSliding()).toBe(false);
    });

    it('should set wall jump cooldown after wall jump to prevent immediate double jump', () => {
      player.setGroundState(false);
      player.setWallContact(true, false);
      
      // Wall jump should set cooldown
      player.executeWallJump();
      
      const debugInfo = player.getDebugInfo();
      expect(debugInfo.wall.jumpCooldown).toBe(8); // Should be 8 frames
      
      // Double jump should be blocked during cooldown
      expect(player.startDoubleJump()).toBe(false);
      
      // Update for cooldown duration
      for (let i = 0; i < 8; i++) {
        player.update(1/60);
      }
      
      // After cooldown, double jump should work (if available)
      const debugInfo2 = player.getDebugInfo();
      expect(debugInfo2.wall.jumpCooldown).toBe(0);
    });
  });

  describe('Wall Jump Control Lockout', () => {
    it('should prevent horizontal movement during lockout', () => {
      player.setGroundState(false);
      player.setWallContact(true, false);
      player.executeWallJump();
      
      // Try to move left during lockout
      velocity.x = 250; // From wall jump
      player.applyMovement('left', true, false);
      
      // Velocity should only be affected by friction, not player input
      expect(velocity.x).toBeGreaterThan(200); // Only friction applied
    });

    it('should countdown lockout frames on update', () => {
      player.setGroundState(false);
      player.setWallContact(true, false);
      player.executeWallJump();
      
      const debugInfo1 = player.getDebugInfo();
      expect(debugInfo1.wall.jumpLockout).toBe(MovementConstants.WALL_JUMP_CONTROL_LOCKOUT_FRAMES);
      
      player.update(1/60);
      
      const debugInfo2 = player.getDebugInfo();
      expect(debugInfo2.wall.jumpLockout).toBe(MovementConstants.WALL_JUMP_CONTROL_LOCKOUT_FRAMES - 1);
    });

    it('should allow movement after lockout expires', () => {
      player.setGroundState(false);
      player.setWallContact(true, false);
      player.executeWallJump();
      
      // Update for lockout duration
      for (let i = 0; i < MovementConstants.WALL_JUMP_CONTROL_LOCKOUT_FRAMES; i++) {
        player.update(1/60);
      }
      
      expect(player.hasWallJumpControlLockout()).toBe(false);
      
      // Now movement should work
      velocity.x = 100;
      player.applyMovement('left', true, false);
      expect(velocity.x).toBeLessThan(100); // Movement applied
    });
  });

  describe('Wall Mechanics Integration', () => {
    it('should handle wall jump from wall slide state', () => {
      player.setGroundState(false);
      player.setWallContact(false, true); // Right wall
      velocity.y = 300; // Falling fast
      
      // Start wall sliding
      player.updateWallSlide(false, true); // Pressing right
      expect(player.isWallSliding()).toBe(true);
      
      // Execute wall jump
      const jumped = player.executeWallJump();
      expect(jumped).toBe(true);
      expect(player.isWallSliding()).toBe(false);
      expect(velocity.x).toBe(-MovementConstants.WALL_JUMP_HORIZONTAL_VELOCITY);
    });

    it('should handle touching both walls (corner case)', () => {
      player.setGroundState(false);
      player.setWallContact(true, true); // Both walls
      
      // Should still be able to wall jump (picks one wall)
      expect(player.canWallJump()).toBe(true);
      const jumped = player.executeWallJump();
      expect(jumped).toBe(true);
    });

    it('should maintain wall slide speed consistently', () => {
      player.setGroundState(false);
      player.setWallContact(true, false); // Left wall
      velocity.y = MovementConstants.WALL_SLIDE_SPEED; // Already at slide speed
      
      const speedBefore = velocity.y;
      player.updateWallSlide(true, false); // Pressing left
      const speedAfter = velocity.y;
      
      // Should maintain slide speed
      expect(speedAfter).toBe(speedBefore);
    });
  });
});