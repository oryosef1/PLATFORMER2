import { describe, it, expect, beforeEach } from 'vitest';
import { Entity } from '../../src/ecs/Entity';
import { PositionComponent } from '../../src/ecs/components/PositionComponent';
import { VelocityComponent } from '../../src/ecs/components/VelocityComponent';
import { CollisionComponent } from '../../src/ecs/components/CollisionComponent';
import { HurtboxComponent } from '../../src/ecs/components/HurtboxComponent';
import { MovementConstants } from '../../src/physics/MovementConstants';

/**
 * Phase 3.2: Enemy System Tests
 * 
 * This test suite follows TDD principles to define enemy system behavior
 * before implementation. Tests cover:
 * - Enemy factory pattern for creating different enemy types
 * - Basic walker enemy AI with patrol behavior
 * - Enemy state management (idle, walking, attacking, hurt, dead)
 * - Enemy-player collision detection and response
 * - Enemy health system with damage and death mechanics
 */

describe('Phase 3.2: Enemy System Tests', () => {

  describe('Enemy Factory', () => {
    it('should create walker enemy with correct components', () => {
      // Test that we can create a walker enemy with all required components
      const walkerId = 'walker-1';
      const walkerEnemy = createWalkerEnemy(100, 200, walkerId);
      
      expect(walkerEnemy).toBeDefined();
      expect(walkerEnemy.id).toBe(walkerId);
      expect(walkerEnemy.hasComponent('position')).toBe(true);
      expect(walkerEnemy.hasComponent('velocity')).toBe(true);
      expect(walkerEnemy.hasComponent('collision')).toBe(true);
      expect(walkerEnemy.hasComponent('hurtbox')).toBe(true);
      expect(walkerEnemy.hasComponent('enemyAI')).toBe(true);
      
      const position = walkerEnemy.getComponent<PositionComponent>('position')!;
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('should create enemy with correct walker AI configuration', () => {
      const walkerEnemy = createWalkerEnemy(100, 200);
      const aiComponent = walkerEnemy.getComponent('enemyAI') as any;
      
      expect(aiComponent.type).toBe('walker');
      expect(aiComponent.state).toBe('idle');
      expect(aiComponent.patrolDistance).toBe(120); // pixels
      expect(aiComponent.walkSpeed).toBe(40); // pixels/second
      expect(aiComponent.detectionRange).toBe(200); // pixels
    });

    it('should create enemy with correct collision and health properties', () => {
      const walkerEnemy = createWalkerEnemy(100, 200);
      
      const collision = walkerEnemy.getComponent<CollisionComponent>('collision')!;
      expect(collision.width).toBe(24);
      expect(collision.height).toBe(32);
      expect(collision.layer).toBe('enemy');
      
      const hurtbox = walkerEnemy.getComponent<HurtboxComponent>('hurtbox')!;
      expect(hurtbox.maxHealth).toBe(30);
      expect(hurtbox.currentHealth).toBe(30);
      expect(hurtbox.defense).toBe(0);
    });

    it('should create multiple enemies with unique IDs', () => {
      const enemy1 = createWalkerEnemy(100, 200);
      const enemy2 = createWalkerEnemy(300, 200);
      
      expect(enemy1.id).not.toBe(enemy2.id);
      expect(enemy1.id).toMatch(/^walker-enemy-\d+$/);
      expect(enemy2.id).toMatch(/^walker-enemy-\d+$/);
    });
  });

  describe('Walker Enemy AI', () => {
    let walkerEnemy: Entity;
    let aiComponent: any;
    let velocity: VelocityComponent;
    let position: PositionComponent;

    beforeEach(() => {
      walkerEnemy = createWalkerEnemy(100, 200);
      aiComponent = walkerEnemy.getComponent('enemyAI');
      velocity = walkerEnemy.getComponent<VelocityComponent>('velocity')!;
      position = walkerEnemy.getComponent<PositionComponent>('position')!;
    });

    it('should start in idle state', () => {
      expect(aiComponent.state).toBe('idle');
      expect(aiComponent.idleTimer).toBe(0);
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });

    it('should transition from idle to walking after idle duration', () => {
      // Simulate idle duration (2 seconds = 120 frames)
      for (let i = 0; i < 120; i++) {
        updateWalkerAI(walkerEnemy, 1/60);
      }
      
      expect(aiComponent.state).toBe('walking');
      expect(Math.abs(velocity.x)).toBe(40); // Walking speed
      expect(velocity.x).toBeOneOf([40, -40]); // Can walk left or right
    });

    it('should patrol within patrol distance', () => {
      const startX = position.x;
      
      // Start walking right
      aiComponent.state = 'walking';
      aiComponent.direction = 1;
      velocity.x = 40;
      
      // Walk to patrol boundary
      position.x = startX + 120; // Max patrol distance
      updateWalkerAI(walkerEnemy, 1/60);
      
      // Should reverse direction
      expect(aiComponent.direction).toBe(-1);
      expect(velocity.x).toBe(-40);
    });

    it('should reverse direction when hitting patrol boundary', () => {
      const startX = position.x;
      
      // Start walking left
      aiComponent.state = 'walking';
      aiComponent.direction = -1;
      velocity.x = -40;
      
      // Walk to left patrol boundary
      position.x = startX - 120; // Max patrol distance
      updateWalkerAI(walkerEnemy, 1/60);
      
      // Should reverse direction
      expect(aiComponent.direction).toBe(1);
      expect(velocity.x).toBe(40);
    });

    it('should detect player within detection range', () => {
      const playerPosition = { x: 180, y: 200 }; // 80 pixels away
      
      const playerInRange = isPlayerInDetectionRange(walkerEnemy, playerPosition);
      expect(playerInRange).toBe(true);
      
      const farPlayerPosition = { x: 350, y: 200 }; // 250 pixels away
      const playerOutOfRange = isPlayerInDetectionRange(walkerEnemy, farPlayerPosition);
      expect(playerOutOfRange).toBe(false);
    });

    it('should chase player when detected', () => {
      const playerPosition = { x: 180, y: 200 }; // Player to the right
      
      aiComponent.state = 'idle';
      updateWalkerAI(walkerEnemy, 1/60, playerPosition);
      
      expect(aiComponent.state).toBe('chasing');
      expect(velocity.x).toBe(60); // Faster chase speed
    });

    it('should return to patrolling when player out of range', () => {
      const playerPosition = { x: 400, y: 200 }; // Player far away
      
      aiComponent.state = 'chasing';
      velocity.x = 60;
      updateWalkerAI(walkerEnemy, 1/60, playerPosition);
      
      expect(aiComponent.state).toBe('walking');
      expect(Math.abs(velocity.x)).toBe(40); // Normal walk speed
    });
  });

  describe('Enemy State Management', () => {
    let walkerEnemy: Entity;
    let aiComponent: any;

    beforeEach(() => {
      walkerEnemy = createWalkerEnemy(100, 200);
      aiComponent = walkerEnemy.getComponent('enemyAI');
    });

    it('should handle state transitions correctly', () => {
      expect(aiComponent.state).toBe('idle');
      
      setEnemyState(walkerEnemy, 'walking');
      expect(aiComponent.state).toBe('walking');
      
      setEnemyState(walkerEnemy, 'chasing');
      expect(aiComponent.state).toBe('chasing');
      
      setEnemyState(walkerEnemy, 'hurt');
      expect(aiComponent.state).toBe('hurt');
      
      setEnemyState(walkerEnemy, 'dead');
      expect(aiComponent.state).toBe('dead');
    });

    it('should handle hurt state with stun duration', () => {
      setEnemyState(walkerEnemy, 'hurt');
      
      expect(aiComponent.state).toBe('hurt');
      expect(aiComponent.hurtTimer).toBe(30); // 0.5 seconds at 60fps
      
      // Update during hurt state
      for (let i = 0; i < 15; i++) {
        updateWalkerAI(walkerEnemy, 1/60);
      }
      
      expect(aiComponent.state).toBe('hurt'); // Still hurt
      expect(aiComponent.hurtTimer).toBe(15);
      
      // Complete hurt duration
      for (let i = 0; i < 15; i++) {
        updateWalkerAI(walkerEnemy, 1/60);
      }
      
      expect(aiComponent.state).toBe('idle'); // Return to idle after hurt
      expect(aiComponent.hurtTimer).toBe(0);
    });

    it('should not move while in hurt state', () => {
      const velocity = walkerEnemy.getComponent<VelocityComponent>('velocity')!;
      
      setEnemyState(walkerEnemy, 'hurt');
      updateWalkerAI(walkerEnemy, 1/60);
      
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });

    it('should remain in dead state permanently', () => {
      setEnemyState(walkerEnemy, 'dead');
      
      for (let i = 0; i < 100; i++) {
        updateWalkerAI(walkerEnemy, 1/60);
      }
      
      expect(aiComponent.state).toBe('dead');
    });
  });

  describe('Enemy-Player Collision', () => {
    let walkerEnemy: Entity;
    let playerEntity: Entity;

    beforeEach(() => {
      walkerEnemy = createWalkerEnemy(100, 200);
      // Create a mock player entity
      playerEntity = new Entity();
      playerEntity.addComponent('position', new PositionComponent(105, 200));
      playerEntity.addComponent('collision', new CollisionComponent(32, 48, 0, 0, false, false, 'player'));
      playerEntity.addComponent('hurtbox', new HurtboxComponent({
        x: 105, y: 200, width: 32, height: 48,
        maxHealth: 100, defense: 0, owner: playerEntity.id, maxInvincibilityFrames: 30
      }));
    });

    it('should detect collision between enemy and player', () => {
      const collision = checkEnemyPlayerCollision(walkerEnemy, playerEntity);
      expect(collision).toBe(true);
    });

    it('should not detect collision when entities are apart', () => {
      const playerPos = playerEntity.getComponent<PositionComponent>('position')!;
      playerPos.x = 200; // Move player away
      
      const collision = checkEnemyPlayerCollision(walkerEnemy, playerEntity);
      expect(collision).toBe(false);
    });

    it('should handle enemy taking damage from player attack', () => {
      const hurtbox = walkerEnemy.getComponent<HurtboxComponent>('hurtbox')!;
      const initialHealth = hurtbox.currentHealth;
      
      const damage = 15;
      const wasDamaged = damageEnemy(walkerEnemy, damage);
      
      expect(wasDamaged).toBe(true);
      expect(hurtbox.currentHealth).toBe(initialHealth - damage);
      
      const aiComponent = walkerEnemy.getComponent('enemyAI') as any;
      expect(aiComponent.state).toBe('hurt');
    });

    it('should make enemy invincible during hurt frames', () => {
      const damage = 10;
      
      // First hit should damage
      const firstHit = damageEnemy(walkerEnemy, damage);
      expect(firstHit).toBe(true);
      
      // Immediate second hit should not damage (invincible)
      const secondHit = damageEnemy(walkerEnemy, damage);
      expect(secondHit).toBe(false);
      
      const hurtbox = walkerEnemy.getComponent<HurtboxComponent>('hurtbox')!;
      expect(hurtbox.currentHealth).toBe(20); // Only damaged once
    });

    it('should handle player taking damage from enemy contact', () => {
      const playerHurtbox = playerEntity.getComponent<HurtboxComponent>('hurtbox')!;
      const initialHealth = playerHurtbox.currentHealth;
      
      const damage = 10;
      const wasDamaged = damagePlayer(playerEntity, damage);
      
      expect(wasDamaged).toBe(true);
      expect(playerHurtbox.currentHealth).toBe(initialHealth - damage);
    });
  });

  describe('Enemy Health System', () => {
    let walkerEnemy: Entity;
    let hurtbox: HurtboxComponent;

    beforeEach(() => {
      walkerEnemy = createWalkerEnemy(100, 200);
      hurtbox = walkerEnemy.getComponent<HurtboxComponent>('hurtbox')!;
    });

    it('should start with full health', () => {
      expect(hurtbox.currentHealth).toBe(30);
      expect(hurtbox.maxHealth).toBe(30);
      expect(isEnemyDead(walkerEnemy)).toBe(false);
    });

    it('should reduce health when taking damage', () => {
      damageEnemy(walkerEnemy, 15);
      expect(hurtbox.currentHealth).toBe(15);
      expect(isEnemyDead(walkerEnemy)).toBe(false);
    });

    it('should die when health reaches zero', () => {
      damageEnemy(walkerEnemy, 30);
      expect(hurtbox.currentHealth).toBe(0);
      expect(isEnemyDead(walkerEnemy)).toBe(true);
      
      const aiComponent = walkerEnemy.getComponent('enemyAI') as any;
      expect(aiComponent.state).toBe('dead');
    });

    it('should not take damage below zero health', () => {
      damageEnemy(walkerEnemy, 50); // Overkill damage
      expect(hurtbox.currentHealth).toBe(0);
      expect(isEnemyDead(walkerEnemy)).toBe(true);
    });

    it('should handle multiple damage instances correctly', () => {
      damageEnemy(walkerEnemy, 10);
      expect(hurtbox.currentHealth).toBe(20);
      
      // Wait for invincibility to expire
      for (let i = 0; i < 15; i++) {
        updateEnemyHurtbox(walkerEnemy, 1/60);
      }
      
      damageEnemy(walkerEnemy, 10);
      expect(hurtbox.currentHealth).toBe(10);
      
      // Wait for invincibility to expire
      for (let i = 0; i < 15; i++) {
        updateEnemyHurtbox(walkerEnemy, 1/60);
      }
      
      damageEnemy(walkerEnemy, 10);
      expect(hurtbox.currentHealth).toBe(0);
      expect(isEnemyDead(walkerEnemy)).toBe(true);
    });

    it('should handle invincibility frames correctly', () => {
      damageEnemy(walkerEnemy, 10);
      expect(hurtbox.invincibilityFrames).toBeGreaterThan(0);
      
      // Update invincibility frames
      updateEnemyHurtbox(walkerEnemy, 1/60);
      expect(hurtbox.invincibilityFrames).toBeGreaterThan(0);
      
      // Wait for invincibility to expire
      for (let i = 0; i < 15; i++) {
        updateEnemyHurtbox(walkerEnemy, 1/60);
      }
      
      expect(hurtbox.invincibilityFrames).toBe(0);
    });
  });
});

// Import the actual implementations
import { WalkerEnemyEntity } from '../../src/entities/WalkerEnemyEntity';
import { EnemyAISystem } from '../../src/ecs/systems/EnemyAISystem';
import { EnemyAIComponent } from '../../src/ecs/components/EnemyAIComponent';

// Helper functions implementation
function createWalkerEnemy(x: number, y: number, id?: string): Entity {
  return new WalkerEnemyEntity(x, y, id);
}

function updateWalkerAI(enemy: Entity, deltaTime: number, playerPosition?: { x: number, y: number }): void {
  const aiSystem = new EnemyAISystem();
  aiSystem.addEntity(enemy);
  aiSystem.update(deltaTime, playerPosition);
}

function isPlayerInDetectionRange(enemy: Entity, playerPosition: { x: number, y: number }): boolean {
  return EnemyAISystem.isPlayerInDetectionRange(enemy, playerPosition);
}

function setEnemyState(enemy: Entity, state: string): void {
  EnemyAISystem.setEnemyState(enemy, state as any);
}

function checkEnemyPlayerCollision(enemy: Entity, player: Entity): boolean {
  const enemyPos = enemy.getComponent<PositionComponent>('position')!;
  const enemyCol = enemy.getComponent<CollisionComponent>('collision')!;
  const playerPos = player.getComponent<PositionComponent>('position')!;
  const playerCol = player.getComponent<CollisionComponent>('collision')!;
  
  // Simple AABB collision detection
  const enemyLeft = enemyPos.x - enemyCol.width / 2;
  const enemyRight = enemyPos.x + enemyCol.width / 2;
  const enemyTop = enemyPos.y - enemyCol.height / 2;
  const enemyBottom = enemyPos.y + enemyCol.height / 2;
  
  const playerLeft = playerPos.x - playerCol.width / 2;
  const playerRight = playerPos.x + playerCol.width / 2;
  const playerTop = playerPos.y - playerCol.height / 2;
  const playerBottom = playerPos.y + playerCol.height / 2;
  
  return !(enemyRight < playerLeft || 
           enemyLeft > playerRight || 
           enemyBottom < playerTop || 
           enemyTop > playerBottom);
}

function damageEnemy(enemy: Entity, damage: number): boolean {
  const hurtbox = enemy.getComponent<HurtboxComponent>('hurtbox')!;
  
  // Use the hurtbox's takeDamage method directly (like CombatSystem does)
  const wasDamaged = hurtbox.takeDamage(damage);
  
  // Update AI state like EnemyAISystem would do
  if (wasDamaged) {
    const aiSystem = new EnemyAISystem();
    aiSystem.addEntity(enemy);
    aiSystem.update(0); // Update to sync health state with AI
  }
  
  return wasDamaged;
}

function damagePlayer(player: Entity, damage: number): boolean {
  const hurtbox = player.getComponent<HurtboxComponent>('hurtbox')!;
  
  if (hurtbox.invincibilityFrames > 0) {
    return false;
  }
  
  hurtbox.currentHealth = Math.max(0, hurtbox.currentHealth - damage);
  hurtbox.invincibilityFrames = hurtbox.maxInvincibilityFrames;
  
  return true;
}

function isEnemyDead(enemy: Entity): boolean {
  const ai = enemy.getComponent<EnemyAIComponent>('enemyAI')!;
  return ai.state === 'dead';
}

function updateEnemyHurtbox(enemy: Entity, deltaTime: number): void {
  const hurtbox = enemy.getComponent<HurtboxComponent>('hurtbox');
  if (hurtbox) {
    // Use the HurtboxComponent's own update method which properly handles vulnerable flag
    hurtbox.update();
  }
}

// Custom matchers for Vitest
declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toBeOneOf(values: T[]): void;
    }
  }
}

expect.extend({
  toBeOneOf(received: any, values: any[]) {
    const pass = values.includes(received);
    return {
      pass,
      message: () => pass
        ? `Expected ${received} not to be one of ${values.join(', ')}`
        : `Expected ${received} to be one of ${values.join(', ')}`
    };
  }
});