import { IComponent } from './IComponent';

export class PositionComponent implements IComponent {
  public readonly type = 'position';
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public distanceTo(other: PositionComponent): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public clone(): PositionComponent {
    return new PositionComponent(this.x, this.y);
  }

  public serialize(): Record<string, any> {
    return {
      type: this.type,
      x: this.x,
      y: this.y
    };
  }

  public static deserialize(data: Record<string, any>): PositionComponent {
    return new PositionComponent(data.x, data.y);
  }
}