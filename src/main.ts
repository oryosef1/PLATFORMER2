import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game',
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 980 },
      debug: true
    }
  },
  scene: [BootScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

// Add FPS display
let fpsText: Phaser.GameObjects.Text;
game.events.on('ready', () => {
  const scene = game.scene.getScene('GameScene') as GameScene;
  if (scene) {
    fpsText = scene.add.text(10, 10, 'FPS: 60', {
      fontSize: '16px',
      color: '#ffffff'
    });
    fpsText.setScrollFactor(0);
  }
});

// Update FPS counter
let lastTime = 0;
let frameCount = 0;
let fps = 60;

function updateFPS() {
  frameCount++;
  const currentTime = performance.now();
  
  if (currentTime - lastTime >= 1000) {
    fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
    frameCount = 0;
    lastTime = currentTime;
    
    if (fpsText) {
      fpsText.setText(`FPS: ${fps}`);
    }
  }
  
  requestAnimationFrame(updateFPS);
}

updateFPS();