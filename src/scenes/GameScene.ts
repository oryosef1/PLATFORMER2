import Phaser from 'phaser';
import { InputManager } from '../input/InputManager';
import { PlayerEntity } from '../entities/PlayerEntity';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { VelocityComponent } from '../ecs/components/VelocityComponent';

export class GameScene extends Phaser.Scene {
  private playerVisual!: Phaser.GameObjects.Rectangle;
  private playerEntity!: PlayerEntity;
  private platforms!: Phaser.GameObjects.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private inputManager!: InputManager;
  private inputDebugText!: Phaser.GameObjects.Text;
  private playerDebugText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Create platforms group
    this.platforms = this.add.group();
    
    // Create ground platform
    const ground = this.add.rectangle(512, 700, 1024, 100, 0x27ae60);
    this.physics.add.existing(ground, true); // true = static body
    ground.setDepth(0); // Platforms at depth 0
    this.platforms.add(ground);
    
    // Create floating platforms
    const platform1 = this.add.rectangle(400, 500, 200, 32, 0x27ae60);
    this.physics.add.existing(platform1, true);
    platform1.setDepth(0); // Platforms at depth 0
    this.platforms.add(platform1);
    
    const platform2 = this.add.rectangle(700, 350, 200, 32, 0x27ae60);
    this.physics.add.existing(platform2, true);
    platform2.setDepth(0); // Platforms at depth 0
    this.platforms.add(platform2);
    
    // Create ECS-based player entity - position to be on ground
    // Ground is at Y=700 with height 100, so top of ground is at Y=650
    // Player height is 48, so player center should be at Y=650-24=626
    this.playerEntity = new PlayerEntity(100, 626); // Start on ground platform
    console.log('[GAME] PlayerEntity created at ground level');
    
    // Create visual representation for player
    const playerVisual = this.playerEntity.getVisual();
    this.playerVisual = this.add.rectangle(
      playerVisual.x, 
      playerVisual.y, 
      playerVisual.width, 
      playerVisual.height, 
      0xe74c3c
    );
    this.physics.add.existing(this.playerVisual);
    
    // Set player depth to render on top of platforms
    this.playerVisual.setDepth(100);
    
    // Configure player physics
    const playerBody = this.playerVisual.body as Phaser.Physics.Arcade.Body;
    playerBody.setBounce(0);
    playerBody.setCollideWorldBounds(true);
    
    // Player-platform collisions
    this.physics.add.collider(this.playerVisual, this.platforms, (player, platform) => {
      const wasGrounded = this.playerEntity.isOnGround();
      const velocity = this.playerEntity.getComponent('velocity') as VelocityComponent;
      const platformBody = platform.body as Phaser.Physics.Arcade.Body;
      const playerBody = player.body as Phaser.Physics.Arcade.Body;
      
      // Check if player is landing on top of platform (not hitting sides)
      const playerBottom = playerBody.y + playerBody.height;
      const platformTop = platformBody.y;
      const playerCenterX = playerBody.x + playerBody.width / 2;
      const platformLeft = platformBody.x;
      const platformRight = platformBody.x + platformBody.width;
      
      // Only treat as "landing" if:
      // 1. Player was in air and falling (velocity.y > 0)
      // 2. Player's center X is within platform bounds
      // 3. Player's bottom is close to platform top (within collision tolerance)
      const isLandingOnTop = !wasGrounded && 
                           velocity.y > 0 && 
                           playerCenterX >= platformLeft && 
                           playerCenterX <= platformRight &&
                           Math.abs(playerBottom - platformTop) < 20; // 20px tolerance
      
      if (isLandingOnTop) {
        // Position player exactly on top of platform
        const correctedY = platformTop - playerBody.height/2;
        
        // Update ECS position to match corrected position
        const position = this.playerEntity.getComponent('position') as PositionComponent;
        position.y = correctedY;
        
        console.log(`[COLLISION] Player landed on top - corrected Y to ${correctedY}`);
        
        // Set ground state only when actually landing on top
        this.playerEntity.setGroundState(true);
      } else {
        // Side collision - don't change ground state or position
        console.log(`[COLLISION] Side collision detected - no ground state change`);
      }
    });
    
    // Detect when player leaves ground
    // Note: This runs AFTER collision detection, so we check if the player is still touching ground
    this.physics.world.on('worldstep', () => {
      const body = this.playerVisual.body as Phaser.Physics.Arcade.Body;
      const touchingDown = body.touching.down;
      const blockedDown = body.blocked.down;
      const isCurrentlyGrounded = this.playerEntity.isOnGround();
      
      // Only set to false if we were grounded but are no longer touching
      if (isCurrentlyGrounded && !touchingDown && !blockedDown) {
        console.log(`[GROUND_CHECK] Player left ground`);
        this.playerEntity.setGroundState(false);
      } else if ((touchingDown || blockedDown) && !isCurrentlyGrounded) {
        console.log(`[GROUND_CHECK] Player touched ground`);
        this.playerEntity.setGroundState(true);
      }
    });
    
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
    this.add.text(10, 130, 'Check console for jump debugging', { fontSize: '12px', color: '#ffff00' });
    
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
    
    // Update player entity with delta time - ECS is source of truth
    this.playerEntity.update(deltaSeconds);
    
    // Get final position from ECS
    const position = this.playerEntity.getComponent('position') as PositionComponent;
    const velocity = this.playerEntity.getComponent('velocity') as VelocityComponent;
    
    // Update Phaser visual position directly (no physics body movement)
    this.playerVisual.x = position.x;
    this.playerVisual.y = position.y;
    
    // Update Phaser physics body position for collision detection only
    const playerBody = this.playerVisual.body as Phaser.Physics.Arcade.Body;
    playerBody.x = position.x - this.playerVisual.width/2;
    playerBody.y = position.y - this.playerVisual.height/2;
    
    // Stop Phaser from moving the body with velocity
    playerBody.setVelocity(0, 0);
    
    console.log(`[SYNC] ECS pos: (${position.x.toFixed(1)}, ${position.y.toFixed(1)}) vel: (${velocity.x.toFixed(1)}, ${velocity.y.toFixed(1)}) body: (${playerBody.x.toFixed(1)}, ${playerBody.y.toFixed(1)})`);
  }
}