import { IComponent } from './IComponent';

export interface HitboxData {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  owner: string;
  active: boolean;
  type: string;
  duration?: number;
  knockbackForce?: number;
  criticalChance?: number;
}

export class HitboxComponent implements IComponent {
  public readonly type = 'hitbox';
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public damage: number;
  public owner: string;
  public active: boolean;
  public attackType: string;
  public duration: number;
  public maxDuration: number;
  public knockbackForce: number;
  public criticalChance: number;

  constructor(data: HitboxData) {
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.damage = data.damage;
    this.owner = data.owner;
    this.active = data.active;
    this.attackType = data.type;
    this.duration = data.duration || 8;
    this.maxDuration = this.duration;
    this.knockbackForce = data.knockbackForce || 50;
    this.criticalChance = data.criticalChance || 0;
  }

  public updatePosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public update(): void {
    if (this.active && this.duration > 0) {
      this.duration--;
      if (this.duration <= 0) {
        this.active = false;
        console.log(`[COMBAT] Hitbox deactivated - duration expired`);
      }
    }
  }

  public getAABB(): { x: number; y: number; width: number; height: number } {
    // Convert from center-based coordinates (Phaser) to top-left coordinates (AABB collision)
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
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
      damage: this.damage,
      owner: this.owner,
      active: this.active,
      attackType: this.attackType,
      duration: this.duration,
      maxDuration: this.maxDuration,
      knockbackForce: this.knockbackForce,
      criticalChance: this.criticalChance
    };
  }

  public static deserialize(data: Record<string, any>): HitboxComponent {
    return new HitboxComponent({
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      damage: data.damage,
      owner: data.owner,
      active: data.active,
      type: data.attackType,
      duration: data.duration,
      knockbackForce: data.knockbackForce,
      criticalChance: data.criticalChance
    });
  }
}