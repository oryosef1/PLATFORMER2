import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerEntity } from '../../src/entities/PlayerEntity';
import { PositionComponent } from '../../src/ecs/components/PositionComponent';
import { VelocityComponent } from '../../src/ecs/components/VelocityComponent';
import { MovementConstants } from '../../src/physics/MovementConstants';

describe('Phase 2.4: Dash and Sprint Mechanics Tests', () => {
  let player: PlayerEntity;
  let position: PositionComponent;
  let velocity: VelocityComponent;

  beforeEach(() => {
    player = new PlayerEntity(100, 200);
    position = player.getComponent('position') as PositionComponent;
    velocity = player.getComponent('velocity') as VelocityComponent;
  });

  describe('Dash Mechanics', () => {
    it('should not allow dash when on cooldown', () => {
      // Execute a dash first
      expect(player.canDash()).toBe(true);
      player.executeDash();
      
      // Should not be able to dash again immediately
      expect(player.canDash()).toBe(false);
      expect(player.executeDash()).toBe(false);
    });

    it('should dash in facing direction by default', () => {
      // Initially facing right (default)
      expect(player.executeDash()).toBe(true);
      expect(velocity.x).toBe(MovementConstants.DASH_VELOCITY);
      expect(velocity.y).toBe(0);
    });

    it('should dash right when facing right', () => {
      // Set facing right by moving right
      player.applyMovement('right', true, true);
      player.executeDash();
      
      expect(velocity.x).toBe(MovementConstants.DASH_VELOCITY);
      expect(velocity.y).toBe(0);
    });

    it('should dash left when facing left', () => {
      // Set facing left by moving left
      player.applyMovement('left', true, true);
      player.executeDash();
      
      expect(velocity.x).toBe(-MovementConstants.DASH_VELOCITY);
      expect(velocity.y).toBe(0);
    });

    it('should dash downward when downward flag is true', () => {
      player.executeDash(true); // downward dash
      
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(MovementConstants.DASH_VELOCITY);
    });

    it('should dash horizontally when downward flag is false', () => {
      player.executeDash(false); // horizontal dash (default)
      
      expect(velocity.x).toBe(MovementConstants.DASH_VELOCITY); // facing right by default
      expect(velocity.y).toBe(0);
    });

    it('should set dash duration correctly', () => {
      player.executeDash();
      
      const debugInfo = player.getDebugInfo();
      expect(debugInfo.dash.dashing).toBe(true);
      expect(debugInfo.dash.duration).toBe(MovementConstants.DASH_DURATION_FRAMES);
    });

    it('should set cooldown after dash completes', () => {
      player.executeDash();
      
      // Update for dash duration
      for (let i = 0; i < MovementConstants.DASH_DURATION_FRAMES; i++) {
        player.update(1/60);
      }
      
      const debugInfo = player.getDebugInfo();
      expect(debugInfo.dash.dashing).toBe(false);
      expect(debugInfo.dash.cooldown).toBe(MovementConstants.DASH_COOLDOWN_FRAMES);
    });

    it('should provide invincibility frames during dash', () => {
      player.executeDash();
      
      const debugInfo = player.getDebugInfo();
      expect(debugInfo.dash.invincible).toBe(true);
      expect(debugInfo.dash.invincibilityFrames).toBe(MovementConstants.DASH_INVINCIBILITY_FRAMES);
    });

    it('should end invincibility after invincibility frames expire', () => {
      player.executeDash();
      
      // Update for invincibility duration
      for (let i = 0; i < MovementConstants.DASH_INVINCIBILITY_FRAMES; i++) {
        player.update(1/60);
      }
      
      const debugInfo = player.getDebugInfo();
      expect(debugInfo.dash.invincible).toBe(false);
      expect(debugInfo.dash.invincibilityFrames).toBe(0);
    });

    it('should countdown dash duration on update', () => {
      player.executeDash();
      
      const debugInfo1 = player.getDebugInfo();
      expect(debugInfo1.dash.duration).toBe(MovementConstants.DASH_DURATION_FRAMES);
      
      player.update(1/60);
      
      const debugInfo2 = player.getDebugInfo();
      expect(debugInfo2.dash.duration).toBe(MovementConstants.DASH_DURATION_FRAMES - 1);
    });

    it('should countdown cooldown on update', () => {
      player.executeDash();
      
      // Complete the dash
      for (let i = 0; i < MovementConstants.DASH_DURATION_FRAMES; i++) {
        player.update(1/60);
      }
      
      const debugInfo1 = player.getDebugInfo();
      expect(debugInfo1.dash.cooldown).toBe(MovementConstants.DASH_COOLDOWN_FRAMES);
      
      player.update(1/60);
      
      const debugInfo2 = player.getDebugInfo();
      expect(debugInfo2.dash.cooldown).toBe(MovementConstants.DASH_COOLDOWN_FRAMES - 1);
    });

    it('should allow dash again after cooldown expires', () => {
      player.executeDash();
      expect(player.canDash()).toBe(false);
      
      // Complete dash and cooldown
      for (let i = 0; i < MovementConstants.DASH_DURATION_FRAMES + MovementConstants.DASH_COOLDOWN_FRAMES; i++) {
        player.update(1/60);
      }
      
      expect(player.canDash()).toBe(true);
      expect(player.executeDash()).toBe(true);
    });

    it('should work in air (air dash)', () => {
      player.setGroundState(false);
      
      expect(player.canDash()).toBe(true);
      expect(player.executeDash(true)).toBe(true); // downward air dash
      
      expect(velocity.y).toBe(MovementConstants.AIR_DASH_VELOCITY);
    });

    it('should work on ground', () => {
      player.setGroundState(true);
      
      expect(player.canDash()).toBe(true);
      expect(player.executeDash()).toBe(true);
      
      expect(velocity.x).toBe(MovementConstants.DASH_VELOCITY);
    });

    it('should not allow dash again during dash', () => {
      player.executeDash();
      expect(player.isDashing()).toBe(true);
      expect(velocity.x).toBe(MovementConstants.DASH_VELOCITY);
      
      // Should not be able to dash again during dash
      expect(player.canDash()).toBe(false);
      expect(player.executeDash()).toBe(false);
    });
  });

  describe('Sprint Mechanics', () => {
    it('should start sprinting when stamina is available', () => {
      expect(player.canSprint()).toBe(true);
      player.startSprint();
      
      expect(player.isSprinting()).toBe(true);
      
      const debugInfo = player.getDebugInfo();
      expect(debugInfo.sprint.sprinting).toBe(true);
    });

    it('should not allow sprinting when stamina is too low', () => {
      // Drain stamina below minimum
      const debugInfo = player.getDebugInfo();
      const staminaToDrain = debugInfo.sprint.stamina - MovementConstants.SPRINT_MIN_STAMINA + 1;
      
      for (let i = 0; i < staminaToDrain; i++) {
        player.drainStamina(1);
      }
      
      expect(player.canSprint()).toBe(false);
      player.startSprint();
      expect(player.isSprinting()).toBe(false);
    });

    it('should drain stamina while sprinting', () => {
      const initialStamina = player.getDebugInfo().sprint.stamina;
      
      player.startSprint();
      player.update(1/60);
      
      const afterStamina = player.getDebugInfo().sprint.stamina;
      expect(afterStamina).toBe(initialStamina - MovementConstants.SPRINT_STAMINA_DRAIN_RATE);
    });

    it('should regenerate stamina when not sprinting', () => {
      // Drain some stamina first
      player.drainStamina(50);
      const drainedStamina = player.getDebugInfo().sprint.stamina;
      
      player.update(1/60);
      
      const afterStamina = player.getDebugInfo().sprint.stamina;
      expect(afterStamina).toBe(drainedStamina + MovementConstants.SPRINT_STAMINA_REGEN_RATE);
    });

    it('should not regenerate stamina above maximum', () => {
      expect(player.getDebugInfo().sprint.stamina).toBe(MovementConstants.SPRINT_STAMINA_MAX);
      
      player.update(1/60);
      
      expect(player.getDebugInfo().sprint.stamina).toBe(MovementConstants.SPRINT_STAMINA_MAX);
    });

    it('should stop sprinting when stamina is depleted', () => {
      player.startSprint();
      
      // Drain all stamina
      const stamina = player.getDebugInfo().sprint.stamina;
      for (let i = 0; i < stamina; i += MovementConstants.SPRINT_STAMINA_DRAIN_RATE) {
        player.update(1/60);
      }
      
      expect(player.isSprinting()).toBe(false);
    });

    it('should apply speed multiplier when sprinting', () => {
      player.setGroundState(true);
      player.startSprint();
      
      player.applyMovement('right', true, true);
      
      const normalAccel = MovementConstants.ACCELERATION_GROUND * MovementConstants.FIXED_TIMESTEP;
      const sprintAccel = normalAccel * MovementConstants.SPRINT_ACCELERATION_MULTIPLIER;
      
      expect(velocity.x).toBeCloseTo(sprintAccel, 1);
    });

    it('should apply increased max speed when sprinting', () => {
      player.setGroundState(true);
      player.startSprint();
      
      // Accelerate to max speed
      for (let i = 0; i < 100; i++) {
        player.applyMovement('right', true, true);
      }
      
      const expectedMaxSpeed = MovementConstants.MAX_SPEED_GROUND * MovementConstants.SPRINT_SPEED_MULTIPLIER;
      expect(velocity.x).toBeCloseTo(expectedMaxSpeed, 1);
    });

    it('should work in air with reduced values', () => {
      player.setGroundState(false);
      player.startSprint();
      
      player.applyMovement('right', true, false);
      
      const normalAccel = MovementConstants.ACCELERATION_AIR * MovementConstants.AIR_CONTROL_FACTOR * MovementConstants.FIXED_TIMESTEP;
      const sprintAccel = normalAccel * MovementConstants.SPRINT_ACCELERATION_MULTIPLIER;
      
      expect(velocity.x).toBeCloseTo(sprintAccel, 1);
    });

    it('should stop sprinting when manually stopped', () => {
      player.startSprint();
      expect(player.isSprinting()).toBe(true);
      
      player.stopSprint();
      expect(player.isSprinting()).toBe(false);
    });

    it('should track stamina correctly over time', () => {
      const initialStamina = MovementConstants.SPRINT_STAMINA_MAX;
      expect(player.getDebugInfo().sprint.stamina).toBe(initialStamina);
      
      // Sprint for 10 frames
      player.startSprint();
      for (let i = 0; i < 10; i++) {
        player.update(1/60);
      }
      
      const expectedStamina = initialStamina - (10 * MovementConstants.SPRINT_STAMINA_DRAIN_RATE);
      expect(player.getDebugInfo().sprint.stamina).toBe(expectedStamina);
      
      // Stop sprinting and regenerate for 5 frames
      player.stopSprint();
      for (let i = 0; i < 5; i++) {
        player.update(1/60);
      }
      
      const finalStamina = expectedStamina + (5 * MovementConstants.SPRINT_STAMINA_REGEN_RATE);
      expect(player.getDebugInfo().sprint.stamina).toBe(finalStamina);
    });
  });

  describe('Dash and Sprint Integration', () => {
    it('should allow dashing while sprinting', () => {
      player.startSprint();
      expect(player.isSprinting()).toBe(true);
      
      expect(player.canDash()).toBe(true);
      expect(player.executeDash()).toBe(true);
      
      // Both should be active
      expect(player.isDashing()).toBe(true);
      expect(player.isSprinting()).toBe(true);
    });

    it('should allow sprinting while dashing', () => {
      player.executeDash();
      expect(player.isDashing()).toBe(true);
      
      player.startSprint();
      expect(player.isSprinting()).toBe(true);
      
      // Both should be active
      expect(player.isDashing()).toBe(true);
      expect(player.isSprinting()).toBe(true);
    });

    it('should handle dash velocity override during sprint', () => {
      player.startSprint();
      player.applyMovement('right', true, true);
      
      const sprintVelocity = velocity.x;
      player.executeDash();
      
      // Dash velocity should override sprint velocity
      expect(velocity.x).toBe(MovementConstants.DASH_VELOCITY);
      expect(velocity.x).toBeGreaterThan(sprintVelocity);
    });

    it('should continue sprinting after dash ends', () => {
      player.startSprint();
      player.executeDash();
      
      // Complete the dash
      for (let i = 0; i < MovementConstants.DASH_DURATION_FRAMES; i++) {
        player.update(1/60);
      }
      
      expect(player.isDashing()).toBe(false);
      expect(player.isSprinting()).toBe(true);
    });

    it('should not affect stamina drain rate when dashing', () => {
      player.startSprint();
      const staminaBefore = player.getDebugInfo().sprint.stamina;
      
      player.executeDash();
      player.update(1/60);
      
      const staminaAfter = player.getDebugInfo().sprint.stamina;
      expect(staminaAfter).toBe(staminaBefore - MovementConstants.SPRINT_STAMINA_DRAIN_RATE);
    });
  });
});