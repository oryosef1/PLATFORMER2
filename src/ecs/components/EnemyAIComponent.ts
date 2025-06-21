import { IComponent } from './IComponent';

export type EnemyState = 'idle' | 'walking' | 'chasing' | 'hurt' | 'dead';
export type EnemyType = 'walker' | 'flyer' | 'charger' | 'spitter' | 'shield';

export interface EnemyAIData {
  type: EnemyType;
  state: EnemyState;
  
  // Movement
  patrolStartX: number;
  patrolDistance: number;
  walkSpeed: number;
  chaseSpeed: number;
  
  // Detection
  detectionRange: number;
  
  // Optional timers and flags (will be initialized to defaults)
  idleTimer?: number;
  hurtTimer?: number;
  direction?: number;
  isPatrolling?: boolean;
  isChasing?: boolean;
}

export class EnemyAIComponent implements IComponent {
  public type: EnemyType;
  public state: EnemyState;
  
  // Timers
  public idleTimer: number = 0;
  public hurtTimer: number = 0;
  
  // Movement
  public direction: number = 1; // Start facing right
  public patrolStartX: number;
  public patrolDistance: number;
  public walkSpeed: number;
  public chaseSpeed: number;
  
  // Detection
  public detectionRange: number;
  
  // Behavior flags
  public isPatrolling: boolean = false;
  public isChasing: boolean = false;

  constructor(data: EnemyAIData) {
    this.type = data.type;
    this.state = data.state;
    this.patrolStartX = data.patrolStartX;
    this.patrolDistance = data.patrolDistance;
    this.walkSpeed = data.walkSpeed;
    this.chaseSpeed = data.chaseSpeed;
    this.detectionRange = data.detectionRange;
    
    console.log(`[ENEMY_AI] Created ${this.type} AI component - state: ${this.state}, patrol: ${this.patrolDistance}px, detection: ${this.detectionRange}px`);
  }

  public getName(): string {
    return 'enemyAI';
  }

  public serialize(): any {
    return {
      type: this.type,
      state: this.state,
      idleTimer: this.idleTimer,
      hurtTimer: this.hurtTimer,
      direction: this.direction,
      patrolStartX: this.patrolStartX,
      patrolDistance: this.patrolDistance,
      walkSpeed: this.walkSpeed,
      chaseSpeed: this.chaseSpeed,
      detectionRange: this.detectionRange,
      isPatrolling: this.isPatrolling,
      isChasing: this.isChasing
    };
  }

  public static deserialize(data: any): EnemyAIComponent {
    const component = new EnemyAIComponent({
      type: data.type,
      state: data.state,
      patrolStartX: data.patrolStartX,
      patrolDistance: data.patrolDistance,
      walkSpeed: data.walkSpeed,
      chaseSpeed: data.chaseSpeed,
      detectionRange: data.detectionRange
    });
    
    component.idleTimer = data.idleTimer || 0;
    component.hurtTimer = data.hurtTimer || 0;
    component.direction = data.direction || 1;
    component.isPatrolling = data.isPatrolling || false;
    component.isChasing = data.isChasing || false;
    
    return component;
  }

  public clone(): EnemyAIComponent {
    return EnemyAIComponent.deserialize(this.serialize());
  }
}

// Console logging for debugging
console.log('[COMPONENT] EnemyAIComponent loaded with states:', ['idle', 'walking', 'chasing', 'hurt', 'dead']);