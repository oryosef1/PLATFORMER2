import Phaser from 'phaser';
import { InputManager } from '../input/InputManager';
import { PlayerEntity } from '../entities/PlayerEntity';
import { PlatformEntity } from '../entities/PlatformEntity';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { VelocityComponent } from '../ecs/components/VelocityComponent';
import { CollisionComponent } from '../ecs/components/CollisionComponent';
import { CollisionSystem } from '../ecs/systems/CollisionSystem';
import { DebugCollision } from '../utils/DebugCollision';

export class GameScene extends Phaser.Scene {
  private playerVisual!: Phaser.GameObjects.Rectangle;
  private playerEntity!: PlayerEntity;
  private platformEntities: PlatformEntity[] = [];
  private platformVisuals: Phaser.GameObjects.Rectangle[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private inputManager!: InputManager;
  private inputDebugText!: Phaser.GameObjects.Text;
  private playerDebugText!: Phaser.GameObjects.Text;
  private collisionSystem!: CollisionSystem;
  private debugCollision!: DebugCollision;
  private debugModeEnabled: boolean = true;
  
  // Stamina UI elements
  private staminaBarBackground!: Phaser.GameObjects.Rectangle;
  private staminaBarFill!: Phaser.GameObjects.Rectangle;
  private staminaBarText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Initialize collision system
    this.collisionSystem = new CollisionSystem(64); // 64px spatial hash cells
    console.log('[GAME] CollisionSystem initialized');
    
    // Initialize debug collision visualization
    this.debugCollision = new DebugCollision(this);
    this.debugCollision.setEnabled(this.debugModeEnabled);
    console.log('[GAME] DebugCollision initialized');
    
    // Create platform entities with ECS
    // Ground platform (longer for easier testing)
    const groundEntity = new PlatformEntity(400, 700, 800, 32);
    this.platformEntities.push(groundEntity);
    this.collisionSystem.addEntity(groundEntity);
    
    // Create visual for ground
    const groundVisual = this.add.rectangle(400, 700, 800, 32, 0x27ae60);
    groundVisual.setDepth(0);
    this.platformVisuals.push(groundVisual);
    
    // Two walls close together for wall jump testing
    // Left wall
    const testWallLeftEntity = new PlatformEntity(300, 200, 32, 600);
    this.platformEntities.push(testWallLeftEntity);
    this.collisionSystem.addEntity(testWallLeftEntity);
    
    const testWallLeftVisual = this.add.rectangle(300, 200, 32, 600, 0x9b59b6);
    testWallLeftVisual.setDepth(0);
    this.platformVisuals.push(testWallLeftVisual);
    
    // Right wall (close to left one for wall-to-wall jumping)
    const testWallRightEntity = new PlatformEntity(400, 200, 32, 600);
    this.platformEntities.push(testWallRightEntity);
    this.collisionSystem.addEntity(testWallRightEntity);
    
    const testWallRightVisual = this.add.rectangle(400, 200, 32, 600, 0x9b59b6);
    testWallRightVisual.setDepth(0);
    this.platformVisuals.push(testWallRightVisual);
    
    // Create ECS-based player entity - position to be on ground
    // Ground is at Y=700 with height 32, so top of ground is at Y=684
    // Player height is 48, so player center should be at Y=684-24=660
    this.playerEntity = new PlayerEntity(200, 660); // Start on ground platform
    this.collisionSystem.addEntity(this.playerEntity);
    console.log('[GAME] PlayerEntity created at ground level and added to collision system');
    
    // Create visual representation for player (no physics body needed)
    const playerVisual = this.playerEntity.getVisual();
    this.playerVisual = this.add.rectangle(
      playerVisual.x, 
      playerVisual.y, 
      playerVisual.width, 
      playerVisual.height, 
      0xe74c3c
    );
    
    // Set player depth to render on top of platforms
    this.playerVisual.setDepth(100);
    
    // Create cursor keys (arrow keys only)
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Initialize InputManager
    this.inputManager = new InputManager();
    console.log('[GAME] InputManager initialized');
    
    // Debug info
    this.add.text(10, 50, 'Controls:', { fontSize: '16px', color: '#ffffff' });
    this.add.text(10, 70, 'Arrow Keys to move', { fontSize: '14px', color: '#ffffff' });
    this.add.text(10, 90, 'UP to jump (hold for higher)', { fontSize: '14px', color: '#ffffff' });
    this.add.text(10, 110, 'UP twice for double jump', { fontSize: '14px', color: '#ffffff' });
    this.add.text(10, 130, 'UP while on wall for wall jump', { fontSize: '14px', color: '#ffffff' });
    this.add.text(10, 150, 'X to dash (facing direction), X+DOWN for down dash', { fontSize: '14px', color: '#ffffff' });
    this.add.text(10, 170, 'SHIFT to sprint (hold)', { fontSize: '14px', color: '#ffffff' });
    this.add.text(10, 190, 'C - Toggle collision debug', { fontSize: '12px', color: '#ffff00' });
    this.add.text(10, 210, 'Check console for debugging', { fontSize: '12px', color: '#ffff00' });
    
    // Add debug controls
    this.input.keyboard!.on('keydown-C', () => {
      this.debugModeEnabled = !this.debugModeEnabled;
      this.debugCollision.setEnabled(this.debugModeEnabled);
      console.log(`[DEBUG] Collision debug: ${this.debugModeEnabled ? 'ON' : 'OFF'}`);
    });
    
    // Player position debug
    this.add.text(10, 230, 'Player Position:', { fontSize: '16px', color: '#ffffff' });
    const posText = this.add.text(10, 250, '', { fontSize: '14px', color: '#ffffff' });
    
    // Input debug display
    this.add.text(10, 280, 'Input Debug:', { fontSize: '16px', color: '#ffffff' });
    this.inputDebugText = this.add.text(10, 300, '', { fontSize: '12px', color: '#00ff00' });
    
    // Player ECS debug display
    this.add.text(10, 350, 'Player ECS Debug:', { fontSize: '16px', color: '#ffffff' });
    this.playerDebugText = this.add.text(10, 370, '', { fontSize: '12px', color: '#00ffff' });
    
    // Create stamina bar UI (top right corner)
    const staminaBarWidth = 200;
    const staminaBarHeight = 20;
    const staminaBarX = this.cameras.main.width - staminaBarWidth - 20; // 20px from right edge
    const staminaBarY = 20; // 20px from top
    
    // Stamina bar background (dark gray)
    this.staminaBarBackground = this.add.rectangle(
      staminaBarX + staminaBarWidth/2, 
      staminaBarY + staminaBarHeight/2, 
      staminaBarWidth, 
      staminaBarHeight, 
      0x333333
    );
    this.staminaBarBackground.setStrokeStyle(2, 0xffffff);
    this.staminaBarBackground.setDepth(200); // Above everything else
    
    // Stamina bar fill (green when full, yellow when low, red when empty)
    this.staminaBarFill = this.add.rectangle(
      staminaBarX + staminaBarWidth/2,
      staminaBarY + staminaBarHeight/2,
      staminaBarWidth - 4, // 2px margin inside
      staminaBarHeight - 4, // 2px margin inside
      0x00ff00 // Start green
    );
    this.staminaBarFill.setDepth(201); // Above background
    
    // Stamina text label
    this.staminaBarText = this.add.text(
      staminaBarX + staminaBarWidth/2, 
      staminaBarY - 15, 
      'SPRINT STAMINA', 
      { 
        fontSize: '12px', 
        color: '#ffffff', 
        align: 'center' 
      }
    );
    this.staminaBarText.setOrigin(0.5, 0.5);
    this.staminaBarText.setDepth(201);
    
    // Update debug info every frame
    this.events.on('update', () => {
      const position = this.playerEntity.getComponent('position') as PositionComponent;
      posText.setText(`X: ${Math.floor(position.x)}, Y: ${Math.floor(position.y)}`);
      
      // Display input state
      const debugInfo = this.inputManager.getDebugInfo();
      const activeKeys = debugInfo.activeKeys.join(', ') || 'None';
      const bufferedInputs = debugInfo.bufferedInputs.join(', ') || 'None';
      this.inputDebugText.setText(`Active: ${activeKeys}\nBuffered: ${bufferedInputs}`);
      
      // Display player entity debug info
      const playerDebug = this.playerEntity.getDebugInfo();
      this.playerDebugText.setText(
        `Velocity: ${playerDebug.velocity.x}, ${playerDebug.velocity.y}\n` +
        `Grounded: ${playerDebug.isGrounded} | Speed: ${playerDebug.speed}\n` +
        `Jump: ${playerDebug.jumping.isJumping} | Hold: ${playerDebug.jumping.holdFrames}\n` +
        `Coyote: ${playerDebug.jumping.coyoteTime} | Buffer: ${playerDebug.jumping.jumpBuffer}\n` +
        `Double: ${playerDebug.jumping.doubleJump}\n` +
        `Wall L: ${playerDebug.wall.touchingLeft} | R: ${playerDebug.wall.touchingRight} | Slide: ${playerDebug.wall.sliding}\n` +
        `Wall Jump Lock: ${playerDebug.wall.jumpLockout} | Wall Coyote: ${playerDebug.wall.coyoteTime}\n` +
        `Wall Recent: ${playerDebug.wall.recentContact} | Jump Cooldown: ${playerDebug.wall.jumpCooldown}\n` +
        `Dash: ${playerDebug.dash.dashing} | Duration: ${playerDebug.dash.duration} | Cooldown: ${playerDebug.dash.cooldown}\n` +
        `Dash Invincible: ${playerDebug.dash.invincible} | Sprint: ${playerDebug.sprint.sprinting}\n` +
        `Stamina: ${playerDebug.sprint.stamina}/${playerDebug.sprint.maxStamina} | Can Sprint: ${playerDebug.sprint.canSprint}`
      );
      
      // Update stamina bar
      this.updateStaminaBar(playerDebug.sprint);
    });
  }

