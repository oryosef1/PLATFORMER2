import Phaser from 'phaser';
import { InputManager } from '../input/InputManager';
import { PlayerEntity } from '../entities/PlayerEntity';
import { PlatformEntity } from '../entities/PlatformEntity';
import { TestEnemyEntity } from '../entities/TestEnemyEntity';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { VelocityComponent } from '../ecs/components/VelocityComponent';
import { CollisionComponent } from '../ecs/components/CollisionComponent';
import { CollisionSystem } from '../ecs/systems/CollisionSystem';
import { CombatSystem } from '../ecs/systems/CombatSystem';
import { DebugCollision } from '../utils/DebugCollision';
import { MovementConstants } from '../physics/MovementConstants';

export class GameScene extends Phaser.Scene {
  private playerVisual!: Phaser.GameObjects.Rectangle;
  private playerEntity!: PlayerEntity;
  private platformEntities: PlatformEntity[] = [];
  private platformVisuals: Phaser.GameObjects.Rectangle[] = [];
  private testEnemyEntity!: TestEnemyEntity;
  private testEnemyVisual!: Phaser.GameObjects.Rectangle;
  private swordVisual!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private inputManager!: InputManager;
  private inputDebugText!: Phaser.GameObjects.Text;
  private playerDebugText!: Phaser.GameObjects.Text;
  private collisionSystem!: CollisionSystem;
  private combatSystem!: CombatSystem;
  private debugCollision!: DebugCollision;
  private debugModeEnabled: boolean = true;
  
  // Combat debug visuals
  private playerHurtboxDebug!: Phaser.GameObjects.Rectangle;
  private playerHitboxDebug!: Phaser.GameObjects.Rectangle;
  private enemyHurtboxDebug!: Phaser.GameObjects.Rectangle;
  
  // Stamina UI elements
  private staminaBarBackground!: Phaser.GameObjects.Rectangle;
  private staminaBarFill!: Phaser.GameObjects.Rectangle;
  private staminaBarText!: Phaser.GameObjects.Text;
  
  // Screen shake system
  private screenShakeIntensity: number = 0;
  private screenShakeDuration: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Initialize collision system
    this.collisionSystem = new CollisionSystem(64); // 64px spatial hash cells
    console.log('[GAME] CollisionSystem initialized');
    
    // Initialize combat system
    this.combatSystem = new CombatSystem();
    console.log('[GAME] CombatSystem initialized');
    
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
    this.combatSystem.addEntity(this.playerEntity);
    console.log('[GAME] PlayerEntity created at ground level and added to collision and combat systems');
    
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
    
    // Create sword visual (initially hidden) - made slightly longer
    this.swordVisual = this.add.rectangle(0, 0, 40, 16, 0xc0c0c0); // Silver color for sword, longer width
    this.swordVisual.setDepth(110); // Above player
    this.swordVisual.setVisible(false); // Hidden by default
    
    // Create test enemy for combat testing
    this.testEnemyEntity = new TestEnemyEntity(600, 660, 64, 48); // On ground platform, away from walls - larger for easier targeting
    this.collisionSystem.addEntity(this.testEnemyEntity); // Add to collision system so player can interact with it
    this.combatSystem.addEntity(this.testEnemyEntity);
    console.log('[GAME] Test enemy created and added to collision and combat systems');
    
    // Create visual for test enemy
    const enemyVisual = this.testEnemyEntity.getVisual();
    this.testEnemyVisual = this.add.rectangle(
      enemyVisual.x,
      enemyVisual.y,
      enemyVisual.width,
      enemyVisual.height,
      0xff6b35 // Orange color for enemy
    );
    this.testEnemyVisual.setDepth(50); // Between platforms and player
    
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
    this.add.text(10, 190, 'Z to attack (melee)', { fontSize: '14px', color: '#ffffff' });
    this.add.text(10, 210, 'C - Toggle collision debug', { fontSize: '12px', color: '#ffff00' });
    this.add.text(10, 230, 'Check console for debugging', { fontSize: '12px', color: '#ffff00' });
    
