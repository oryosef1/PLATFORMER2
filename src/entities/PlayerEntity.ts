import { Entity } from '../ecs/Entity';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { VelocityComponent } from '../ecs/components/VelocityComponent';
import { InputComponent } from '../ecs/components/InputComponent';
import { CollisionComponent } from '../ecs/components/CollisionComponent';
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
  private jumpActionConsumed: boolean = false; // Prevents multiple jump actions per key press
  
  // Wall mechanics state
  private touchingWallLeft: boolean = false;
  private touchingWallRight: boolean = false;
  private wallSliding: boolean = false;
  private wallJumpControlLockout: number = 0;
  private lastWallJumpDirection: number = 0; // -1 for left, 1 for right
  private wallCoyoteTimeFrames: number = 0; // grace period after leaving wall
  private recentWallContactFrames: number = 0; // tracks recent wall contact to prevent vertical jumps
  private wallJumpCooldownFrames: number = 0; // prevents immediate double jump after wall jump

  // Dash mechanics state
  private dashing: boolean = false;
  private dashDurationFrames: number = 0;
  private dashCooldownFrames: number = 0;
  private dashInvincibilityFrames: number = 0;

  // Sprint mechanics state
  private sprinting: boolean = false;
  private stamina: number = MovementConstants.SPRINT_STAMINA_MAX;

  // Player facing direction
  private facingDirection: number = 1; // 1 for right, -1 for left

  constructor(x: number = 100, y: number = 100) {
    super();
    console.log(`[PLAYER] Creating player entity at (${x}, ${y})`);
    
    // Add required components
    this.addComponent('position', new PositionComponent(x, y));
    this.addComponent('velocity', new VelocityComponent(0, 0));
    this.addComponent('collision', new CollisionComponent(
      MovementConstants.PLAYER_WIDTH,
      MovementConstants.PLAYER_HEIGHT,
      0, // offsetX
      0, // offsetY
      false, // isTrigger
      false, // isStatic
      'player' // layer
    ));
    
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
    
    // CRITICAL: Don't apply movement when dashing - dash controls velocity completely
    if (this.dashing) {
      console.log(`[PLAYER] Movement blocked - dashing for ${this.dashDurationFrames} more frames`);
      return;
    }
    
    // Check for wall jump control lockout
    if (this.wallJumpControlLockout > 0) {
      // During lockout, only apply friction
      this.applyFriction(isOnGround);
      console.log(`[PLAYER] Movement locked out for ${this.wallJumpControlLockout} more frames`);
      return;
    }
    
    if (!isPressed || direction === 'none') {
      // Apply friction when no input
      this.applyFriction(isOnGround);
      return;
    }
    
    // Determine acceleration based on ground state
    let acceleration = isOnGround 
      ? MovementConstants.ACCELERATION_GROUND 
      : MovementConstants.ACCELERATION_AIR * MovementConstants.AIR_CONTROL_FACTOR;
    
    // Apply sprint multiplier if sprinting
    if (this.sprinting) {
      acceleration *= MovementConstants.SPRINT_ACCELERATION_MULTIPLIER;
    }
    
    // Determine max speed based on ground state
    let maxSpeed = isOnGround 
      ? MovementConstants.MAX_SPEED_GROUND 
      : MovementConstants.MAX_SPEED_AIR;
    
    // Apply sprint speed multiplier if sprinting
    if (this.sprinting) {
      maxSpeed *= MovementConstants.SPRINT_SPEED_MULTIPLIER;
    }
    
    // Apply movement based on direction
    const accelPerFrame = acceleration * MovementConstants.FIXED_TIMESTEP;
    
    if (direction === 'left') {
      velocity.x -= accelPerFrame;
      if (velocity.x < -maxSpeed) {
        velocity.x = -maxSpeed;
      }
      this.facingDirection = -1; // Update facing direction
      console.log(`[PLAYER] Moving left, velocity.x: ${velocity.x.toFixed(2)}`);
    } else if (direction === 'right') {
      velocity.x += accelPerFrame;
      if (velocity.x > maxSpeed) {
        velocity.x = maxSpeed;
      }
      this.facingDirection = 1; // Update facing direction
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
    
    // CRITICAL: Don't apply gravity when dashing - dash controls velocity completely
    if (this.dashing) {
      console.log(`[PLAYER] Gravity skipped - dashing at ${this.getComponent<VelocityComponent>('velocity')?.y.toFixed(2)} px/s`);
      return;
    }
    
    // Don't apply gravity when wall sliding - wall slide controls fall speed
    if (this.wallSliding) {
      console.log(`[PLAYER] Gravity skipped - wall sliding at ${this.getComponent<VelocityComponent>('velocity')?.y.toFixed(2)} px/s`);
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
      console.log(`[DEBUG] Double jump before ground state change: ${this.hasDoubleJump}`);
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
    // Update visual position (collision system handles position updates)
    this.updateVisualPosition();
    
    // Update wall jump control lockout
    if (this.wallJumpControlLockout > 0) {
      this.wallJumpControlLockout--;
    }
    
    // Update wall coyote time
    if (this.wallCoyoteTimeFrames > 0) {
      this.wallCoyoteTimeFrames--;
      if (this.wallCoyoteTimeFrames <= 0) {
        console.log('[PLAYER] Wall coyote time expired');
      }
    }
    
    // Update recent wall contact timer
    if (this.recentWallContactFrames > 0) {
      this.recentWallContactFrames--;
      if (this.recentWallContactFrames <= 0) {
        console.log('[PLAYER] Recent wall contact expired - vertical jumps allowed again');
      }
    }
    
    // Update wall jump cooldown timer
    if (this.wallJumpCooldownFrames > 0) {
      this.wallJumpCooldownFrames--;
      if (this.wallJumpCooldownFrames <= 0) {
        console.log('[PLAYER] Wall jump cooldown expired - double jump available');
      }
    }
    
    // Update dash timers
    if (this.dashDurationFrames > 0) {
      this.dashDurationFrames--;
      if (this.dashDurationFrames <= 0) {
        this.dashing = false;
        this.dashCooldownFrames = MovementConstants.DASH_COOLDOWN_FRAMES;
        console.log('[PLAYER] Dash ended - cooldown started');
      }
    } else if (this.dashCooldownFrames > 0) {
      // Only update cooldown if not currently dashing
      this.dashCooldownFrames--;
      if (this.dashCooldownFrames <= 0) {
        console.log('[PLAYER] Dash cooldown expired - dash available');
      }
    }
    
    if (this.dashInvincibilityFrames > 0) {
      this.dashInvincibilityFrames--;
      if (this.dashInvincibilityFrames <= 0) {
        console.log('[PLAYER] Dash invincibility expired');
      }
    }
    
    // Update sprint stamina
    if (this.sprinting) {
      this.stamina -= MovementConstants.SPRINT_STAMINA_DRAIN_RATE;
      if (this.stamina <= 0) {
        this.stamina = 0;
        this.sprinting = false;
        console.log('[PLAYER] Sprint ended - stamina depleted');
      }
    } else {
      // Regenerate stamina when not sprinting
      this.stamina += MovementConstants.SPRINT_STAMINA_REGEN_RATE;
      if (this.stamina > MovementConstants.SPRINT_STAMINA_MAX) {
        this.stamina = MovementConstants.SPRINT_STAMINA_MAX;
      }
    }
    
  }
  
  // Wall mechanics methods
  
  public setWallContact(leftWall: boolean, rightWall: boolean): void {
    const wasOnWall = this.touchingWallLeft || this.touchingWallRight;
    const wasLeftWall = this.touchingWallLeft;
    const wasRightWall = this.touchingWallRight;
    
    // Debug wall contact changes
    if (leftWall !== this.touchingWallLeft || rightWall !== this.touchingWallRight) {
      console.log(`[WALL_CONTACT] Wall contact changed - Left: ${this.touchingWallLeft}->${leftWall}, Right: ${this.touchingWallRight}->${rightWall}`);
    }
    
    this.touchingWallLeft = leftWall;
    this.touchingWallRight = rightWall;
    
    const isOnWall = leftWall || rightWall;
    
    // Track recent wall contact to prevent vertical jumps when rapidly moving between walls
    if (isOnWall) {
      this.recentWallContactFrames = 6; // 6 frames (0.1 seconds) of recent wall contact - shorter duration
    }
    
    if (wasOnWall !== isOnWall || wasLeftWall !== leftWall || wasRightWall !== rightWall) {
      console.log(`[PLAYER] Wall contact changed - Left: ${wasLeftWall}->${leftWall}, Right: ${wasRightWall}->${rightWall}`);
      
      if (!isOnWall && wasOnWall) {
        // Start wall coyote time when leaving wall
        this.wallCoyoteTimeFrames = MovementConstants.WALL_COYOTE_TIME_FRAMES;
        // Remember which wall we just left for coyote time
        this.lastWallJumpDirection = wasLeftWall ? 1 : -1;
        console.log(`[PLAYER] Started wall coyote time - direction: ${this.lastWallJumpDirection}`);
      } else if (isOnWall && !wasOnWall) {
        // Reset wall coyote time when touching wall
        this.wallCoyoteTimeFrames = 0;
        // CRITICAL: Wall contact does NOT restore double jump - only landing on ground or wall jumping does
        console.log('[PLAYER] Wall contact - double jump NOT restored');
      }
    }
  }
  
  public updateWallSlide(isPressingLeft: boolean, isPressingRight: boolean): void {
    const velocity = this.getComponent('velocity') as VelocityComponent;
    
    // Check if we should be wall sliding
    // Must be pressing towards the wall to slide
    const isPressingTowardsWall = (this.touchingWallLeft && isPressingLeft) || 
                                  (this.touchingWallRight && isPressingRight);
    
    const canWallSlide = !this.isGrounded && 
                         (this.touchingWallLeft || this.touchingWallRight) && 
                         velocity.y > 0.1 && // Only slide when falling (small threshold to avoid micro-movements)
                         isPressingTowardsWall; // Must press towards wall
    
    // Debug wall slide activation when state changes
    if (canWallSlide && !this.wallSliding) {
      console.log(`[WALL_DEBUG] Wall slide conditions met - velocity.y: ${velocity.y.toFixed(2)}, target: ${MovementConstants.WALL_SLIDE_SPEED}`);
    }
    
    // Additional debug when touching wall but not sliding
    if ((this.touchingWallLeft || this.touchingWallRight) && !this.wallSliding && !this.isGrounded && velocity.y > 0.1) {
      console.log(`[WALL_DEBUG] Touching wall but not sliding - pressing towards wall: ${isPressingTowardsWall}, velocity.y: ${velocity.y.toFixed(2)}`);
    }
    
    if (canWallSlide) {
      if (!this.wallSliding) {
        console.log('[PLAYER] Started wall sliding');
        this.wallSliding = true;
        
        
        // Wall sliding consumes double jump to prevent air mobility abuse
        if (this.hasDoubleJump) {
          this.hasDoubleJump = false;
          console.log('[PLAYER] Wall sliding consumed double jump');
          console.trace('[DEBUG] Double jump set to false by wall sliding');
        }
      }
      
      // ALWAYS maintain consistent wall slide speed - regardless of current velocity
      velocity.y = MovementConstants.WALL_SLIDE_SPEED;
      console.log(`[PLAYER] Wall sliding - velocity set to consistent ${MovementConstants.WALL_SLIDE_SPEED} px/s`);
    } else {
      if (this.wallSliding) {
        console.log('[PLAYER] Stopped wall sliding');
        this.wallSliding = false;
      }
    }
  }
  
  public canWallJump(): boolean {
    const hasWallContact = this.touchingWallLeft || this.touchingWallRight;
    const hasWallCoyoteTime = this.wallCoyoteTimeFrames > 0;
    const noCooldown = this.wallJumpCooldownFrames <= 0;
    
    return !this.isGrounded && (hasWallContact || hasWallCoyoteTime) && noCooldown;
  }
  
  public executeWallJump(): boolean {
    if (!this.canWallJump()) {
      console.log(`[WALL_JUMP] Cannot wall jump - grounded: ${this.isGrounded}, wallContact: ${this.touchingWallLeft || this.touchingWallRight}, coyoteTime: ${this.wallCoyoteTimeFrames}, cooldown: ${this.wallJumpCooldownFrames}`);
      return false;
    }
    
    const velocity = this.getComponent('velocity') as VelocityComponent;
    
    // Determine jump direction (away from wall)
    let jumpDirection: number;
    if (this.touchingWallLeft || this.touchingWallRight) {
      // Currently touching wall - prioritize current wall contact
      if (this.touchingWallLeft && this.touchingWallRight) {
        // Corner case: touching both walls, use velocity to determine which wall to jump from
        jumpDirection = velocity.x >= 0 ? -1 : 1; // Jump away from the direction we're moving
        console.log(`[PLAYER] Both walls detected, using velocity direction: ${jumpDirection}`);
      } else {
        jumpDirection = this.touchingWallLeft ? 1 : -1; // Jump right if on left wall
      }
      this.lastWallJumpDirection = jumpDirection; // Remember for coyote time
      console.log(`[PLAYER] Wall jump from current wall contact - direction: ${jumpDirection}`);
    } else if (this.wallCoyoteTimeFrames > 0) {
      // Using coyote time - use last known wall direction
      jumpDirection = this.lastWallJumpDirection;
      console.log(`[PLAYER] Wall jump using coyote time - direction: ${jumpDirection}`);
    } else {
      return false; // Should not happen due to canWallJump check
    }
    
    // Set velocities
    velocity.x = jumpDirection * MovementConstants.WALL_JUMP_HORIZONTAL_VELOCITY;
    velocity.y = -MovementConstants.WALL_JUMP_VERTICAL_VELOCITY;
    
    // Mark jump action as consumed
    this.jumpActionConsumed = true;
    
    // Set control lockout
    this.wallJumpControlLockout = MovementConstants.WALL_JUMP_CONTROL_LOCKOUT_FRAMES;
    
    // Set cooldown to prevent immediate double jump after wall jump
    this.wallJumpCooldownFrames = 8; // 8 frames (about 0.13 seconds) cooldown
    
    
    // Reset wall sliding state and coyote time
    this.wallSliding = false;
    this.wallCoyoteTimeFrames = 0; // Use up coyote time
    
    // Wall jumps should NEVER restore double jump - only landing on ground should
    console.log('[PLAYER] Wall jump executed - double jump stays as is (only ground restores it)');
    
    console.log(`[PLAYER] Wall jump executed - direction: ${jumpDirection}, velocity: (${velocity.x}, ${velocity.y})`);
    return true;
  }
  
  public isWallSliding(): boolean {
    return this.wallSliding;
  }
  
  public isTouchingWall(): boolean {
    return this.touchingWallLeft || this.touchingWallRight;
  }
  
  public hasRecentWallContact(): boolean {
    return this.recentWallContactFrames > 0;
  }
  
  public hasWallJumpControlLockout(): boolean {
    return this.wallJumpControlLockout > 0;
  }
  
  public getWallJumpCooldownFrames(): number {
    return this.wallJumpCooldownFrames;
  }

  // Jumping System Methods
  
  public startJump(): boolean {
    // Can jump if on ground or within coyote time
    if (this.isGrounded || this.coyoteTimeFrames > 0) {
      this.isJumpingState = true;
      this.jumpHoldFrames = 1; // Start with 1 frame since we're pressing this frame
      this.coyoteTimeFrames = 0; // Use up coyote time
      this.jumpActionConsumed = true; // Mark jump action as consumed
      
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
    if (!this.isGrounded && this.hasDoubleJump && this.wallJumpCooldownFrames <= 0) {
      this.hasDoubleJump = false;
      this.jumpActionConsumed = true; // Mark jump action as consumed
      console.log('[PLAYER] Double jump executed');
      console.trace('[DEBUG] Double jump set to false by double jump execution');
      this.executeJump(MovementConstants.DOUBLE_JUMP_VELOCITY);
      return true;
    }
    
    if (this.wallJumpCooldownFrames > 0) {
      console.log(`[PLAYER] Double jump blocked - wall jump cooldown: ${this.wallJumpCooldownFrames} frames`);
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
    // Note: Ground state is managed by collision system, not jump system
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
  
  public hasJumpActionBeenConsumed(): boolean {
    return this.jumpActionConsumed;
  }
  
  public setJumpActionConsumed(): void {
    this.jumpActionConsumed = true;
  }
  
  public resetJumpActionOnKeyRelease(): void {
    this.jumpActionConsumed = false;
  }

  // Dash System Methods
  
  public canDash(): boolean {
    return this.dashCooldownFrames <= 0 && !this.dashing;
  }
  
  public executeDash(downward: boolean = false): boolean {
    if (!this.canDash()) {
      console.log(`[DASH] Cannot dash - cooldown: ${this.dashCooldownFrames} frames`);
      return false;
    }
    
    const velocity = this.getComponent('velocity') as VelocityComponent;
    
    // Dash in facing direction (Hollow Knight style)
    let velX = 0;
    let velY = 0;
    
    if (downward) {
      // Downward dash (like Dashmaster charm)
      velY = MovementConstants.DASH_VELOCITY;
      console.log('[PLAYER] Dash executed - direction: down');
    } else {
      // Horizontal dash in facing direction
      velX = this.facingDirection * MovementConstants.DASH_VELOCITY;
      const direction = this.facingDirection > 0 ? 'right' : 'left';
      console.log(`[PLAYER] Dash executed - direction: ${direction} (facing)`);
    }
    
    // Set dash state
    this.dashing = true;
    this.dashDurationFrames = MovementConstants.DASH_DURATION_FRAMES;
    this.dashInvincibilityFrames = MovementConstants.DASH_INVINCIBILITY_FRAMES;
    
    // CRITICAL: Clear all existing velocity before applying dash velocity
    // This ensures dash is always consistent regardless of current movement
    velocity.x = velX;
    velocity.y = velY;
    
    console.log(`[PLAYER] Dash velocity: (${velX.toFixed(1)}, ${velY.toFixed(1)})`);
    return true;
  }
  
  public isDashing(): boolean {
    return this.dashing;
  }
  
  public isInvincible(): boolean {
    return this.dashInvincibilityFrames > 0;
  }

  // Sprint System Methods
  
  public canSprint(): boolean {
    return this.stamina >= MovementConstants.SPRINT_MIN_STAMINA;
  }
  
  public startSprint(): void {
    if (this.canSprint()) {
      if (!this.sprinting) {
        this.sprinting = true;
        console.log('[PLAYER] Sprint started');
      }
    } else if (!this.canSprint()) {
      console.log(`[PLAYER] Cannot sprint - stamina too low: ${this.stamina}/${MovementConstants.SPRINT_MIN_STAMINA}`);
    }
  }
  
  public stopSprint(): void {
    if (this.sprinting) {
      this.sprinting = false;
      console.log('[PLAYER] Sprint stopped');
    }
  }
  
  public isSprinting(): boolean {
    return this.sprinting;
  }
  
  public drainStamina(amount: number): void {
    this.stamina -= amount;
    if (this.stamina < 0) {
      this.stamina = 0;
    }
  }
  
  public getStamina(): number {
    return this.stamina;
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
      },
      wall: {
        touchingLeft: this.touchingWallLeft,
        touchingRight: this.touchingWallRight,
        sliding: this.wallSliding,
        jumpLockout: this.wallJumpControlLockout,
        coyoteTime: this.wallCoyoteTimeFrames,
        recentContact: this.recentWallContactFrames,
        jumpCooldown: this.wallJumpCooldownFrames
      },
      dash: {
        dashing: this.dashing,
        duration: this.dashDurationFrames,
        cooldown: this.dashCooldownFrames,
        invincible: this.dashInvincibilityFrames > 0,
        invincibilityFrames: this.dashInvincibilityFrames
      },
      sprint: {
        sprinting: this.sprinting,
        stamina: this.stamina,
        maxStamina: MovementConstants.SPRINT_STAMINA_MAX,
        canSprint: this.canSprint()
      }
    };
  }
}