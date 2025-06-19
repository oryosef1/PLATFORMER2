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
  
  // Jumping system state
  private isJumpingState: boolean = false;
  private jumpHoldFrames: number = 0;
  private coyoteTimeFrames: number = 0;
  private jumpBufferFrames: number = 0;
  private hasDoubleJump: boolean = true;

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
      
      // Reset jumping state and restore double jump when landing
      if (isGrounded) {
        this.isJumpingState = false;
        this.hasDoubleJump = true;
        this.coyoteTimeFrames = 0;
        
        const velocity = this.getComponent('velocity') as VelocityComponent;
        if (velocity.y > 0) {
          velocity.y = 0;
          console.log('[PLAYER] Landed - vertical velocity reset');
        }
        
        // Execute buffered jump if any
        if (this.jumpBufferFrames > 0) {
          console.log('[PLAYER] Executing buffered jump');
          this.executeJump(MovementConstants.MIN_JUMP_VELOCITY);
          this.jumpBufferFrames = 0;
        }
      } else {
        // Start coyote time when leaving ground
        this.coyoteTimeFrames = MovementConstants.COYOTE_TIME_FRAMES;
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

  // Jumping System Methods
  
  public startJump(): boolean {
    // Can jump if on ground or within coyote time
    if (this.isGrounded || this.coyoteTimeFrames > 0) {
      this.isJumpingState = true;
      this.jumpHoldFrames = 1; // Start with 1 frame since we're pressing this frame
      this.coyoteTimeFrames = 0; // Use up coyote time
      
      // Start with minimum jump velocity, will be increased by updateJump if holding
      this.executeJump(MovementConstants.MIN_JUMP_VELOCITY);
      console.log('[PLAYER] Jump started with minimum velocity');
      return true;
    }
    return false;
  }
  
  public updateJump(deltaTime: number, isHolding: boolean): void {
    if (!this.isJumpingState) return;
    
    const velocity = this.getComponent('velocity') as VelocityComponent;
    
    if (isHolding && this.jumpHoldFrames < MovementConstants.JUMP_HOLD_FRAMES) {
      this.jumpHoldFrames++;
      
      // Calculate jump velocity based on how long we've been holding
      const holdProgress = this.jumpHoldFrames / MovementConstants.JUMP_HOLD_FRAMES;
      const targetVelocity = MovementConstants.MIN_JUMP_VELOCITY + 
        (MovementConstants.MAX_JUMP_VELOCITY - MovementConstants.MIN_JUMP_VELOCITY) * holdProgress;
      
      // Only increase velocity if we're still moving upward (negative velocity)
      if (velocity.y < 0) {
        velocity.y = -targetVelocity;
        console.log(`[PLAYER] Jump hold frame ${this.jumpHoldFrames}, velocity: ${velocity.y.toFixed(2)}`);
      } else {
        // If we're falling, stop the jump state
        this.isJumpingState = false;
        console.log('[PLAYER] Jump ended - falling');
      }
    } else if (!isHolding) {
      // Key released - end jump state
      this.isJumpingState = false;
      console.log('[PLAYER] Jump ended - key released');
    } else {
      // Max hold time reached
      this.isJumpingState = false;
      console.log('[PLAYER] Jump ended - max hold time');
    }
  }
  
  public startDoubleJump(): boolean {
    if (!this.isGrounded && this.hasDoubleJump) {
      this.hasDoubleJump = false;
      this.executeJump(MovementConstants.DOUBLE_JUMP_VELOCITY);
      console.log('[PLAYER] Double jump executed');
      return true;
    }
    return false;
  }
  
  public bufferJump(): void {
    if (!this.isGrounded) {
      this.jumpBufferFrames = MovementConstants.JUMP_BUFFER_FRAMES;
      console.log('[PLAYER] Jump buffered');
    }
  }
  
  public updateJumpBuffer(deltaTime: number): void {
    if (this.jumpBufferFrames > 0) {
      this.jumpBufferFrames--;
      if (this.jumpBufferFrames <= 0) {
        console.log('[PLAYER] Jump buffer expired');
      }
    }
  }
  
  public updateCoyoteTime(deltaTime: number): void {
    if (this.coyoteTimeFrames > 0) {
      this.coyoteTimeFrames--;
      if (this.coyoteTimeFrames <= 0) {
        console.log('[PLAYER] Coyote time expired');
      }
    }
  }
  
  public cancelJump(): void {
    if (this.isJumpingState) {
      const velocity = this.getComponent('velocity') as VelocityComponent;
      // Reduce upward velocity when jump is cancelled
      if (velocity.y < 0) {
        velocity.y *= 0.5; // Cut jump short
        console.log('[PLAYER] Jump cancelled, velocity reduced');
      }
      this.isJumpingState = false;
    }
  }
  
  private executeJump(jumpVelocity: number): void {
    const velocity = this.getComponent('velocity') as VelocityComponent;
    velocity.y = -jumpVelocity; // Negative = upward
    this.isGrounded = false;
    console.log(`[PLAYER] Jump executed with velocity: ${velocity.y}`);
  }
  
  // Jump state query methods
  
  public isJumping(): boolean {
    return this.isJumpingState;
  }
  
  public hasBufferedJump(): boolean {
    return this.jumpBufferFrames > 0;
  }
  
  public hasDoubleJumpAvailable(): boolean {
    return this.hasDoubleJump;
  }

  public getDebugInfo(): Record<string, any> {
    const position = this.getComponent('position') as PositionComponent;
    const velocity = this.getComponent('velocity') as VelocityComponent;
    
    return {
      position: { x: position.x, y: position.y },
      velocity: { x: velocity.x.toFixed(2), y: velocity.y.toFixed(2) },
      isGrounded: this.isGrounded,
      speed: Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y).toFixed(2),
      jumping: {
        isJumping: this.isJumpingState,
        holdFrames: this.jumpHoldFrames,
        coyoteTime: this.coyoteTimeFrames,
        jumpBuffer: this.jumpBufferFrames,
        doubleJump: this.hasDoubleJump
      }
    };
  }
}