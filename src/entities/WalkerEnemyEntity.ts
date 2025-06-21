import { Entity } from '../ecs/Entity';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { VelocityComponent } from '../ecs/components/VelocityComponent';
import { CollisionComponent } from '../ecs/components/CollisionComponent';
import { HurtboxComponent } from '../ecs/components/HurtboxComponent';
import { EnemyAIComponent } from '../ecs/components/EnemyAIComponent';

export class WalkerEnemyEntity extends Entity {
  private static idCounter: number = 0;

  constructor(x: number = 100, y: number = 100, customId?: string) {
    super();
    
    // Generate unique ID - Entity constructor handles this
    if (customId) {
      Object.defineProperty(this, 'id', { value: customId, writable: false });
    } else {
      Object.defineProperty(this, 'id', { value: `walker-enemy-${++WalkerEnemyEntity.idCounter}`, writable: false });
    }
    
    console.log(`[WALKER_ENEMY] Creating walker enemy entity at (${x}, ${y}) with ID: ${this.id}`);
    
    // Add required components
    this.addComponent('position', new PositionComponent(x, y));
    this.addComponent('velocity', new VelocityComponent(0, 0));
    
    // Collision component - smaller than player for easier navigation
    this.addComponent('collision', new CollisionComponent(
      24, // width
      32, // height
      0,  // offsetX
      0,  // offsetY
      false, // isTrigger
      false, // isStatic
      'enemy' // layer
    ));
    
    // Hurtbox component for taking damage
    this.addComponent('hurtbox', new HurtboxComponent({
      x: x,
      y: y,
      width: 24,
      height: 32,
      maxHealth: 30,
      defense: 0,
      owner: this.id,
      maxInvincibilityFrames: 15 // 0.25 seconds at 60fps
    }));
    
    // AI component for walker behavior
    this.addComponent('enemyAI', new EnemyAIComponent({
      type: 'walker',
      state: 'idle',
      patrolStartX: x,
      patrolDistance: 120, // pixels
      walkSpeed: 40, // pixels/second
      chaseSpeed: 60, // pixels/second (faster when chasing)
      detectionRange: 200 // pixels
    }));
    
    console.log(`[WALKER_ENEMY] Walker enemy entity created with components: ${Object.keys(this.components)}`);
  }

  public getAIComponent(): EnemyAIComponent {
    return this.getComponent<EnemyAIComponent>('enemyAI')!;
  }

  public getHurtboxComponent(): HurtboxComponent {
    return this.getComponent<HurtboxComponent>('hurtbox')!;
  }

  public isAlive(): boolean {
    const ai = this.getAIComponent();
    return ai.state !== 'dead';
  }


  public setState(newState: 'idle' | 'walking' | 'chasing' | 'hurt' | 'dead'): void {
    const ai = this.getAIComponent();
    const oldState = ai.state;
    ai.state = newState;
    
    // Reset relevant timers when changing states
    switch (newState) {
      case 'idle':
        ai.idleTimer = 0;
        ai.isPatrolling = false;
        ai.isChasing = false;
        break;
      case 'walking':
        ai.isPatrolling = true;
        ai.isChasing = false;
        break;
      case 'chasing':
        ai.isPatrolling = false;
        ai.isChasing = true;
        break;
      case 'hurt':
        ai.hurtTimer = 30; // 0.5 seconds
        ai.isPatrolling = false;
        ai.isChasing = false;
        break;
      case 'dead':
        ai.hurtTimer = 0;
        ai.isPatrolling = false;
        ai.isChasing = false;
        break;
    }
    
    console.log(`[WALKER_ENEMY] Enemy ${this.id} state changed: ${oldState} -> ${newState}`);
  }
}

console.log('[ENTITY] WalkerEnemyEntity class loaded with AI and combat integration');