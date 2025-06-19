import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlayerEntity } from '../../src/entities/PlayerEntity';
import { MovementConstants } from '../../src/physics/MovementConstants';
import { PositionComponent } from '../../src/ecs/components/PositionComponent';
import { VelocityComponent } from '../../src/ecs/components/VelocityComponent';
import { InputComponent } from '../../src/ecs/components/InputComponent';

describe('Phase 2.1: Player Entity & Basic Movement Tests', () => {
  let playerEntity: PlayerEntity;

  beforeEach(() => {
    playerEntity = new PlayerEntity(100, 200);
  });

  describe('PlayerEntity Creation', () => {
    it('should create player entity with required components', () => {
      expect(playerEntity).toBeDefined();
      expect(playerEntity.hasComponent('position')).toBe(true);
      expect(playerEntity.hasComponent('velocity')).toBe(true);
      expect(playerEntity.hasComponent('input')).toBe(true);
    });

    it('should initialize player with default position', () => {
      const position = playerEntity.getComponent('position') as PositionComponent;
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('should have physics body for movement', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      expect(velocity).toBeDefined();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });

    it('should attach input component for controls', () => {
      const input = playerEntity.getComponent('input') as InputComponent;
      expect(input).toBeDefined();
      expect(input.getActionBinding('moveLeft')).toBe('ArrowLeft');
      expect(input.getActionBinding('moveRight')).toBe('ArrowRight');
    });
  });

  describe('Horizontal Movement', () => {
    it('should accelerate horizontally when input is pressed', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // Simulate left input
      playerEntity.applyMovement('left', true, true); // left, isPressed, isOnGround
      
      expect(velocity.x).toBeLessThan(0);
      expect(Math.abs(velocity.x)).toBeGreaterThan(0);
    });

    it('should reach maximum speed limit', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // Apply movement many times to reach max speed
      for (let i = 0; i < 100; i++) {
        playerEntity.applyMovement('right', true, true);
      }
      
      expect(velocity.x).toBeLessThanOrEqual(MovementConstants.MAX_SPEED_GROUND);
      expect(velocity.x).toBeGreaterThan(MovementConstants.MAX_SPEED_GROUND * 0.9);
    });

    it('should decelerate when input stops', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // First accelerate
      for (let i = 0; i < 10; i++) {
        playerEntity.applyMovement('right', true, true);
      }
      const speedAfterAccel = velocity.x;
      
      // Then stop input
      playerEntity.applyMovement('none', false, true);
      
      expect(velocity.x).toBeLessThan(speedAfterAccel);
    });

    it('should apply friction to reduce velocity', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // Set initial velocity
      velocity.x = 100;
      
      // Apply friction
      playerEntity.applyFriction(true); // isOnGround
      
      expect(velocity.x).toBeLessThan(100);
      expect(velocity.x).toBeGreaterThan(0);
    });

    it('should have reduced air control', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      // Test ground acceleration
      playerEntity.applyMovement('right', true, true);
      const groundAccel = velocity.x;
      
      // Reset and test air acceleration
      velocity.x = 0;
      playerEntity.applyMovement('right', true, false); // isOnGround = false
      const airAccel = velocity.x;
      
      expect(airAccel).toBeLessThan(groundAccel);
    });
  });

  describe('Movement Physics Constants', () => {
    it('should define correct acceleration values', () => {
      expect(MovementConstants.ACCELERATION_GROUND).toBeGreaterThan(0);
      expect(MovementConstants.ACCELERATION_AIR).toBeGreaterThan(0);
      expect(MovementConstants.ACCELERATION_AIR).toBeLessThan(MovementConstants.ACCELERATION_GROUND);
    });

    it('should define correct maximum speeds', () => {
      expect(MovementConstants.MAX_SPEED_GROUND).toBeGreaterThan(0);
      expect(MovementConstants.MAX_SPEED_AIR).toBeGreaterThan(0);
      expect(MovementConstants.MAX_SPEED_GROUND).toBeGreaterThanOrEqual(MovementConstants.MAX_SPEED_AIR);
    });

    it('should define correct friction values', () => {
      expect(MovementConstants.FRICTION_GROUND).toBeGreaterThan(0);
      expect(MovementConstants.FRICTION_GROUND).toBeLessThanOrEqual(1);
      expect(MovementConstants.FRICTION_AIR).toBeGreaterThan(0);
      expect(MovementConstants.FRICTION_AIR).toBeLessThanOrEqual(1);
    });

    it('should define correct air control reduction', () => {
      expect(MovementConstants.AIR_CONTROL_FACTOR).toBeGreaterThan(0);
      expect(MovementConstants.AIR_CONTROL_FACTOR).toBeLessThanOrEqual(1);
    });
  });

  describe('Ground Detection', () => {
    it('should detect when player is on ground', () => {
      playerEntity.setGroundState(true);
      expect(playerEntity.isOnGround()).toBe(true);
    });

    it('should detect when player is in air', () => {
      playerEntity.setGroundState(false);
      expect(playerEntity.isOnGround()).toBe(false);
    });

    it('should update ground state correctly', () => {
      // Start on ground
      playerEntity.setGroundState(true);
      expect(playerEntity.isOnGround()).toBe(true);
      
      // Move to air
      playerEntity.setGroundState(false);
      expect(playerEntity.isOnGround()).toBe(false);
      
      // Back to ground
      playerEntity.setGroundState(true);
      expect(playerEntity.isOnGround()).toBe(true);
    });
  });

  describe('Visual Representation', () => {
    it('should create colored rectangle for player', () => {
      const visual = playerEntity.getVisual();
      expect(visual).toBeDefined();
      expect(visual.width).toBeGreaterThan(0);
      expect(visual.height).toBeGreaterThan(0);
    });

    it('should have correct player dimensions', () => {
      const visual = playerEntity.getVisual();
      expect(visual.width).toBe(MovementConstants.PLAYER_WIDTH);
      expect(visual.height).toBe(MovementConstants.PLAYER_HEIGHT);
    });

    it('should position visual correctly with physics body', () => {
      const position = playerEntity.getComponent('position') as PositionComponent;
      const visual = playerEntity.getVisual();
      
      // Update position
      position.setPosition(150, 250);
      playerEntity.updateVisualPosition();
      
      expect(visual.x).toBe(150);
      expect(visual.y).toBe(250);
    });
  });

  describe('Gravity System', () => {
    it('should apply gravity when in air', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      playerEntity.setGroundState(false);
      const initialY = velocity.y;
      
      playerEntity.applyGravity();
      
      expect(velocity.y).toBeGreaterThan(initialY);
    });

    it('should not apply gravity when on ground', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      playerEntity.setGroundState(true);
      velocity.y = 0; // Reset vertical velocity
      
      playerEntity.applyGravity();
      
      expect(velocity.y).toBe(0);
    });

    it('should have terminal velocity limit', () => {
      const velocity = playerEntity.getComponent('velocity') as VelocityComponent;
      
      playerEntity.setGroundState(false);
      
      // Apply gravity many times to reach terminal velocity
      for (let i = 0; i < 100; i++) {
        playerEntity.applyGravity();
      }
      
      expect(velocity.y).toBeLessThanOrEqual(MovementConstants.TERMINAL_VELOCITY);
    });
  });
});