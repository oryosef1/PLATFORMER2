import { Entity } from '../ecs/Entity';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { VelocityComponent } from '../ecs/components/VelocityComponent';
import { CollisionComponent } from '../ecs/components/CollisionComponent';
import { HurtboxComponent } from '../ecs/components/HurtboxComponent';

export interface EnemyVisual {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class TestEnemyEntity extends Entity {
  private visual: EnemyVisual;
  private damageFlashFrames: number = 0;
  
  constructor(x: number = 400, y: number = 300, width: number = 32, height: number = 32) {
    super();
    console.log(`[ENEMY] Creating test enemy entity at (${x}, ${y})`);
    
    // Add required components
    this.addComponent('position', new PositionComponent(x, y));
    this.addComponent('velocity', new VelocityComponent(0, 0));
    this.addComponent('collision', new CollisionComponent(
      width,
      height,
      0, // offsetX
      0, // offsetY
      false, // isTrigger
      false, // isStatic (allow enemy to be pushed by collisions)
      'enemy' // layer
    ));
    
    // Add combat component (hurtbox for taking damage)
    // Hurtbox should exactly match the visual rectangle position
    // Since Phaser rectangles are centered, we need to match that
    this.addComponent('hurtbox', new HurtboxComponent({
      x: x, // Use same position as visual (Phaser rectangles are centered)
      y: y,
      width: width,
      height: height,
      maxHealth: 50,
      defense: 0,
      owner: this.id,
      maxInvincibilityFrames: 15 // Shorter invincibility for enemies
    }));
    
    // Create visual representation
    this.visual = {
      x: x,
      y: y,
      width: width,
      height: height
    };
    
    console.log('[ENEMY] Test enemy entity created with components:', Array.from(this.components.keys()));
  }

  public getVisual(): EnemyVisual {
    return this.visual;
  }

  public updateVisualPosition(): void {
    const position = this.getComponent('position') as PositionComponent;
    this.visual.x = position.x;
    this.visual.y = position.y;
  }

  public update(deltaTime: number): void {
    // Update visual position
    this.updateVisualPosition();
    
    // Update hurtbox position to match entity position exactly
    const position = this.getComponent('position') as PositionComponent;
    const hurtbox = this.getComponent<HurtboxComponent>('hurtbox');
    if (position && hurtbox) {
      hurtbox.updatePosition(position.x, position.y);
    }
    
    // Update damage flash effect
    if (this.damageFlashFrames > 0) {
      this.damageFlashFrames--;
    }
  }
  
  public startDamageFlash(): void {
    this.damageFlashFrames = 10; // Flash for 10 frames
    console.log('[ENEMY] Damage flash started');
  }
  
  public isDamageFlashing(): boolean {
    return this.damageFlashFrames > 0;
  }
  
  // Combat System Methods
  
  public getCurrentHealth(): number {
    const hurtbox = this.getComponent<HurtboxComponent>('hurtbox');
    return hurtbox ? hurtbox.currentHealth : 0;
  }
  
  public getMaxHealth(): number {
    const hurtbox = this.getComponent<HurtboxComponent>('hurtbox');
    return hurtbox ? hurtbox.maxHealth : 0;
  }
  
  public getHealthPercentage(): number {
    const hurtbox = this.getComponent<HurtboxComponent>('hurtbox');
    return hurtbox ? hurtbox.getHealthPercentage() : 0;
  }
  
  public isDead(): boolean {
    const hurtbox = this.getComponent<HurtboxComponent>('hurtbox');
    return hurtbox ? hurtbox.isDead() : false;
  }
  
  public isVulnerable(): boolean {
    const hurtbox = this.getComponent<HurtboxComponent>('hurtbox');
    return hurtbox ? hurtbox.vulnerable : true;
  }
  
  public heal(amount: number): void {
    const hurtbox = this.getComponent<HurtboxComponent>('hurtbox');
    if (hurtbox) {
      hurtbox.heal(amount);
    }
  }

  public getDebugInfo(): Record<string, any> {
    const position = this.getComponent('position') as PositionComponent;
    const hurtbox = this.getComponent<HurtboxComponent>('hurtbox');
    
    return {
      position: { x: position.x, y: position.y },
      combat: {
        health: hurtbox ? hurtbox.currentHealth : 0,
        maxHealth: hurtbox ? hurtbox.maxHealth : 0,
        vulnerable: hurtbox ? hurtbox.vulnerable : true,
        invincibilityFrames: hurtbox ? hurtbox.invincibilityFrames : 0,
        defense: hurtbox ? hurtbox.defense : 0
      }
    };
  }
}