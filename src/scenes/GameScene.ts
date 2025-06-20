import Phaser from 'phaser';
import { InputManager } from '../input/InputManager';
import { PlayerEntity } from '../entities/PlayerEntity';
import { PlatformEntity } from '../entities/PlatformEntity';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { VelocityComponent } from '../ecs/components/VelocityComponent';
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
    // Ground platform
    const groundEntity = new PlatformEntity(512, 700, 1024, 100);
    this.platformEntities.push(groundEntity);
    this.collisionSystem.addEntity(groundEntity);
    
    // Create visual for ground
    const groundVisual = this.add.rectangle(512, 700, 1024, 100, 0x27ae60);
    groundVisual.setDepth(0);
    this.platformVisuals.push(groundVisual);
    
    // Floating platforms
    const platform1Entity = new PlatformEntity(400, 500, 200, 32);
    this.platformEntities.push(platform1Entity);
    this.collisionSystem.addEntity(platform1Entity);
    
    const platform1Visual = this.add.rectangle(400, 500, 200, 32, 0x27ae60);
    platform1Visual.setDepth(0);
    this.platformVisuals.push(platform1Visual);
    
    const platform2Entity = new PlatformEntity(700, 350, 200, 32);
    this.platformEntities.push(platform2Entity);
    this.collisionSystem.addEntity(platform2Entity);
    
    const platform2Visual = this.add.rectangle(700, 350, 200, 32, 0x27ae60);
    platform2Visual.setDepth(0);
    this.platformVisuals.push(platform2Visual);
    
    // Create ECS-based player entity - position to be on ground
    // Ground is at Y=700 with height 100, so top of ground is at Y=650
    // Player height is 48, so player center should be at Y=650-24=626
    this.playerEntity = new PlayerEntity(100, 626); // Start on ground platform
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
    this.add.text(10, 130, 'C - Toggle collision debug', { fontSize: '12px', color: '#ffff00' });
    this.add.text(10, 150, 'Check console for collision debugging', { fontSize: '12px', color: '#ffff00' });
    
    // Add debug controls
    this.input.keyboard!.on('keydown-C', () => {
      this.debugModeEnabled = !this.debugModeEnabled;
      this.debugCollision.setEnabled(this.debugModeEnabled);
      console.log(`[DEBUG] Collision debug: ${this.debugModeEnabled ? 'ON' : 'OFF'}`);
    });
    
    // Player position debug
    this.add.text(10, 160, 'Player Position:', { fontSize: '16px', color: '#ffffff' });
    const posText = this.add.text(10, 180, '', { fontSize: '14px', color: '#ffffff' });
    
    // Input debug display
    this.add.text(10, 210, 'Input Debug:', { fontSize: '16px', color: '#ffffff' });
    this.inputDebugText = this.add.text(10, 230, '', { fontSize: '12px', color: '#00ff00' });
    
    // Player ECS debug display
    this.add.text(10, 280, 'Player ECS Debug:', { fontSize: '16px', color: '#ffffff' });
    this.playerDebugText = this.add.text(10, 300, '', { fontSize: '12px', color: '#00ffff' });
    
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
        `Double: ${playerDebug.jumping.doubleJump}`
      );
    });
  }

  update(time: number, delta: number) {
    // Convert delta time first
    const deltaSeconds = delta / 1000; // Convert to seconds
    
    // IMPORTANT: Check for jump input BEFORE updating InputManager (which clears justPressed flags)
    const wasUpPressed = this.inputManager.isKeyJustPressed('ArrowUp') || this.cursors.up?.justDown;
    const wasUpReleased = this.inputManager.isKeyJustReleased('ArrowUp') || this.cursors.up?.justUp;
    
    // Now update InputManager (this clears justPressed flags)
    this.inputManager.update();
    
    // Get input states
    const leftPressed = this.cursors.left?.isDown || this.inputManager.isKeyDown('ArrowLeft');
    const rightPressed = this.cursors.right?.isDown || this.inputManager.isKeyDown('ArrowRight');
    const upPressed = this.cursors.up?.isDown || this.inputManager.isKeyDown('ArrowUp');
    
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
    
    // Enhanced jumping system (Phase 2.2) - using captured values
    
    // Handle jump start
    if (wasUpPressed) {
      const isOnGround = this.playerEntity.isOnGround();
      console.log(`[MOVEMENT] UP pressed - player isOnGround: ${isOnGround}`);
      
      // Try regular jump first
      if (!this.playerEntity.startJump()) {
        // If regular jump failed, try double jump
        if (!this.playerEntity.startDoubleJump()) {
          // If both failed, buffer the jump
          this.playerEntity.bufferJump();
          console.log('[MOVEMENT] Jump buffered - player not on ground');
        } else {
          console.log('[MOVEMENT] Double jump executed');
        }
      } else {
        console.log('[MOVEMENT] Jump started successfully');
      }
    }
    
    // Handle variable jump height (hold for higher jump)
    this.playerEntity.updateJump(deltaSeconds, upPressed);
    
    // Handle jump cancellation (using captured release value)
    if (wasUpReleased) {
      this.playerEntity.cancelJump();
    }
    
    // Update jumping systems
    this.playerEntity.updateCoyoteTime(deltaSeconds);
    this.playerEntity.updateJumpBuffer(deltaSeconds);
    
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
    for (const collision of collisions) {
      if (collision.entityA === this.playerEntity || collision.entityB === this.playerEntity) {
        const platform = collision.entityA === this.playerEntity ? collision.entityB : collision.entityA;
        
        console.log(`[COLLISION] Player collision detected:`);
        console.log(`[COLLISION] Normal: ${collision.collisionInfo.normalX}, ${collision.collisionInfo.normalY}`);
        console.log(`[COLLISION] Overlap: ${collision.collisionInfo.overlapX.toFixed(1)}, ${collision.collisionInfo.overlapY.toFixed(1)}`);
        console.log(`[COLLISION] Player velocity: ${velocity.x.toFixed(1)}, ${velocity.y.toFixed(1)}`);
        
        // Simple, robust collision resolution
        if (collision.collisionInfo.normalY === -1 && velocity.y >= 0) {
          // Landing on top of platform (falling down)
          position.y -= collision.collisionInfo.overlapY;
          velocity.y = 0;
          if (!this.playerEntity.isOnGround()) {
            console.log('[COLLISION] Player landed on platform');
            this.playerEntity.setGroundState(true);
          }
        } else if (collision.collisionInfo.normalY === 1 && velocity.y <= 0) {
          // Hitting ceiling (jumping up)
          position.y += collision.collisionInfo.overlapY;
          velocity.y = 0;
          console.log('[COLLISION] Player hit ceiling');
        } else if (collision.collisionInfo.normalX !== 0) {
          // Side collision
          if (collision.collisionInfo.normalX === -1) {
            position.x -= collision.collisionInfo.overlapX;
          } else {
            position.x += collision.collisionInfo.overlapX;
          }
          velocity.x = 0;
          console.log('[COLLISION] Player hit wall');
        }
      }
    }
    
    // Check if player left ground (no longer colliding with any platform from below)
    const isStillOnGround = collisions.some(collision => {
      const isPlayerCollision = collision.entityA === this.playerEntity || collision.entityB === this.playerEntity;
      return isPlayerCollision && collision.collisionInfo.normalY === -1 && velocity.y >= 0;
    });
    
    if (this.playerEntity.isOnGround() && !isStillOnGround) {
      console.log('[COLLISION] Player left ground - no platform collision');
      this.playerEntity.setGroundState(false);
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
}