import { IComponent } from './IComponent';

export interface HurtboxData {
  x: number;
  y: number;
  width: number;
  height: number;
  maxHealth: number;
  currentHealth?: number;
  defense?: number;
  owner: string;
  maxInvincibilityFrames?: number;
}

export class HurtboxComponent implements IComponent {
  public readonly type = 'hurtbox';
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public maxHealth: number;
  public currentHealth: number;
  public defense: number;
  public owner: string;
  public invincibilityFrames: number;
  public maxInvincibilityFrames: number;
  public vulnerable: boolean;

  constructor(data: HurtboxData) {
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.maxHealth = data.maxHealth;
    this.currentHealth = data.currentHealth || data.maxHealth;
    this.defense = data.defense || 0;
    this.owner = data.owner;
    this.invincibilityFrames = 0;
    this.maxInvincibilityFrames = data.maxInvincibilityFrames || 30;
    this.vulnerable = true;
  }

  public updatePosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public takeDamage(amount: number): boolean {
    if (!this.vulnerable) {
      console.log(`[COMBAT] Damage blocked - invincible for ${this.invincibilityFrames} frames`);
      return false;
    }

    const actualDamage = Math.max(0, amount - this.defense);
    this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
    
    // Start invincibility frames
    this.invincibilityFrames = this.maxInvincibilityFrames;
    this.vulnerable = false;
    
    console.log(`[COMBAT] Took ${actualDamage} damage, health: ${this.currentHealth}/${this.maxHealth}`);
    
    return actualDamage > 0;
  }

  public heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    console.log(`[COMBAT] Healed ${amount}, health: ${this.currentHealth}/${this.maxHealth}`);
  }

  public update(): void {
    if (this.invincibilityFrames > 0) {
      this.invincibilityFrames--;
      if (this.invincibilityFrames <= 0) {
        this.vulnerable = true;
        console.log('[COMBAT] Invincibility frames expired - vulnerable again');
      }
    }
  }

  public isDead(): boolean {
    return this.currentHealth <= 0;
  }

  public getHealthPercentage(): number {
    return this.maxHealth > 0 ? this.currentHealth / this.maxHealth : 0;
  }

  public getAABB(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  public serialize(): Record<string, any> {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      defense: this.defense,
      owner: this.owner,
      invincibilityFrames: this.invincibilityFrames,
      maxInvincibilityFrames: this.maxInvincibilityFrames,
      vulnerable: this.vulnerable
    };
  }

  public static deserialize(data: Record<string, any>): HurtboxComponent {
    const hurtbox = new HurtboxComponent({
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      maxHealth: data.maxHealth,
      currentHealth: data.currentHealth,
      defense: data.defense,
      owner: data.owner,
      maxInvincibilityFrames: data.maxInvincibilityFrames
    });
    
    hurtbox.invincibilityFrames = data.invincibilityFrames;
    hurtbox.vulnerable = data.vulnerable;
    
    return hurtbox;
  }
}