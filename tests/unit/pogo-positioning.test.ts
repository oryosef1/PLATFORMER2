import { describe, test, expect, beforeEach } from 'vitest';
import { PlayerEntity } from '../../src/entities/PlayerEntity';
import { MovementConstants } from '../../src/physics/MovementConstants';

describe('Pogo Positioning Tests', () => {
  let playerEntity: PlayerEntity;

  beforeEach(() => {
    playerEntity = new PlayerEntity(100, 200);
    playerEntity.setGroundState(false); // In air for pogo testing
  });

  test('should position hitbox below player center', () => {
    // Execute downward attack
    const result = playerEntity.executeDownwardAttack();
    expect(result).toBe(true);

    // Get player position and hitbox
    const position = playerEntity.getComponent('position');
    const hitbox = playerEntity.getComponent('hitbox');
    
    expect(position).toBeDefined();
    expect(hitbox).toBeDefined();

    if (position && hitbox) {
      console.log(`[TEST] Player position: (${position.x}, ${position.y})`);
      console.log(`[TEST] Hitbox position: (${hitbox.x}, ${hitbox.y})`);
      console.log(`[TEST] Player height: ${MovementConstants.PLAYER_HEIGHT}`);
      console.log(`[TEST] Player half height: ${MovementConstants.PLAYER_HEIGHT / 2}`);
      
      // Calculate expected hitbox position
      const playerHalfHeight = MovementConstants.PLAYER_HEIGHT / 2; // 24
      const swordGap = 4;
      const hitboxHeight = 50;
      const expectedHitboxY = position.y + playerHalfHeight + swordGap + (hitboxHeight / 2);
      
      console.log(`[TEST] Expected hitbox Y: ${expectedHitboxY}`);
      console.log(`[TEST] Actual hitbox Y: ${hitbox.y}`);
      console.log(`[TEST] Difference: ${hitbox.y - expectedHitboxY}`);
      
      // Hitbox should be positioned below player
      expect(hitbox.y).toBeGreaterThan(position.y);
      
      // Hitbox Y position should match expected calculation
      expect(hitbox.y).toBeCloseTo(expectedHitboxY, 1);
      
      // The gap between player bottom and hitbox top should be 4 pixels  
      const playerBottom = position.y + playerHalfHeight;
      const hitboxTop = hitbox.y - (50 / 2); // Use actual hitbox height
      const actualGap = hitboxTop - playerBottom;
      
      console.log(`[TEST] Player bottom: ${playerBottom}`);
      console.log(`[TEST] Hitbox top: ${hitboxTop}`);
      console.log(`[TEST] Actual gap: ${actualGap}`);
      
      expect(actualGap).toBeCloseTo(4, 1);
    }
  });

  test('should have correct hitbox dimensions for pogo attack', () => {
    playerEntity.executeDownwardAttack();
    const hitbox = playerEntity.getComponent('hitbox');
    
    expect(hitbox).toBeDefined();
    if (hitbox) {
      // Pogo hitbox should be 16x50 (standardized size)
      expect(hitbox.width).toBe(16);
      expect(hitbox.height).toBe(50);
      expect(hitbox.attackType).toBe('pogo');
    }
  });

  test('should position hitbox center correctly relative to player center', () => {
    playerEntity.executeDownwardAttack();
    
    const position = playerEntity.getComponent('position');
    const hitbox = playerEntity.getComponent('hitbox');
    
    if (position && hitbox) {
      // Distance from player center to hitbox center
      const distanceY = hitbox.y - position.y;
      
      // This should be: playerHalfHeight + gap + hitboxHalfHeight
      const expectedDistance = (MovementConstants.PLAYER_HEIGHT / 2) + 4 + (50 / 2);
      
      console.log(`[TEST] Distance from player center to hitbox center: ${distanceY}`);
      console.log(`[TEST] Expected distance: ${expectedDistance}`);
      
      expect(distanceY).toBeCloseTo(expectedDistance, 1);
      expect(distanceY).toBeGreaterThan(0); // Hitbox should be below player
    }
  });

  test('should calculate sword visual position same as hitbox position', () => {
    playerEntity.executeDownwardAttack();
    
    const position = playerEntity.getComponent('position');
    const hitbox = playerEntity.getComponent('hitbox');
    
    if (position && hitbox) {
      // Calculate sword visual position using GameScene logic
      const playerHalfHeight = MovementConstants.PLAYER_HEIGHT / 2;
      const swordGap = 4;
      const swordHeight = 50;
      const expectedSwordY = position.y + playerHalfHeight + swordGap + (swordHeight / 2);
      
      console.log(`[TEST] Hitbox Y: ${hitbox.y}`);
      console.log(`[TEST] Expected sword visual Y: ${expectedSwordY}`);
      console.log(`[TEST] Match: ${hitbox.y === expectedSwordY}`);
      
      // Sword visual position should exactly match hitbox position
      expect(expectedSwordY).toBe(hitbox.y);
    }
  });
});