    // Add debug controls
    this.input.keyboard!.on('keydown-C', () => {
      this.debugModeEnabled = !this.debugModeEnabled;
      this.debugCollision.setEnabled(this.debugModeEnabled);
      console.log(`[DEBUG] Debug mode: ${this.debugModeEnabled ? 'ON' : 'OFF'}`);
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
    
    // Create combat debug visuals
    this.createCombatDebugVisuals();
    
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
        `Stamina: ${playerDebug.sprint.stamina}/${playerDebug.sprint.maxStamina} | Can Sprint: ${playerDebug.sprint.canSprint}\n` +
        `Attack: ${playerDebug.combat.attacking} | Frames: ${playerDebug.combat.attackFrames} | Cooldown: ${playerDebug.combat.attackCooldown}\n` +
        `Health: ${playerDebug.combat.health}/${playerDebug.combat.maxHealth} | Can Attack: ${playerDebug.combat.canAttack}\n` +
        `Pogo Window: ${playerDebug.pogo.successWindow} | Can Pogo: ${playerDebug.pogo.hasActiveWindow}\n` +
        `Enemy Health: ${this.testEnemyEntity.getCurrentHealth()}/${this.testEnemyEntity.getMaxHealth()}`
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
    const wasAttackPressed = this.inputManager.isKeyJustPressed('KeyZ'); // Z key for attack
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
      this.playerEntity.applyMovement('left', true, isOnGround, deltaSeconds);
    } else if (rightPressed) {
      this.playerEntity.applyMovement('right', true, isOnGround, deltaSeconds);
    } else {
      this.playerEntity.applyMovement('none', false, isOnGround, deltaSeconds);
    }
    
    // Apply gravity with proper deltaTime
    this.playerEntity.applyGravity(deltaSeconds);
    
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
    
    // Handle attack input
    if (wasAttackPressed) {
      // Check directional modifiers for attack type
      const downPressed = this.cursors.down?.isDown || this.inputManager.isKeyDown('ArrowDown');
      const upPressed = this.cursors.up?.isDown || this.inputManager.isKeyDown('ArrowUp');
      
      console.log(`[ATTACK_DEBUG] Attack pressed - DOWN: ${downPressed}, UP: ${upPressed}, Grounded: ${this.playerEntity.isOnGround()}`);
      
      if (downPressed) {
        // Execute downward pogo attack (DOWN + Z)
        console.log('[POGO] Attempting downward attack...');
        if (this.playerEntity.executeDownwardAttack()) {
          console.log('[POGO] Downward attack executed successfully');
        } else {
          console.log('[POGO] Downward attack failed - must be in air');
        }
      } else if (upPressed) {
        // Execute upward attack (UP + Z)
        console.log('[UPWARD] Attempting upward attack...');
        if (this.playerEntity.executeUpwardAttack()) {
          console.log('[UPWARD] Upward attack executed successfully');
        } else {
          console.log('[UPWARD] Upward attack failed - already attacking');
        }
      } else {
        // Regular horizontal attack
        console.log('[COMBAT] Attempting regular attack...');
        if (this.playerEntity.executeAttack()) {
          console.log('[COMBAT] Attack executed');
        } else {
          console.log('[COMBAT] Attack failed - already attacking');
        }
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
    
    // Step 1.5: Apply physics to enemy (gravity)
    const enemyPosition = this.testEnemyEntity.getComponent<PositionComponent>('position')!;
    const enemyVelocity = this.testEnemyEntity.getComponent<VelocityComponent>('velocity')!;
    
    // Apply gravity to enemy
    enemyVelocity.y += MovementConstants.GRAVITY * deltaSeconds;
    if (enemyVelocity.y > MovementConstants.TERMINAL_VELOCITY) {
      enemyVelocity.y = MovementConstants.TERMINAL_VELOCITY;
    }
    
    // Apply friction to enemy horizontal movement (stops sliding)
    enemyVelocity.x *= 0.8; // Strong friction for quick stop
    if (Math.abs(enemyVelocity.x) < 1) {
      enemyVelocity.x = 0; // Stop very small movements
    }
    
    // Apply enemy movement
    enemyPosition.x += enemyVelocity.x * deltaSeconds;
    enemyPosition.y += enemyVelocity.y * deltaSeconds;
    
    // Update enemy (for damage flash timing etc.)
    this.testEnemyEntity.update(deltaSeconds);
    
    // Step 2: Check for collisions after movement
    const collisions = this.collisionSystem.update(deltaSeconds);
    
    // Step 2.5: Process combat interactions
    const combatResults = this.combatSystem.update();
    if (combatResults.length > 0) {
      console.log(`[COMBAT] Processed ${combatResults.length} combat interactions`);
      for (const result of combatResults) {
        console.log(`[COMBAT] ${result.attacker.id} dealt ${result.damage} damage to ${result.target.id}`);
        
        // Check if this was a pogo attack hitting an enemy
        if (result.attacker === this.playerEntity && result.target === this.testEnemyEntity) {
          const playerHitbox = this.playerEntity.getComponent('hitbox');
          if (playerHitbox && playerHitbox.type === 'pogo') {
            // Execute pogo bounce automatically when pogo attack hits enemy
            if (this.playerEntity.executePogoBounce()) {
              console.log('[POGO] Auto-bounce executed after hitting enemy');
              // Add stronger screen shake for pogo hits
              this.startScreenShake(10, 14); // Slightly stronger than regular hits
            }
          } else {
            // Regular attack screen shake
            this.startScreenShake(8, 12); // 8 intensity, 12 frames duration
          }
        } else {
          // Regular screen shake for other combat interactions
          this.startScreenShake(8, 12); // 8 intensity, 12 frames duration
        }
      }
    }
    
    // Step 2.6: Handle enemy death and respawn
    if (this.testEnemyEntity.isDead()) {
      console.log(`[ENEMY] Enemy died - respawning in 3 seconds`);
      // Reset enemy to full health and move to original position
      this.testEnemyEntity.heal(this.testEnemyEntity.getMaxHealth());
      const enemyPos = this.testEnemyEntity.getComponent<PositionComponent>('position')!;
      const enemyVel = this.testEnemyEntity.getComponent<VelocityComponent>('velocity')!;
      enemyPos.x = 600; // Original spawn position
      enemyPos.y = 660; // Original spawn position 
      enemyVel.x = 0;   // Reset velocity
      enemyVel.y = 0;   // Reset velocity
    }
    
    // Step 3: Process and resolve collisions
    let touchingWallLeft = false;
    let touchingWallRight = false;
    
    for (const collision of collisions) {
      if (collision.entityA === this.playerEntity || collision.entityB === this.playerEntity) {
        const other = collision.entityA === this.playerEntity ? collision.entityB : collision.entityA;
        
        // Check if colliding with enemy
        if (other === this.testEnemyEntity) {
          // Player touching enemy - apply damage and knockback only if vulnerable
          if (this.playerEntity.isVulnerable()) {
            const playerPos = this.playerEntity.getComponent('position') as PositionComponent;
            const enemyPos = other.getComponent('position') as PositionComponent;
            const knockbackDirection = enemyPos.x > playerPos.x ? -1 : 1; // Push away from enemy
            if (this.playerEntity.takeDamage(10, knockbackDirection)) {
              console.log(`[COMBAT] Player hit by enemy - damage and knockback applied (direction: ${knockbackDirection})`);
              
              // Trigger screen shake when player gets hit (stronger than when hitting enemies)
              this.startScreenShake(12, 15); // 12 intensity, 15 frames duration
            }
          } else {
            console.log(`[COMBAT] Player touching enemy but invincible - no damage`);
          }
          // Enemy is always solid regardless of damage/invincibility - continue with collision resolution
          console.log(`[COLLISION] Processing enemy as solid collision`);
        }
        
        const platform = other; // Treat as platform for collision resolution
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
          // Side collision - wall detected (including enemies)
          if (collision.collisionInfo.normalX === -1) {
            // Hitting wall/enemy on the right (normal points left)
            const correctionX = collision.collisionInfo.overlapX + 0.1;
            position.x -= correctionX;
            if (other === this.testEnemyEntity) {
              console.log('[COLLISION] Player pushed LEFT by enemy');
            } else {
              touchingWallRight = true;
              console.log('[COLLISION] Player hit RIGHT wall');
            }
          } else {
            // Hitting wall/enemy on the left (normal points right)
            const correctionX = collision.collisionInfo.overlapX + 0.1;
            position.x += correctionX;
            if (other === this.testEnemyEntity) {
              console.log('[COLLISION] Player pushed RIGHT by enemy');
            } else {
              touchingWallLeft = true;
              console.log('[COLLISION] Player hit LEFT wall');
            }
          }
          // Only set velocity to 0 for walls, not for enemies (let knockback work)
          if (other !== this.testEnemyEntity) {
            velocity.x = 0;
          }
          console.log(`[COLLISION] Wall contact - Left: ${touchingWallLeft}, Right: ${touchingWallRight}`);
        }
      }
      // Handle collisions involving the test enemy
      else if (collision.entityA === this.testEnemyEntity || collision.entityB === this.testEnemyEntity) {
        const enemy = collision.entityA === this.testEnemyEntity ? collision.entityA : collision.entityB;
        const other = collision.entityA === this.testEnemyEntity ? collision.entityB : collision.entityA;
        const enemyPosition = enemy.getComponent('position') as PositionComponent;
        const enemyVelocity = enemy.getComponent('velocity') as VelocityComponent;
        
        // Handle enemy collision resolution
        if (collision.collisionInfo.normalY === -1 && enemyVelocity.y >= 0) {
          // Enemy landing on platform
          const correctionY = collision.collisionInfo.overlapY + 0.1;
          enemyPosition.y -= correctionY;
          enemyVelocity.y = 0;
          // Only log when significant landing (not oscillation)
          if (collision.collisionInfo.overlapY > 5) {
            console.log('[COLLISION] Enemy landed on platform');
          }
        } else if (collision.collisionInfo.normalX !== 0) {
          // Enemy side collision
          if (collision.collisionInfo.normalX === -1) {
            const correctionX = collision.collisionInfo.overlapX + 0.1;
            enemyPosition.x -= correctionX;
            console.log('[COLLISION] Enemy hit wall (right side)');
          } else {
            const correctionX = collision.collisionInfo.overlapX + 0.1;
            enemyPosition.x += correctionX;
            console.log('[COLLISION] Enemy hit wall (left side)');
          }
          enemyVelocity.x = 0;
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
    
    // Update test enemy
    this.testEnemyEntity.update(deltaSeconds);
    
    // Check if player is dead and respawn if needed
    if (this.playerEntity.isDead()) {
      console.log('[GAME] Player died - respawning...');
      this.playerEntity.respawn(200, 660); // Respawn at starting position
    }
    
    // Get final position from ECS for visual sync
    const finalPosition = this.playerEntity.getComponent('position') as PositionComponent;
    const finalVelocity = this.playerEntity.getComponent('velocity') as VelocityComponent;
    
    // Update Phaser visual positions directly
    this.playerVisual.x = finalPosition.x;
    this.playerVisual.y = finalPosition.y;
    
    
    // Update player visual for invincibility feedback
    this.updatePlayerVisualEffects();
    
    // Update sword visual position and visibility
    this.updateSwordVisual(finalPosition);
    
    // Update combat debug visuals
    this.updateCombatDebugVisuals();
    
    const enemyVisualPosition = this.testEnemyEntity.getComponent('position') as PositionComponent;
    this.testEnemyVisual.x = enemyVisualPosition.x;
    this.testEnemyVisual.y = enemyVisualPosition.y;
    
    // Update enemy visual effects
    this.updateEnemyVisualEffects();
    
    // Update debug collision visualization
    const allEntities = [this.playerEntity, this.testEnemyEntity, ...this.platformEntities];
    this.debugCollision.update(allEntities, collisions, 64);
    
    // Update screen shake
    this.updateScreenShake();
    
    console.log(`[SYNC] ECS pos: (${finalPosition.x.toFixed(1)}, ${finalPosition.y.toFixed(1)}) vel: (${finalVelocity.x.toFixed(1)}, ${finalVelocity.y.toFixed(1)})`);
  }
  
  private updatePlayerVisualEffects(): void {
    // Show invincibility with flashing effect
    if (!this.playerEntity.isVulnerable()) {
      // Flash between visible and semi-transparent
      const flashRate = 8; // frames between flashes
      const currentFrame = this.game.loop.frame;
      const isVisible = Math.floor(currentFrame / flashRate) % 2 === 0;
      this.playerVisual.setAlpha(isVisible ? 0.3 : 1.0);
      this.playerVisual.setFillStyle(0xff0000); // Red tint when invincible
    } else {
      // Normal appearance
      this.playerVisual.setAlpha(1.0);
      this.playerVisual.setFillStyle(0xe74c3c); // Normal red color
    }
  }
  
  private updateSwordVisual(playerPosition: PositionComponent): void {
    if (this.playerEntity.isAttacking()) {
      // Show sword visual during attack
      this.swordVisual.setVisible(true);
      
      // Check attack type from hitbox
      const playerHitbox = this.playerEntity.getComponent('hitbox');
      const attackType = playerHitbox ? playerHitbox.attackType : 'melee';
      
      if (attackType === 'pogo') {
        // Downward attack - sword below player (rotated)
        // Use same positioning logic as hitbox creation in PlayerEntity
        const playerHalfHeight = MovementConstants.PLAYER_HEIGHT / 2; // Use constant like PlayerEntity
        const swordGap = 4; // Small gap between player and sword
        const swordWidth = 16; // Standardized attack width
        const swordHeight = 50; // Standardized attack height
        
        // Position sword below player - EXACTLY matching PlayerEntity hitbox positioning
        const swordCenterX = playerPosition.x;
        const swordCenterY = playerPosition.y + playerHalfHeight + swordGap + (swordHeight / 2);
        
        // Set sword visual for downward attack
        this.swordVisual.x = swordCenterX;
        this.swordVisual.y = swordCenterY;
        this.swordVisual.setSize(swordWidth, swordHeight); // Rotated dimensions
        this.swordVisual.setVisible(true); // Ensure it's visible
        
        console.log(`[POGO_SWORD] DOWNWARD SWORD: Player at (${playerPosition.x.toFixed(1)}, ${playerPosition.y.toFixed(1)}), Sword at (${swordCenterX.toFixed(1)}, ${swordCenterY.toFixed(1)}) size ${swordWidth}x${swordHeight}`);
        console.log(`[POGO_SWORD] PLAYER RECT: (${this.playerVisual.x}, ${this.playerVisual.y}) size ${this.playerVisual.width}x${this.playerVisual.height}`);
        console.log(`[POGO_SWORD] SWORD RECT: (${this.swordVisual.x}, ${this.swordVisual.y}) size ${this.swordVisual.width}x${this.swordVisual.height}`);
        console.log(`[POGO_SWORD] DISTANCE: ${swordCenterY - playerPosition.y} pixels below player`);
      } else if (attackType === 'upward') {
        // Upward attack - sword above player (rotated)
        // Use same positioning logic as hitbox creation in PlayerEntity
        const playerHalfHeight = MovementConstants.PLAYER_HEIGHT / 2; // Use constant like PlayerEntity
        const swordGap = 4; // Small gap between player and sword
        const swordWidth = 16; // Standardized attack width
        const swordHeight = 50; // Standardized attack height
        
        // Position sword above player - EXACTLY matching PlayerEntity hitbox positioning
        const swordCenterX = playerPosition.x;
        const swordCenterY = playerPosition.y - playerHalfHeight - swordGap - (swordHeight / 2);
        
        // Set sword visual for upward attack
        this.swordVisual.x = swordCenterX;
        this.swordVisual.y = swordCenterY;
        this.swordVisual.setSize(swordWidth, swordHeight); // Rotated dimensions
        this.swordVisual.setVisible(true); // Ensure it's visible
        
        console.log(`[UPWARD_SWORD] UPWARD SWORD: Player at (${playerPosition.x.toFixed(1)}, ${playerPosition.y.toFixed(1)}), Sword at (${swordCenterX.toFixed(1)}, ${swordCenterY.toFixed(1)}) size ${swordWidth}x${swordHeight}`);
        console.log(`[UPWARD_SWORD] DISTANCE: ${playerPosition.y - swordCenterY} pixels above player`);
      } else {
        // Regular horizontal attack
        const facingDirection = this.playerEntity.getFacingDirection();
        const playerHalfWidth = 32 / 2; // Player is 32 pixels wide
        const swordGap = 4; // Small gap between player and sword
        const swordWidth = 50; // Side attack width (horizontal)
        const swordHeight = 16; // Side attack height (horizontal)
        
        // Calculate where the sword visual should be positioned
        // We want the sword to appear next to the player, not overlapping
        const swordCenterX = playerPosition.x + (facingDirection * (playerHalfWidth + swordGap + swordWidth/2));
        const swordCenterY = playerPosition.y;
        
        // Set sword visual for horizontal attack
        this.swordVisual.x = swordCenterX;
        this.swordVisual.y = swordCenterY;
        this.swordVisual.setSize(swordWidth, swordHeight); // Horizontal dimensions (50x16)
        
        console.log(`[SWORD_DEBUG] Horizontal sword at (${swordCenterX.toFixed(1)}, ${swordCenterY.toFixed(1)}) size ${swordWidth}x${swordHeight}`);
      }
      
      // Get hitbox position for comparison
      if (playerHitbox) {
        const hitboxAABB = playerHitbox.getAABB();
        console.log(`[SWORD_DEBUG] Hitbox at (${hitboxAABB.x.toFixed(1)}, ${hitboxAABB.y.toFixed(1)}) size ${hitboxAABB.width}x${hitboxAABB.height}`);
      }
      
      // Optional: Add visual effects
      this.swordVisual.setFillStyle(0xffffff); // White color for sword swing
    } else {
      // Hide sword when not attacking
      this.swordVisual.setVisible(false);
    }
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
  
  private createCombatDebugVisuals(): void {
    // Player hurtbox (blue outline)
    this.playerHurtboxDebug = this.add.rectangle(0, 0, 32, 48, 0x0000ff, 0);
    this.playerHurtboxDebug.setStrokeStyle(2, 0x0000ff);
    this.playerHurtboxDebug.setDepth(300);
    this.playerHurtboxDebug.setVisible(this.debugModeEnabled);
    
    // Player hitbox (red outline) 
    this.playerHitboxDebug = this.add.rectangle(0, 0, 32, 16, 0xff0000, 0);
    this.playerHitboxDebug.setStrokeStyle(2, 0xff0000);
    this.playerHitboxDebug.setDepth(300);
    this.playerHitboxDebug.setVisible(false); // Only show when attacking
    
    // Enemy hurtbox (yellow outline) - updated to match new enemy size
    this.enemyHurtboxDebug = this.add.rectangle(0, 0, 64, 48, 0xffff00, 0);
    this.enemyHurtboxDebug.setStrokeStyle(2, 0xffff00);
    this.enemyHurtboxDebug.setDepth(300);
    this.enemyHurtboxDebug.setVisible(this.debugModeEnabled);
  }
  
  private updateCombatDebugVisuals(): void {
    if (!this.debugModeEnabled) {
      this.playerHurtboxDebug.setVisible(false);
      this.playerHitboxDebug.setVisible(false);
      this.enemyHurtboxDebug.setVisible(false);
      return;
    }
    
    // Update player hurtbox
    const playerPos = this.playerEntity.getComponent('position') as PositionComponent;
    const playerHurtbox = this.playerEntity.getComponent('hurtbox');
    if (playerHurtbox) {
      this.playerHurtboxDebug.setPosition(playerPos.x, playerPos.y);
      this.playerHurtboxDebug.setVisible(true);
    }
    
    // Update player hitbox (only when attacking)
    const playerHitbox = this.playerEntity.getComponent('hitbox');
    if (playerHitbox && playerHitbox.active) {
      const hitboxAABB = playerHitbox.getAABB();
      this.playerHitboxDebug.setPosition(hitboxAABB.x + hitboxAABB.width/2, hitboxAABB.y + hitboxAABB.height/2);
      this.playerHitboxDebug.setSize(hitboxAABB.width, hitboxAABB.height);
      this.playerHitboxDebug.setVisible(true);
    } else {
      this.playerHitboxDebug.setVisible(false);
    }
    
    // Update enemy hurtbox
    const enemyPos = this.testEnemyEntity.getComponent('position') as PositionComponent;
    const enemyHurtbox = this.testEnemyEntity.getComponent('hurtbox');
    if (enemyHurtbox) {
      this.enemyHurtboxDebug.setPosition(enemyPos.x, enemyPos.y);
      this.enemyHurtboxDebug.setVisible(true);
    }
  }
  
  private updateEnemyVisualEffects(): void {
    // Show damage flash effect
    if (this.testEnemyEntity.isDamageFlashing()) {
      // Flash white when taking damage
      this.testEnemyVisual.setFillStyle(0xffffff);
    } else {
      // Normal orange color
      this.testEnemyVisual.setFillStyle(0xff6b35);
    }
  }
  
  private startScreenShake(intensity: number, duration: number): void {
    this.screenShakeIntensity = intensity;
    this.screenShakeDuration = duration;
    console.log(`[SCREEN_SHAKE] Started - intensity: ${intensity}, duration: ${duration} frames`);
  }
  
  private updateScreenShake(): void {
    if (this.screenShakeDuration > 0) {
      // Calculate shake offset with random direction
      const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
      
      // Apply shake to camera
      this.cameras.main.setScroll(shakeX, shakeY);
      
      // Decrease duration and intensity over time
      this.screenShakeDuration--;
      this.screenShakeIntensity *= 0.9; // Gradually reduce intensity
      
      if (this.screenShakeDuration <= 0) {
        // Reset camera position when shake ends
        this.cameras.main.setScroll(0, 0);
        console.log(`[SCREEN_SHAKE] Ended`);
      }
    }
  }
}