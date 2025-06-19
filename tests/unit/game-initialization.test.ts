import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Phaser from 'phaser';
import { BootScene } from '../../src/scenes/BootScene';
import { GameScene } from '../../src/scenes/GameScene';

describe('Phase 1.2: Core Game Loop & Visual Output', () => {
  let game: Phaser.Game;

  beforeEach(() => {
    // Clean up any existing game instance
    if (game) {
      game.destroy(true);
    }
  });

  afterEach(() => {
    if (game) {
      game.destroy(true);
    }
  });

  describe('Game Initialization', () => {
    it('should initialize game without errors', () => {
      expect(() => {
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.HEADLESS,
          width: 1024,
          height: 768,
          scene: [BootScene, GameScene],
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 980 },
              debug: false
            }
          }
        };
        game = new Phaser.Game(config);
      }).not.toThrow();
    });

    it('should create canvas with correct dimensions', () => {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.CANVAS,
        width: 1024,
        height: 768,
        parent: 'game',
        scene: [BootScene, GameScene]
      };
      
      game = new Phaser.Game(config);
      
      // Wait for game to initialize
      return new Promise<void>((resolve) => {
        game.events.once('ready', () => {
          expect(game.config.width).toBe(1024);
          expect(game.config.height).toBe(768);
          
          const canvas = document.querySelector('canvas');
          expect(canvas).toBeTruthy();
          expect(canvas?.width).toBe(1024);
          expect(canvas?.height).toBe(768);
          
          resolve();
        });
      });
    });
  });

  describe('Scene Management', () => {
    it('should start with BootScene', () => {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.HEADLESS,
        width: 1024,
        height: 768,
        scene: [BootScene, GameScene]
      };
      
      game = new Phaser.Game(config);
      
      return new Promise<void>((resolve) => {
        game.events.once('ready', () => {
          const bootScene = game.scene.getScene('BootScene');
          expect(bootScene).toBeTruthy();
          expect(bootScene?.scene.isActive()).toBe(true);
          resolve();
        });
      });
    });

    it('should transition to GameScene when SPACE is pressed', () => {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.HEADLESS,
        width: 1024,
        height: 768,
        scene: [BootScene, GameScene]
      };
      
      game = new Phaser.Game(config);
      
      return new Promise<void>((resolve) => {
        game.events.once('ready', () => {
          const bootScene = game.scene.getScene('BootScene') as BootScene;
          
          // Simulate SPACE key press
          const spaceKey = bootScene.input.keyboard?.addKey('SPACE');
          if (spaceKey) {
            bootScene.input.keyboard?.emit('keydown-SPACE');
          }
          
          // Wait a frame for scene transition
          setTimeout(() => {
            const gameScene = game.scene.getScene('GameScene');
            expect(gameScene?.scene.isActive()).toBe(true);
            resolve();
          }, 100);
        });
      });
    });
  });

  describe('Physics System', () => {
    it('should initialize arcade physics with correct gravity', () => {
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
          const gameScene = game.scene.getScene('GameScene') as GameScene;
          expect(gameScene.physics.world.gravity.y).toBe(980);
          resolve();
        });
      });
    });
  });
});