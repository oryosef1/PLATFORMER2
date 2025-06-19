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
    this.platforms.add(ground);
    
    // Create floating platforms
    const platform1 = this.add.rectangle(400, 500, 200, 32, 0x27ae60);
    this.physics.add.existing(platform1, true);
    this.platforms.add(platform1);
    
    const platform2 = this.add.rectangle(700, 350, 200, 32, 0x27ae60);
    this.physics.add.existing(platform2, true);
    this.platforms.add(platform2);
    
    // Create ECS-based player entity
    this.playerEntity = new PlayerEntity(100, 500); // Start on a platform
    console.log('[GAME] PlayerEntity created');
    
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
    
    // Configure player physics
    const playerBody = this.playerVisual.body as Phaser.Physics.Arcade.Body;
    playerBody.setBounce(0);
    playerBody.setCollideWorldBounds(true);
    
    // Player-platform collisions
    this.physics.add.collider(this.playerVisual, this.platforms, (player, platform) => {
      // Only correct position when transitioning from air to ground
      const wasGrounded = this.playerEntity.isOnGround();
      const velocity = this.playerEntity.getComponent('velocity') as VelocityComponent;
      
      if (!wasGrounded && velocity.y > 0) {
        // Get platform bounds
        const platformBody = platform.body as Phaser.Physics.Arcade.Body;
        const playerBody = player.body as Phaser.Physics.Arcade.Body;
        
        // Position player exactly on top of platform
        const platformTop = platformBody.y;
        const correctedY = platformTop - playerBody.height/2;
        
        // Update ECS position to match corrected position
        const position = this.playerEntity.getComponent('position') as PositionComponent;
        position.y = correctedY;
        
        console.log(`[COLLISION] Player landed - corrected Y to ${correctedY}`);
      }
      
      // Always update ground state when colliding
      this.playerEntity.setGroundState(true);
    });
    
    // Detect when player leaves ground
    this.physics.world.on('worldstep', () => {
      const body = this.playerVisual.body as Phaser.Physics.Arcade.Body;
      if (!body.touching.down && !body.blocked.down) {
        this.playerEntity.setGroundState(false);
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
    this.add.text(10, 90, 'UP to jump', { fontSize: '14px', color: '#ffffff' });
    this.add.text(10, 110, 'Check console for input debugging', { fontSize: '12px', color: '#ffff00' });
    
    // Player position debug
    this.add.text(10, 140, 'Player Position:', { fontSize: '16px', color: '#ffffff' });
    const posText = this.add.text(10, 160, '', { fontSize: '14px', color: '#ffffff' });
    
    // Input debug display
    this.add.text(10, 190, 'Input Debug:', { fontSize: '16px', color: '#ffffff' });
    this.inputDebugText = this.add.text(10, 210, '', { fontSize: '12px', color: '#00ff00' });
    
    // Player ECS debug display
    this.add.text(10, 250, 'Player ECS Debug:', { fontSize: '16px', color: '#ffffff' });
    this.playerDebugText = this.add.text(10, 270, '', { fontSize: '12px', color: '#00ffff' });
    
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
        `Grounded: ${playerDebug.isGrounded}\nSpeed: ${playerDebug.speed}`
      );
    });
  }

  update(time: number, delta: number) {
    // Update InputManager first
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
    
    // Simple jumping (we'll enhance this in Phase 2.2)
    if (upPressed && isOnGround) {
      const velocity = this.playerEntity.getComponent('velocity') as VelocityComponent;
      velocity.y = -500;
      console.log('[MOVEMENT] Jump initiated');
    }
    
    // Update player entity with delta time - ECS is source of truth
    const deltaSeconds = delta / 1000; // Convert to seconds
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
    
    console.log(`[SYNC] ECS pos: (${position.x.toFixed(1)}, ${position.y.toFixed(1)}) vel: (${velocity.x.toFixed(1)}, ${velocity.y.toFixed(1)})`);
  }
}