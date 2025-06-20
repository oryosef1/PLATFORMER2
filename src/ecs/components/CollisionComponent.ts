import { IComponent } from './IComponent';

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollisionInfo {
  hasCollision: boolean;
  overlapX: number;
  overlapY: number;
  normalX: number;
  normalY: number;
}

export interface SweptCollisionInfo {
  willCollide: boolean;
  timeToCollision: number;
  collisionPoint: { x: number; y: number };
  normalX: number;
  normalY: number;
}

export class CollisionComponent implements IComponent {
  public readonly type = 'collision';
  public width: number;
  public height: number;
  public offsetX: number;
  public offsetY: number;
  public isTrigger: boolean;
  public isStatic: boolean;
  public layer: string;
  public tags: Set<string>;

  constructor(
    width: number,
    height: number,
    offsetX: number = 0,
    offsetY: number = 0,
    isTrigger: boolean = false,
    isStatic: boolean = false,
    layer: string = 'default'
  ) {
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.isTrigger = isTrigger;
    this.isStatic = isStatic;
    this.layer = layer;
    this.tags = new Set();
  }

  public getAABB(x: number, y: number): AABB {
    // Convert from center-point (Phaser) to top-left corner (AABB)
    return {
      x: x - this.width / 2 + this.offsetX,
      y: y - this.height / 2 + this.offsetY,
      width: this.width,
      height: this.height
    };
  }

  public addTag(tag: string): void {
    this.tags.add(tag);
  }

  public removeTag(tag: string): void {
    this.tags.delete(tag);
  }

  public hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  public serialize(): Record<string, any> {
    return {
      type: this.type,
      width: this.width,
      height: this.height,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      isTrigger: this.isTrigger,
      isStatic: this.isStatic,
      layer: this.layer,
      tags: Array.from(this.tags)
    };
  }

  public static deserialize(data: Record<string, any>): CollisionComponent {
    const component = new CollisionComponent(
      data.width,
      data.height,
      data.offsetX,
      data.offsetY,
      data.isTrigger,
      data.isStatic,
      data.layer
    );
    
    if (data.tags) {
      data.tags.forEach((tag: string) => component.addTag(tag));
    }
    
    return component;
  }
}