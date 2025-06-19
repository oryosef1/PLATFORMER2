import { Entity } from '../ecs/Entity';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { VelocityComponent } from '../ecs/components/VelocityComponent';
import { InputComponent } from '../ecs/components/InputComponent';
import { MovementConstants } from '../physics/MovementConstants';

export interface PlayerVisual {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class PlayerEntity extends Entity {
  private isGrounded: boolean = true;
  private visual: PlayerVisual;

  constructor(x: number = 100, y: number = 100) {
    super();
    console.log(`[PLAYER] Creating player entity at (${x}, ${y})`);
    
    // Add required components
    this.addComponent('position', new PositionComponent(x, y));
    this.addComponent('velocity', new VelocityComponent(0, 0));
    
    // Setup input component with default bindings
    const inputComponent = new InputComponent({
      moveLeft: 'ArrowLeft',
      moveRight: 'ArrowRight',
      jump: 'ArrowUp',
      dash: 'KeyX'
    });
    this.addComponent('input', inputComponent);
    
    // Create visual representation
    this.visual = {
      x: x,
      y: y,
      width: MovementConstants.PLAYER_WIDTH,
      height: MovementConstants.PLAYER_HEIGHT
    };
    
    console.log('[PLAYER] Player entity created with components:', Array.from(this.components.keys()));
  }

  public applyMovement(direction: string, isPressed: boolean, isOnGround: boolean): void {
    const velocity = this.getComponent('velocity') as VelocityComponent;
    
    if (!isPressed || direction === 'none') {
      // Apply friction when no input
      this.applyFriction(isOnGround);
      return;
    }
    
    // Determine acceleration based on ground state
    const acceleration = isOnGround 
      ? MovementConstants.ACCELERATION_GROUND 
      : MovementConstants.ACCELERATION_AIR * MovementConstants.AIR_CONTROL_FACTOR;
    
    // Determine max speed based on ground state
    const maxSpeed = isOnGround 
      ? MovementConstants.MAX_SPEED_GROUND 
      : MovementConstants.MAX_SPEED_AIR;
    
    // Apply movement based on direction
    const accelPerFrame = acceleration * MovementConstants.FIXED_TIMESTEP;
    
    if (direction === 'left') {
      velocity.x -= accelPerFrame;
      if (velocity.x < -maxSpeed) {
        velocity.x = -maxSpeed;
      }
      console.log(`[PLAYER] Moving left, velocity.x: ${velocity.x.toFixed(2)}`);
    } else if (direction === 'right') {
      velocity.x += accelPerFrame;
      if (velocity.x > maxSpeed) {
        velocity.x = maxSpeed;
      }
      console.log(`[PLAYER] Moving right, velocity.x: ${velocity.x.toFixed(2)}`);
    }
  }

  public applyFriction(isOnGround: boolean): void {
    const velocity = this.getComponent('velocity') as VelocityComponent;
    
    const friction = isOnGround 
      ? MovementConstants.FRICTION_GROUND 
      : MovementConstants.FRICTION_AIR;
    
    const oldVelocityX = velocity.x;
    velocity.x *= friction;
    
    // Stop very small velocities
    if (Math.abs(velocity.x) < MovementConstants.STOP_THRESHOLD) {
      velocity.x = 0;
    }
    
    if (Math.abs(oldVelocityX - velocity.x) > 0.1) {
      console.log(`[PLAYER] Friction applied, velocity.x: ${oldVelocityX.toFixed(2)} -> ${velocity.x.toFixed(2)}`);
    }
  }

  public applyGravity(): void {
    if (this.isGrounded) {
      // Don't apply gravity when on ground
      return;
    }
    
    const velocity = this.getComponent('velocity') as VelocityComponent;
    const gravityPerFrame = MovementConstants.GRAVITY * MovementConstants.FIXED_TIMESTEP;
    
    velocity.y += gravityPerFrame;
    
    // Apply terminal velocity limit
    if (velocity.y > MovementConstants.TERMINAL_VELOCITY) {
      velocity.y = MovementConstants.TERMINAL_VELOCITY;
    }
    
    console.log(`[PLAYER] Gravity applied, velocity.y: ${velocity.y.toFixed(2)}`);
  }

  public setGroundState(isGrounded: boolean): void {
    if (this.isGrounded !== isGrounded) {
      console.log(`[PLAYER] Ground state changed: ${this.isGrounded} -> ${isGrounded}`);
      this.isGrounded = isGrounded;
      
      // Reset vertical velocity when landing
      if (isGrounded) {
        const velocity = this.getComponent('velocity') as VelocityComponent;
        if (velocity.y > 0) {
          velocity.y = 0;
          console.log('[PLAYER] Landed - vertical velocity reset');
        }
      }
    }
  }

  public isOnGround(): boolean {
    return this.isGrounded;
  }

  public getVisual(): PlayerVisual {
    return this.visual;
  }

  public updateVisualPosition(): void {
    const position = this.getComponent('position') as PositionComponent;
    this.visual.x = position.x;
    this.visual.y = position.y;
  }

  public update(deltaTime: number): void {
    // This will be called every frame to update player state
    const position = this.getComponent('position') as PositionComponent;
    const velocity = this.getComponent('velocity') as VelocityComponent;
    
    // Update position based on velocity
    position.x += velocity.x * deltaTime;
    position.y += velocity.y * deltaTime;
    
    // Update visual position
    this.updateVisualPosition();
  }

  public getDebugInfo(): Record<string, any> {
    const position = this.getComponent('position') as PositionComponent;
    const velocity = this.getComponent('velocity') as VelocityComponent;
    
    return {
      position: { x: position.x, y: position.y },
      velocity: { x: velocity.x.toFixed(2), y: velocity.y.toFixed(2) },
      isGrounded: this.isGrounded,
      speed: Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y).toFixed(2)
    };
  }
}