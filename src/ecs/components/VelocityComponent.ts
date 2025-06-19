import { IComponent } from './IComponent';

export class VelocityComponent implements IComponent {
  public readonly type = 'velocity';
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public getMagnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public normalize(): void {
    const magnitude = this.getMagnitude();
    if (magnitude > 0) {
      this.x /= magnitude;
      this.y /= magnitude;
    }
  }

  public scale(factor: number): void {
    this.x *= factor;
    this.y *= factor;
  }

  public add(other: VelocityComponent): void {
    this.x += other.x;
    this.y += other.y;
  }

  public applyFriction(retention: number): void {
    this.x *= retention;
    this.y *= retention;
  }

  public serialize(): Record<string, any> {
    return {
      type: this.type,
      x: this.x,
      y: this.y
    };
  }

  public static deserialize(data: Record<string, any>): VelocityComponent {
    return new VelocityComponent(data.x, data.y);
  }
}