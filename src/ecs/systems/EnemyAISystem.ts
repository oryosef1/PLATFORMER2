import { Entity } from '../Entity';
import { PositionComponent } from '../components/PositionComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { HurtboxComponent } from '../components/HurtboxComponent';
import { EnemyAIComponent } from '../components/EnemyAIComponent';

export interface PlayerPosition {
  x: number;
  y: number;
}

export class EnemyAISystem {
  private entities: Entity[] = [];

  public addEntity(entity: Entity): void {
    if (entity.hasComponent('enemyAI') && 
        entity.hasComponent('position') && 
        entity.hasComponent('velocity')) {
      this.entities.push(entity);
      console.log(`[ENEMY_AI_SYSTEM] Added entity ${entity.id} to AI system`);
    }
  }

  public removeEntity(entity: Entity): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      console.log(`[ENEMY_AI_SYSTEM] Removed entity ${entity.id} from AI system`);
    }
  }

  public update(deltaTime: number, playerPosition?: PlayerPosition): void {
    for (const entity of this.entities) {
      this.updateEnemyHealthState(entity);
      this.updateEnemyAI(entity, deltaTime, playerPosition);
      // Hurtbox invincibility is now handled by the CombatSystem calling hurtbox.update()
    }
  }

  private updateEnemyHealthState(entity: Entity): void {
    const ai = entity.getComponent<EnemyAIComponent>('enemyAI')!;
    const hurtbox = entity.getComponent<HurtboxComponent>('hurtbox');
    
    if (!hurtbox) return;
    
    // Check if enemy should be dead
    if (hurtbox.currentHealth <= 0 && ai.state !== 'dead') {
      ai.state = 'dead';
      ai.hurtTimer = 0;
      console.log(`[ENEMY_AI] Enemy ${entity.id} died from health depletion`);
      return;
    }
    
    // Check if enemy was just damaged (invincibility frames active and not in hurt state)
    if (hurtbox.invincibilityFrames > 0 && !hurtbox.vulnerable && ai.state !== 'hurt' && ai.state !== 'dead') {
      ai.state = 'hurt';
      ai.hurtTimer = 30; // 0.5 seconds at 60fps
      console.log(`[ENEMY_AI] Enemy ${entity.id} entered hurt state from damage`);
    }
  }

  private updateEnemyAI(entity: Entity, deltaTime: number, playerPosition?: PlayerPosition): void {
    const ai = entity.getComponent<EnemyAIComponent>('enemyAI')!;
    const position = entity.getComponent<PositionComponent>('position')!;
    const velocity = entity.getComponent<VelocityComponent>('velocity')!;

    // Handle different AI types
    switch (ai.type) {
      case 'walker':
        this.updateWalkerAI(entity, ai, position, velocity, deltaTime, playerPosition);
        break;
      default:
        console.warn(`[ENEMY_AI_SYSTEM] Unknown enemy type: ${ai.type}`);
    }
  }

  private updateWalkerAI(
    entity: Entity, 
    ai: EnemyAIComponent, 
    position: PositionComponent, 
    velocity: VelocityComponent,
    deltaTime: number,
    playerPosition?: PlayerPosition
  ): void {
    switch (ai.state) {
      case 'idle':
        this.handleIdleState(ai, velocity, deltaTime, playerPosition, position);
        break;
      case 'walking':
        this.handleWalkingState(ai, position, velocity, deltaTime, playerPosition);
        break;
      case 'chasing':
        this.handleChasingState(ai, position, velocity, deltaTime, playerPosition);
        break;
      case 'hurt':
        this.handleHurtState(ai, velocity, deltaTime, playerPosition, position);
        break;
      case 'dead':
        this.handleDeadState(velocity);
        break;
    }
  }

  private handleIdleState(
    ai: EnemyAIComponent, 
    velocity: VelocityComponent, 
    deltaTime: number, 
    playerPosition?: PlayerPosition,
    position?: PositionComponent
  ): void {
    // Stop movement while idle
    velocity.x = 0;
    
    // Check for player detection first
    if (playerPosition && position && this.isPlayerInRange(position, playerPosition, ai.detectionRange)) {
      ai.state = 'chasing';
      ai.isChasing = true;
      const direction = playerPosition.x > position.x ? 1 : -1;
      ai.direction = direction;
      velocity.x = direction * ai.chaseSpeed;
      console.log(`[WALKER_AI] Player detected! Starting chase in direction ${direction}`);
      return;
    }
    
    // Increment idle timer
    ai.idleTimer += deltaTime * 60; // Convert to frames (60fps)
    
    // After 2 seconds (120 frames), start walking
    if (ai.idleTimer >= 120) {
      ai.state = 'walking';
      ai.isPatrolling = true;
      ai.idleTimer = 0;
      
      // Choose random direction
      ai.direction = Math.random() < 0.5 ? -1 : 1;
      velocity.x = ai.direction * ai.walkSpeed;
      
      console.log(`[WALKER_AI] Starting to walk in direction ${ai.direction}`);
    }
  }

  private handleWalkingState(
    ai: EnemyAIComponent, 
    position: PositionComponent, 
    velocity: VelocityComponent,
    deltaTime: number,
    playerPosition?: PlayerPosition
  ): void {
    // Check for player detection first
    if (playerPosition && this.isPlayerInRange(position, playerPosition, ai.detectionRange)) {
      ai.state = 'chasing';
      ai.isPatrolling = false;
      ai.isChasing = true;
      const direction = playerPosition.x > position.x ? 1 : -1;
      ai.direction = direction;
      velocity.x = direction * ai.chaseSpeed;
      console.log(`[WALKER_AI] Player detected while walking! Starting chase`);
      return;
    }
    
    // Check patrol boundaries
    const distanceFromStart = position.x - ai.patrolStartX;
    
    if (Math.abs(distanceFromStart) >= ai.patrolDistance) {
      // Reverse direction at patrol boundary
      ai.direction *= -1;
      velocity.x = ai.direction * ai.walkSpeed;
      console.log(`[WALKER_AI] Hit patrol boundary, reversing direction to ${ai.direction}`);
    } else {
      // Continue walking in current direction
      velocity.x = ai.direction * ai.walkSpeed;
    }
  }

  private handleChasingState(
    ai: EnemyAIComponent, 
    position: PositionComponent, 
    velocity: VelocityComponent,
    deltaTime: number,
    playerPosition?: PlayerPosition
  ): void {
    if (!playerPosition || !this.isPlayerInRange(position, playerPosition, ai.detectionRange)) {
      // Lost player, return to walking
      ai.state = 'walking';
      ai.isChasing = false;
      ai.isPatrolling = true;
      velocity.x = ai.direction * ai.walkSpeed;
      console.log(`[WALKER_AI] Lost player, returning to patrol`);
      return;
    }
    
    // Chase the player
    const direction = playerPosition.x > position.x ? 1 : -1;
    ai.direction = direction;
    velocity.x = direction * ai.chaseSpeed;
  }

  private handleHurtState(
    ai: EnemyAIComponent, 
    velocity: VelocityComponent, 
    deltaTime: number, 
    playerPosition?: PlayerPosition,
    position?: PositionComponent
  ): void {
    // Stop movement while hurt
    velocity.x = 0;
    
    // Countdown hurt timer
    ai.hurtTimer = Math.max(0, ai.hurtTimer - deltaTime * 60);
    
    // When hurt timer expires, check if player is in range
    if (ai.hurtTimer <= 0) {
      if (playerPosition && position && this.isPlayerInRange(position, playerPosition, ai.detectionRange)) {
        // Player still in range, go back to chasing
        ai.state = 'chasing';
        ai.isChasing = true;
        ai.isPatrolling = false;
        const direction = playerPosition.x > position.x ? 1 : -1;
        ai.direction = direction;
        velocity.x = direction * ai.chaseSpeed;
        console.log(`[WALKER_AI] Hurt state ended, resuming chase`);
      } else {
        // No player in range, return to idle
        ai.state = 'idle';
        ai.idleTimer = 0;
        ai.isChasing = false;
        ai.isPatrolling = false;
        console.log(`[WALKER_AI] Hurt state ended, returning to idle`);
      }
    }
  }

  private handleDeadState(velocity: VelocityComponent): void {
    // Dead enemies don't move
    velocity.x = 0;
    velocity.y = 0;
  }

  private isPlayerInRange(enemyPosition: PositionComponent, playerPosition: PlayerPosition, range: number): boolean {
    const distance = Math.sqrt(
      Math.pow(playerPosition.x - enemyPosition.x, 2) +
      Math.pow(playerPosition.y - enemyPosition.y, 2)
    );
    return distance <= range;
  }


  // Public helper methods for testing and external use
  public static isPlayerInDetectionRange(enemy: Entity, playerPosition: PlayerPosition): boolean {
    const position = enemy.getComponent<PositionComponent>('position')!;
    const ai = enemy.getComponent<EnemyAIComponent>('enemyAI')!;
    
    const distance = Math.sqrt(
      Math.pow(playerPosition.x - position.x, 2) +
      Math.pow(playerPosition.y - position.y, 2)
    );
    
    return distance <= ai.detectionRange;
  }

  public static setEnemyState(enemy: Entity, state: 'idle' | 'walking' | 'chasing' | 'hurt' | 'dead'): void {
    const ai = enemy.getComponent<EnemyAIComponent>('enemyAI')!;
    const velocity = enemy.getComponent<VelocityComponent>('velocity')!;
    
    ai.state = state;
    
    // Set appropriate velocity and timers for each state
    switch (state) {
      case 'idle':
        ai.idleTimer = 0;
        ai.isPatrolling = false;
        ai.isChasing = false;
        velocity.x = 0;
        break;
      case 'walking':
        ai.isPatrolling = true;
        ai.isChasing = false;
        velocity.x = ai.direction * ai.walkSpeed;
        break;
      case 'chasing':
        ai.isPatrolling = false;
        ai.isChasing = true;
        velocity.x = ai.direction * ai.chaseSpeed;
        break;
      case 'hurt':
        ai.hurtTimer = 30; // 0.5 seconds at 60fps
        ai.isPatrolling = false;
        ai.isChasing = false;
        velocity.x = 0;
        break;
      case 'dead':
        ai.hurtTimer = 0;
        ai.isPatrolling = false;
        ai.isChasing = false;
        velocity.x = 0;
        velocity.y = 0;
        break;
    }
  }

  public getEntityCount(): number {
    return this.entities.length;
  }
}

console.log('[SYSTEM] EnemyAISystem loaded with walker AI behavior');