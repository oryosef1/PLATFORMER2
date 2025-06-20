import { Entity } from '../ecs/Entity';
import { PositionComponent } from '../ecs/components/PositionComponent';
import { CollisionComponent, AABB } from '../ecs/components/CollisionComponent';
import { CollisionResult } from '../ecs/systems/CollisionSystem';

export class DebugCollision {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private enabled: boolean = false;
  private showAABBs: boolean = true;
  private showCollisions: boolean = true;
  private showSpatialGrid: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(1000); // Render on top
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.graphics.setVisible(enabled);
  }

  public toggleAABBs(): void {
    this.showAABBs = !this.showAABBs;
  }

  public toggleCollisions(): void {
    this.showCollisions = !this.showCollisions;
  }

  public toggleSpatialGrid(): void {
    this.showSpatialGrid = !this.showSpatialGrid;
  }

  public update(entities: Entity[], collisions: CollisionResult[], cellSize: number = 64): void {
    if (!this.enabled) return;

    this.graphics.clear();

    // Draw spatial grid if enabled
    if (this.showSpatialGrid) {
      this.drawSpatialGrid(cellSize);
    }

    // Draw entity AABBs
    if (this.showAABBs) {
      this.drawEntityAABBs(entities);
    }

    // Draw collision highlights
    if (this.showCollisions) {
      this.drawCollisions(collisions);
    }
  }

  private drawSpatialGrid(cellSize: number): void {
    const camera = this.scene.cameras.main;
    const worldView = camera.worldView;

    // Calculate grid bounds based on camera view
    const startX = Math.floor(worldView.x / cellSize) * cellSize;
    const startY = Math.floor(worldView.y / cellSize) * cellSize;
    const endX = Math.ceil((worldView.x + worldView.width) / cellSize) * cellSize;
    const endY = Math.ceil((worldView.y + worldView.height) / cellSize) * cellSize;

    this.graphics.lineStyle(1, 0x333333, 0.3);

    // Draw vertical lines
    for (let x = startX; x <= endX; x += cellSize) {
      this.graphics.moveTo(x, startY);
      this.graphics.lineTo(x, endY);
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += cellSize) {
      this.graphics.moveTo(startX, y);
      this.graphics.lineTo(endX, y);
    }

    this.graphics.strokePath();
  }

  private drawEntityAABBs(entities: Entity[]): void {
    for (const entity of entities) {
      const position = entity.getComponent<PositionComponent>('position');
      const collision = entity.getComponent<CollisionComponent>('collision');

      if (!position || !collision) continue;

      const aabb = collision.getAABB(position.x, position.y);
      
      // Choose color based on entity properties
      let color = 0x00ff00; // Green for normal entities
      let alpha = 0.3;

      if (collision.isStatic) {
        color = 0x0000ff; // Blue for static entities
      }
      if (collision.isTrigger) {
        color = 0xffff00; // Yellow for triggers
        alpha = 0.2;
      }

      this.graphics.lineStyle(2, color, 0.8);
      this.graphics.fillStyle(color, alpha);
      this.graphics.fillRect(aabb.x, aabb.y, aabb.width, aabb.height);
      this.graphics.strokeRect(aabb.x, aabb.y, aabb.width, aabb.height);
    }
  }

  private drawCollisions(collisions: CollisionResult[]): void {
    for (const collision of collisions) {
      const positionA = collision.entityA.getComponent<PositionComponent>('position')!;
      const collisionA = collision.entityA.getComponent<CollisionComponent>('collision')!;
      const aabbA = collisionA.getAABB(positionA.x, positionA.y);

      const positionB = collision.entityB.getComponent<PositionComponent>('position')!;
      const collisionB = collision.entityB.getComponent<CollisionComponent>('collision')!;
      const aabbB = collisionB.getAABB(positionB.x, positionB.y);

      // Highlight colliding AABBs in red
      this.graphics.lineStyle(3, 0xff0000, 1.0);
      this.graphics.fillStyle(0xff0000, 0.2);
      
      this.graphics.fillRect(aabbA.x, aabbA.y, aabbA.width, aabbA.height);
      this.graphics.strokeRect(aabbA.x, aabbA.y, aabbA.width, aabbA.height);
      
      this.graphics.fillRect(aabbB.x, aabbB.y, aabbB.width, aabbB.height);
      this.graphics.strokeRect(aabbB.x, aabbB.y, aabbB.width, aabbB.height);

      // Draw collision normal
      if (collision.collisionInfo.hasCollision) {
        const centerA = {
          x: aabbA.x + aabbA.width / 2,
          y: aabbA.y + aabbA.height / 2
        };

        const normalLength = 30;
        const normalEndX = centerA.x + collision.collisionInfo.normalX * normalLength;
        const normalEndY = centerA.y + collision.collisionInfo.normalY * normalLength;

        this.graphics.lineStyle(2, 0xff0000, 1.0);
        this.graphics.moveTo(centerA.x, centerA.y);
        this.graphics.lineTo(normalEndX, normalEndY);
        this.graphics.strokePath();

        // Draw arrow head
        const arrowSize = 8;
        const angle = Math.atan2(collision.collisionInfo.normalY, collision.collisionInfo.normalX);
        
        this.graphics.moveTo(normalEndX, normalEndY);
        this.graphics.lineTo(
          normalEndX - arrowSize * Math.cos(angle - Math.PI / 6),
          normalEndY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        this.graphics.moveTo(normalEndX, normalEndY);
        this.graphics.lineTo(
          normalEndX - arrowSize * Math.cos(angle + Math.PI / 6),
          normalEndY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        this.graphics.strokePath();
      }

      // Draw swept collision information if available
      if (collision.sweptInfo && collision.sweptInfo.willCollide) {
        this.graphics.lineStyle(2, 0xffa500, 0.8); // Orange for swept collision
        this.graphics.fillStyle(0xffa500, 0.8);
        
        // Draw collision point
        const point = collision.sweptInfo.collisionPoint;
        this.graphics.fillCircle(point.x, point.y, 4);
      }
    }
  }

  public destroy(): void {
    if (this.graphics) {
      this.graphics.destroy();
    }
  }
}