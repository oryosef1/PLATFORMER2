import Phaser from 'phaser';
import { InputManager } from '../input/InputManager';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private platforms!: Phaser.GameObjects.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private inputManager!: InputManager;
  private inputDebugText!: Phaser.GameObjects.Text;

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
    
    // Create player as colored rectangle
    this.player = this.add.rectangle(100, 100, 32, 48, 0xe74c3c);
    this.physics.add.existing(this.player);
    
    // Configure player physics
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setBounce(0.1);
    playerBody.setCollideWorldBounds(true);
    
    // Player-platform collisions
    this.physics.add.collider(this.player, this.platforms);
    
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
    
    // Update debug info every frame
    this.events.on('update', () => {
      posText.setText(`X: ${Math.floor(this.player.x)}, Y: ${Math.floor(this.player.y)}`);
      
      // Display input state
      const debugInfo = this.inputManager.getDebugInfo();
      const activeKeys = debugInfo.activeKeys.join(', ') || 'None';
      const bufferedInputs = debugInfo.bufferedInputs.join(', ') || 'None';
      this.inputDebugText.setText(`Active: ${activeKeys}\nBuffered: ${bufferedInputs}`);
    });
  }

  update() {
    // Update InputManager first
    this.inputManager.update();
    
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    
    // Test InputManager alongside Phaser cursors
    const leftPressed = this.cursors.left?.isDown || this.inputManager.isKeyDown('ArrowLeft');
    const rightPressed = this.cursors.right?.isDown || this.inputManager.isKeyDown('ArrowRight');
    const upPressed = this.cursors.up?.isDown || this.inputManager.isKeyDown('ArrowUp');
    
    // Log movement for debugging
    if (leftPressed) console.log('[MOVEMENT] Moving left');
    if (rightPressed) console.log('[MOVEMENT] Moving right');
    if (upPressed && playerBody.touching.down) console.log('[MOVEMENT] Jumping');
    
    // Horizontal movement
    if (leftPressed) {
      playerBody.setVelocityX(-200);
    } else if (rightPressed) {
      playerBody.setVelocityX(200);
    } else {
      playerBody.setVelocityX(0);
    }
    
    // Jumping - only when on ground
    if (upPressed && playerBody.touching.down) {
      playerBody.setVelocityY(-500);
    }
  }
}