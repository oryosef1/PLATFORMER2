import { Entity } from '../ecs/Entity';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { CollisionComponent } from '../ecs/components/CollisionComponent';

export class PlatformEntity extends Entity {
  constructor(x: number, y: number, width: number, height: number) {
    super();
    
    // Add required components
    this.addComponent('position', new PositionComponent(x, y));
    this.addComponent('collision', new CollisionComponent(
      width,
      height,
      0, // offsetX
      0, // offsetY
      false, // isTrigger
      true, // isStatic (platforms don't move)
      'platform' // layer
    ));
    
    console.log(`[PLATFORM] Created platform at (${x}, ${y}) with size (${width}x${height})`);
  }

  public getVisual() {
    const position = this.getComponent<PositionComponent>('position')!;
    const collision = this.getComponent<CollisionComponent>('collision')!;
    
    return {
      x: position.x,
      y: position.y,
      width: collision.width,
      height: collision.height
    };
  }
}