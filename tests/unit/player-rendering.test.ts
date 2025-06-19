import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Phaser from 'phaser';
import { GameScene } from '../../src/scenes/GameScene';

describe('Phase 1.2: Player Rendering Tests', () => {
  let game: Phaser.Game;
  let gameScene: GameScene;

  beforeEach(() => {
    if (game) {
      game.destroy(true);
    }
  });

  afterEach(() => {
    if (game) {
      game.destroy(true);
    }
  });

  describe('Player Rectangle Rendering', () => {
    it('should create red rectangle player with correct dimensions', () => {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.HEADLESS,
        width: 1024,
        height: 768,
        scene: [GameScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 980 }
          }
        }
      };
      
      game = new Phaser.Game(config);
      
      return new Promise<void>((resolve) => {
        game.events.once('ready', () => {
          gameScene = game.scene.getScene('GameScene') as GameScene;
          
          // Wait for scene to create
          setTimeout(() => {
            // Access the player from the scene
            const player = (gameScene as any).player;
            
            expect(player).toBeTruthy();
            expect(player.width).toBe(32);
            expect(player.height).toBe(48);
            expect(player.fillColor).toBe(0xe74c3c); // Red color
            
            resolve();
          }, 100);
        });
      });
    });

    it('should position player at starting coordinates', () => {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.HEADLESS,
        width: 1024,
        height: 768,
        scene: [GameScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 980 }
          }
        }
      };
      
      game = new Phaser.Game(config);
      
      return new Promise<void>((resolve) => {
        game.events.once('ready', () => {
          gameScene = game.scene.getScene('GameScene') as GameScene;
          
          setTimeout(() => {
            const player = (gameScene as any).player;
            
            expect(player.x).toBe(100);
            expect(player.y).toBe(100);
            
            resolve();
          }, 100);
        });
      });
    });
  });

  describe('Platform Rendering', () => {
    it('should create green platforms with correct properties', () => {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.HEADLESS,
        width: 1024,
        height: 768,
        scene: [GameScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 980 }
          }
        }
      };
      
      game = new Phaser.Game(config);
      
      return new Promise<void>((resolve) => {
        game.events.once('ready', () => {
          gameScene = game.scene.getScene('GameScene') as GameScene;
          
          setTimeout(() => {
            const platforms = (gameScene as any).platforms;
            
            expect(platforms).toBeTruthy();
            expect(platforms.children.entries.length).toBe(3); // Ground + 2 floating platforms
            
            // Check ground platform
            const ground = platforms.children.entries[0];
            expect(ground.width).toBe(1024);
            expect(ground.height).toBe(100);
            expect(ground.fillColor).toBe(0x27ae60); // Green color
            
            resolve();
          }, 100);
        });
      });
    });
  });

  describe('Physics Bodies', () => {
    it('should attach physics bodies to player and platforms', () => {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.HEADLESS,
        width: 1024,
        height: 768,
        scene: [GameScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 980 }
          }
        }
      };
      
      game = new Phaser.Game(config);
      
      return new Promise<void>((resolve) => {
        game.events.once('ready', () => {
          gameScene = game.scene.getScene('GameScene') as GameScene;
          
          setTimeout(() => {
            const player = (gameScene as any).player;
            const platforms = (gameScene as any).platforms;
            
            // Player should have dynamic body
            expect(player.body).toBeTruthy();
            expect(player.body.moves).toBe(true);
            
            // Platforms should have static bodies
            platforms.children.entries.forEach((platform: any) => {
              expect(platform.body).toBeTruthy();
              expect(platform.body.moves).toBe(false); // Static bodies don't move
            });
            
            resolve();
          }, 100);
        });
      });
    });
  });
});