  update(time: number, delta: number) {
    // Convert delta time first
    const deltaSeconds = delta / 1000; // Convert to seconds
    
    // IMPORTANT: Check for input BEFORE updating InputManager (which clears justPressed flags)
    const wasUpPressed = this.inputManager.isKeyJustPressed('ArrowUp') || (this.cursors.up ? Phaser.Input.Keyboard.JustDown(this.cursors.up) : false);
    const wasUpReleased = this.inputManager.isKeyJustReleased('ArrowUp') || (this.cursors.up ? Phaser.Input.Keyboard.JustUp(this.cursors.up) : false);
    const wasDashPressed = this.inputManager.isKeyJustPressed('KeyX'); // X key for dash
    const sprintPressed = this.inputManager.isKeyDown('ShiftLeft') || this.inputManager.isKeyDown('ShiftRight'); // Shift for sprint
    
    // Now update InputManager (this clears justPressed flags)
    this.inputManager.update();
    
    // Get input states
    const leftPressed = this.cursors.left?.isDown || this.inputManager.isKeyDown('ArrowLeft');
    const rightPressed = this.cursors.right?.isDown || this.inputManager.isKeyDown('ArrowRight');
    const upPressed = this.cursors.up?.isDown || this.inputManager.isKeyDown('ArrowUp');
    
    // Handle sprint input - always try to sprint when key is held
    if (sprintPressed) {
      // Always call startSprint - it will handle stamina checks internally
      this.playerEntity.startSprint();
    } else {
      if (this.playerEntity.isSprinting()) {
        this.playerEntity.stopSprint();
      }
    }
    
    // Apply ECS-based movement
    const isOnGround = this.playerEntity.isOnGround();
    
    if (leftPressed) {
      this.playerEntity.applyMovement('left', true, isOnGround);
    } else if (rightPressed) {
      this.playerEntity.applyMovement('right', true, isOnGround);
    } else {
      this.playerEntity.applyMovement('none', false, isOnGround);
    }
    
    // Apply gravity
    this.playerEntity.applyGravity();
    
    // Update wall sliding (must be done after gravity)
    this.playerEntity.updateWallSlide(leftPressed, rightPressed);
    
    // Enhanced jumping system (Phase 2.2 + 2.4) - using captured values
    
    // Handle jump start - but only if jump action hasn't been consumed yet
    if (wasUpPressed && !this.playerEntity.hasJumpActionBeenConsumed()) {
      const isOnGround = this.playerEntity.isOnGround();
      const canWallJump = this.playerEntity.canWallJump();
      const isTouchingWall = this.playerEntity.isTouchingWall();
      const hasRecentWallContact = this.playerEntity.hasRecentWallContact();
      
      const hasDoubleJump = this.playerEntity.hasDoubleJumpAvailable();
      const wallJumpCooldown = this.playerEntity.getWallJumpCooldownFrames();
      
      console.log(`[MOVEMENT] UP pressed - isOnGround: ${isOnGround}, canWallJump: ${canWallJump}, touchingWall: ${isTouchingWall}, recentWall: ${hasRecentWallContact}, doubleJump: ${hasDoubleJump}, cooldown: ${wallJumpCooldown}`);
      
      // PRIORITY 1: Wall jump if touching wall or have wall coyote time
      if (canWallJump) {
        if (this.playerEntity.executeWallJump()) {
          console.log('[MOVEMENT] Wall jump executed');
        } else {
          console.log('[MOVEMENT] Wall jump failed - buffering instead of fallback');
          this.playerEntity.bufferJump();
        }
      }
      // PRIORITY 2: Ground jump ONLY if on ground AND no recent wall contact
      else if (isOnGround && !hasRecentWallContact && this.playerEntity.startJump()) {
        console.log('[MOVEMENT] Ground jump started');
      }
      // PRIORITY 3: Double jump if not touching walls AND no wall jump cooldown (prevent double jump spam after wall jumps)
      else if (!isTouchingWall && wallJumpCooldown <= 0 && this.playerEntity.startDoubleJump()) {
        console.log('[MOVEMENT] Double jump executed');
      }
      // PRIORITY 4: Buffer jump if none of the above worked
      else {
        this.playerEntity.bufferJump();
        if (hasRecentWallContact) {
          console.log('[MOVEMENT] Jump buffered - recent wall contact prevents vertical jumps');
        } else if (wallJumpCooldown > 0) {
          console.log(`[MOVEMENT] Jump buffered - wall jump cooldown prevents double jump (${wallJumpCooldown} frames)`);
        } else {
          console.log('[MOVEMENT] Jump buffered - no jump options available');
        }
      }
    }
    
    // Handle variable jump height (hold for higher jump)
    this.playerEntity.updateJump(deltaSeconds, upPressed);
    
    // Handle jump cancellation (using captured release value)
    if (wasUpReleased) {
      // Reset jump action consumption flag when key is released
      this.playerEntity.resetJumpActionOnKeyRelease();
      console.log('[MOVEMENT] UP key released - reset jump action flag');
      
      this.playerEntity.cancelJump();
    }
    
    // Update jumping systems
    this.playerEntity.updateCoyoteTime(deltaSeconds);
    this.playerEntity.updateJumpBuffer(deltaSeconds);
    
    // Handle dash input (Hollow Knight style)
    if (wasDashPressed) {
      // Check if down is pressed for downward dash
      const downPressed = this.cursors.down?.isDown || this.inputManager.isKeyDown('ArrowDown');
      const downwardDash = downPressed;
      
      if (this.playerEntity.executeDash(downwardDash)) {
        const direction = downwardDash ? 'down' : 'facing direction';
        console.log(`[MOVEMENT] Dash executed in ${direction}`);
      } else {
        console.log(`[MOVEMENT] Dash failed - on cooldown`);
      }
    }
    
    // SIMPLIFIED COLLISION SYSTEM - Apply movement first, then detect and resolve
    
    // Step 1: Apply movement to player
    const position = this.playerEntity.getComponent<PositionComponent>('position')!;
    const velocity = this.playerEntity.getComponent<VelocityComponent>('velocity')!;
    
    // Store original position for collision detection
    const originalX = position.x;
    const originalY = position.y;
    
    // Apply movement
    position.x += velocity.x * deltaSeconds;
    position.y += velocity.y * deltaSeconds;
    
    // Step 2: Check for collisions after movement
    const collisions = this.collisionSystem.update(deltaSeconds);
    
    // Step 3: Process and resolve collisions
    let touchingWallLeft = false;
    let touchingWallRight = false;
    
    for (const collision of collisions) {
      if (collision.entityA === this.playerEntity || collision.entityB === this.playerEntity) {
        const platform = collision.entityA === this.playerEntity ? collision.entityB : collision.entityA;
        
        // console.log(`[COLLISION] Player collision detected:`);
        // console.log(`[COLLISION] Normal: ${collision.collisionInfo.normalX}, ${collision.collisionInfo.normalY}`);
        // console.log(`[COLLISION] Overlap: ${collision.collisionInfo.overlapX.toFixed(1)}, ${collision.collisionInfo.overlapY.toFixed(1)}`);
        // console.log(`[COLLISION] Player velocity: ${velocity.x.toFixed(1)}, ${velocity.y.toFixed(1)}`);
        // console.log(`[COLLISION] Platform position: ${platform.getComponent('position')?.x}, ${platform.getComponent('position')?.y}`);
        
        // Simple, robust collision resolution with stability improvements
        if (collision.collisionInfo.normalY === -1 && velocity.y >= 0) {
          // Landing on top of platform (falling down)
          // Add small tolerance to prevent oscillation
          const correctionY = collision.collisionInfo.overlapY + 0.1;
          position.y -= correctionY;
          velocity.y = 0;
          if (!this.playerEntity.isOnGround()) {
            console.log('[COLLISION] Player landed on platform');
            this.playerEntity.setGroundState(true);
          }
        } else if (collision.collisionInfo.normalY === 1 && velocity.y <= 0) {
          // Hitting ceiling (jumping up)
          const correctionY = collision.collisionInfo.overlapY + 0.1;
          position.y += correctionY;
          velocity.y = 0;
          console.log('[COLLISION] Player hit ceiling');
        } else if (collision.collisionInfo.normalX !== 0) {
          // Side collision - wall detected
          if (collision.collisionInfo.normalX === -1) {
            // Hitting wall on the right (normal points left)
            const correctionX = collision.collisionInfo.overlapX + 0.1;
            position.x -= correctionX;
            touchingWallRight = true;
            console.log('[COLLISION] Player hit RIGHT wall');
          } else {
            // Hitting wall on the left (normal points right)
            const correctionX = collision.collisionInfo.overlapX + 0.1;
            position.x += correctionX;
            touchingWallLeft = true;
            console.log('[COLLISION] Player hit LEFT wall');
          }
          velocity.x = 0;
          console.log(`[COLLISION] Wall contact - Left: ${touchingWallLeft}, Right: ${touchingWallRight}`);
        }
      }
    }
    
    // Update wall contact state
    this.playerEntity.setWallContact(touchingWallLeft, touchingWallRight);
    
    // Check if player left ground (no longer colliding with any platform from below)
    // Add tolerance to prevent oscillation
    const groundTolerance = 2.0; // pixels
    const isStillOnGround = collisions.some(collision => {
      const isPlayerCollision = collision.entityA === this.playerEntity || collision.entityB === this.playerEntity;
      const isGroundCollision = collision.collisionInfo.normalY === -1 && velocity.y >= -groundTolerance;
      return isPlayerCollision && isGroundCollision;
    });
    
    // Only change ground state if player is clearly off ground (prevent oscillation)
    if (this.playerEntity.isOnGround() && !isStillOnGround) {
      // Double-check with position-based ground detection for stability
      const playerPos = this.playerEntity.getComponent('position') as PositionComponent;
      let nearGround = false;
      
      for (const platformEntity of this.platformEntities) {
        const platformPos = platformEntity.getComponent('position') as PositionComponent;
        const platformCollision = platformEntity.getComponent('collision') as CollisionComponent;
        const platformAABB = platformCollision.getAABB(platformPos.x, platformPos.y);
        
        // Check if player is near the top of any platform
        const playerBottom = playerPos.y + 24; // Half height
        const platformTop = platformAABB.y;
        
        if (Math.abs(playerBottom - platformTop) <= groundTolerance &&
            playerPos.x + 16 > platformAABB.x && 
            playerPos.x - 16 < platformAABB.x + platformAABB.width) {
          nearGround = true;
          break;
        }
      }
      
      if (!nearGround) {
        console.log('[COLLISION] Player left ground - confirmed by position check');
        this.playerEntity.setGroundState(false);
      }
    }
    
    // Update player entity visual position only (movement already applied above)
    this.playerEntity.update(deltaSeconds);
    
    // Get final position from ECS for visual sync
    const finalPosition = this.playerEntity.getComponent('position') as PositionComponent;
    const finalVelocity = this.playerEntity.getComponent('velocity') as VelocityComponent;
    
    // Update Phaser visual position directly
    this.playerVisual.x = finalPosition.x;
    this.playerVisual.y = finalPosition.y;
    
    // Update debug collision visualization
    const allEntities = [this.playerEntity, ...this.platformEntities];
    this.debugCollision.update(allEntities, collisions, 64);
    
    console.log(`[SYNC] ECS pos: (${finalPosition.x.toFixed(1)}, ${finalPosition.y.toFixed(1)}) vel: (${finalVelocity.x.toFixed(1)}, ${finalVelocity.y.toFixed(1)})`);
  }
  
  private updateStaminaBar(sprintInfo: any): void {
    const staminaRatio = sprintInfo.stamina / sprintInfo.maxStamina;
    const maxWidth = 200 - 4; // Bar width minus margins
    const currentWidth = maxWidth * staminaRatio;
    
    // Update the fill width
    this.staminaBarFill.setSize(Math.max(currentWidth, 0), 16); // 16 = height minus margins
    
    // Update color based on stamina level
    let color: number;
    if (staminaRatio > 0.5) {
      color = 0x00ff00; // Green when above 50%
    } else if (staminaRatio > 0.2) {
      color = 0xffff00; // Yellow when between 20-50%
    } else {
      color = 0xff0000; // Red when below 20%
    }
    
    this.staminaBarFill.setFillStyle(color);
    
    // Update text to show if currently sprinting
    const sprintStatus = sprintInfo.sprinting ? ' (SPRINTING)' : '';
    this.staminaBarText.setText(`SPRINT STAMINA${sprintStatus}`);
    
    // Change text color when sprinting
    if (sprintInfo.sprinting) {
      this.staminaBarText.setColor('#00ff00'); // Green when sprinting
    } else {
      this.staminaBarText.setColor('#ffffff'); // White when not sprinting
    }
  }
}