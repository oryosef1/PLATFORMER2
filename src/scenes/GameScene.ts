import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private platforms!: Phaser.GameObjects.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

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
    
    // Debug info
    this.add.text(10, 50, 'Controls:', { fontSize: '16px', color: '#ffffff' });
    this.add.text(10, 70, 'Arrow Keys to move', { fontSize: '14px', color: '#ffffff' });
    this.add.text(10, 90, 'UP to jump', { fontSize: '14px', color: '#ffffff' });
    
    // Player position debug
    this.add.text(10, 120, 'Player Position:', { fontSize: '16px', color: '#ffffff' });
    const posText = this.add.text(10, 140, '', { fontSize: '14px', color: '#ffffff' });
    
    // Update position text every frame
    this.events.on('update', () => {
      posText.setText(`X: ${Math.floor(this.player.x)}, Y: ${Math.floor(this.player.y)}`);
    });
  }

  update() {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    
    // Horizontal movement
    if (this.cursors.left?.isDown) {
      playerBody.setVelocityX(-200);
    } else if (this.cursors.right?.isDown) {
      playerBody.setVelocityX(200);
    } else {
      playerBody.setVelocityX(0);
    }
    
    // Jumping - only when on ground
    if (this.cursors.up?.isDown && playerBody.touching.down) {
      playerBody.setVelocityY(-500);
    }
  }
}