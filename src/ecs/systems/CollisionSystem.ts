import { Entity } from '../Entity';
import { PositionComponent } from '../components/PositionComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { CollisionComponent, AABB, CollisionInfo, SweptCollisionInfo } from '../components/CollisionComponent';

export interface CollisionResult {
  entityA: Entity;
  entityB: Entity;
  collisionInfo: CollisionInfo;
  sweptInfo?: SweptCollisionInfo;
}

export class CollisionSystem {
  private entities: Entity[] = [];
  private spatialHash: SpatialHash;

  constructor(cellSize: number = 64) {
    this.spatialHash = new SpatialHash(cellSize);
  }

  public addEntity(entity: Entity): void {
    if (entity.hasComponent('collision') && entity.hasComponent('position')) {
      this.entities.push(entity);
    }
  }

  public removeEntity(entity: Entity): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }

  public update(deltaTime: number): CollisionResult[] {
    const collisions: CollisionResult[] = [];
    
    // NOTE: Movement is NOT applied here - GameScene handles movement
    // This system only detects collisions based on current positions
    
    // Clear spatial hash and rebuild with new positions
    this.spatialHash.clear();
    
    // Add all entities to spatial hash
    for (const entity of this.entities) {
      const position = entity.getComponent<PositionComponent>('position')!;
      const collision = entity.getComponent<CollisionComponent>('collision')!;
      const aabb = collision.getAABB(position.x, position.y);
      this.spatialHash.insert(aabb, entity);
    }

    // Check collisions for moving entities
    for (const entity of this.entities) {
      const position = entity.getComponent<PositionComponent>('position')!;
      const collision = entity.getComponent<CollisionComponent>('collision')!;
      const velocity = entity.getComponent<VelocityComponent>('velocity');

      if (collision.isStatic && !velocity) {
        continue; // Skip static entities without velocity
      }

      const aabb = collision.getAABB(position.x, position.y);
      const potentialCollisions = this.spatialHash.query(aabb);

      for (const other of potentialCollisions) {
        if (entity === other) continue;

        const otherPosition = other.getComponent<PositionComponent>('position')!;
        const otherCollision = other.getComponent<CollisionComponent>('collision')!;
        const otherAABB = otherCollision.getAABB(otherPosition.x, otherPosition.y);

        // Check basic AABB intersection
        const collisionInfo = this.getCollisionInfo(aabb, otherAABB);
        
        if (collisionInfo.hasCollision) {
          let sweptInfo: SweptCollisionInfo | undefined;
          
          // If entity has velocity, calculate swept collision
          if (velocity && (velocity.x !== 0 || velocity.y !== 0)) {
            sweptInfo = this.sweptAABB(aabb, velocity.x, velocity.y, otherAABB, deltaTime);
          }

          collisions.push({
            entityA: entity,
            entityB: other,
            collisionInfo,
            sweptInfo
          });
        }
      }
    }

    return collisions;
  }

  public aabbIntersects(a: AABB, b: AABB): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  public getCollisionInfo(a: AABB, b: AABB): CollisionInfo {
    if (!this.aabbIntersects(a, b)) {
      return {
        hasCollision: false,
        overlapX: 0,
        overlapY: 0,
        normalX: 0,
        normalY: 0
      };
    }

    const overlapX = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);
    const overlapY = Math.min(a.y + a.height - b.y, b.y + b.height - a.y);

    // Determine collision normal based on minimum overlap with better threshold
    let normalX = 0;
    let normalY = 0;

    // Add small threshold to prevent equal overlap issues
    const threshold = 0.1;
    
    if (overlapX < overlapY - threshold) {
      // Horizontal collision (clearly less overlap in X direction)
      normalX = (a.x + a.width / 2) < (b.x + b.width / 2) ? -1 : 1;
      // console.log(`[COLLISION] Horizontal collision detected - normalX: ${normalX}, overlapX: ${overlapX.toFixed(1)}, overlapY: ${overlapY.toFixed(1)}`);
    } else if (overlapY < overlapX - threshold) {
      // Vertical collision (clearly less overlap in Y direction)  
      normalY = (a.y + a.height / 2) < (b.y + b.height / 2) ? -1 : 1;
      // console.log(`[COLLISION] Vertical collision detected - normalY: ${normalY}, overlapX: ${overlapX.toFixed(1)}, overlapY: ${overlapY.toFixed(1)}`);
    } else {
      // Ambiguous case - use velocity to determine collision type
      // This is important for wall sliding where overlaps might be similar
      const centerAX = a.x + a.width / 2;
      const centerAY = a.y + a.height / 2;
      const centerBX = b.x + b.width / 2;
      const centerBY = b.y + b.height / 2;
      
      const deltaX = Math.abs(centerAX - centerBX);
      const deltaY = Math.abs(centerAY - centerBY);
      
      if (deltaX > deltaY) {
        // Centers are more separated horizontally - likely side collision
        normalX = centerAX < centerBX ? -1 : 1;
        // console.log(`[COLLISION] Ambiguous resolved as horizontal - normalX: ${normalX}, deltaX: ${deltaX.toFixed(1)}, deltaY: ${deltaY.toFixed(1)}`);
      } else {
        // Centers are more separated vertically - likely top/bottom collision
        normalY = centerAY < centerBY ? -1 : 1;
        // console.log(`[COLLISION] Ambiguous resolved as vertical - normalY: ${normalY}, deltaX: ${deltaX.toFixed(1)}, deltaY: ${deltaY.toFixed(1)}`);
      }
    }

    return {
      hasCollision: true,
      overlapX,
      overlapY,
      normalX,
      normalY
    };
  }

  public sweptAABB(a: AABB, velocityX: number, velocityY: number, b: AABB, deltaTime: number): SweptCollisionInfo {
    // Handle zero velocity
    if (velocityX === 0 && velocityY === 0) {
      return {
        willCollide: false,
        timeToCollision: 1,
        collisionPoint: { x: a.x + a.width / 2, y: a.y + a.height / 2 },
        normalX: 0,
        normalY: 0
      };
    }

    // Expand b by a's dimensions for point-to-box collision test
    const expandedB: AABB = {
      x: b.x - a.width / 2,
      y: b.y - a.height / 2,
      width: b.width + a.width,
      height: b.height + a.height
    };

    // Ray from center of a
    const rayX = a.x + a.width / 2;
    const rayY = a.y + a.height / 2;
    const rayEndX = rayX + velocityX * deltaTime;
    const rayEndY = rayY + velocityY * deltaTime;

    // Avoid division by zero
    const invDirX = (rayEndX - rayX) === 0 ? 0 : 1 / (rayEndX - rayX);
    const invDirY = (rayEndY - rayY) === 0 ? 0 : 1 / (rayEndY - rayY);

    // Calculate intersection times
    let tMinX, tMaxX, tMinY, tMaxY;

    if (invDirX === 0) {
      // Ray is parallel to X axis
      if (rayX < expandedB.x || rayX > expandedB.x + expandedB.width) {
        return {
          willCollide: false,
          timeToCollision: 1,
          collisionPoint: { x: rayEndX, y: rayEndY },
          normalX: 0,
          normalY: 0
        };
      }
      tMinX = -Infinity;
      tMaxX = Infinity;
    } else {
      tMinX = (expandedB.x - rayX) * invDirX;
      tMaxX = (expandedB.x + expandedB.width - rayX) * invDirX;
      if (tMinX > tMaxX) [tMinX, tMaxX] = [tMaxX, tMinX];
    }

    if (invDirY === 0) {
      // Ray is parallel to Y axis
      if (rayY < expandedB.y || rayY > expandedB.y + expandedB.height) {
        return {
          willCollide: false,
          timeToCollision: 1,
          collisionPoint: { x: rayEndX, y: rayEndY },
          normalX: 0,
          normalY: 0
        };
      }
      tMinY = -Infinity;
      tMaxY = Infinity;
    } else {
      tMinY = (expandedB.y - rayY) * invDirY;
      tMaxY = (expandedB.y + expandedB.height - rayY) * invDirY;
      if (tMinY > tMaxY) [tMinY, tMaxY] = [tMaxY, tMinY];
    }

    const tMin = Math.max(tMinX, tMinY);
    const tMax = Math.min(tMaxX, tMaxY);

    const willCollide = tMax >= 0 && tMin <= tMax && tMin <= 1;
    const timeToCollision = willCollide ? Math.max(0, tMin) : 1;

    const collisionPoint = willCollide ? {
      x: rayX + (rayEndX - rayX) * timeToCollision,
      y: rayY + (rayEndY - rayY) * timeToCollision
    } : { x: rayEndX, y: rayEndY };

    // Calculate normal at collision point
    let normalX = 0;
    let normalY = 0;
    if (willCollide) {
      const centerToCollisionX = collisionPoint.x - (b.x + b.width / 2);
      const centerToCollisionY = collisionPoint.y - (b.y + b.height / 2);
      
      if (Math.abs(centerToCollisionX) > Math.abs(centerToCollisionY)) {
        normalX = centerToCollisionX > 0 ? 1 : -1;
      } else {
        normalY = centerToCollisionY > 0 ? 1 : -1;
      }
    }

    return {
      willCollide,
      timeToCollision,
      collisionPoint,
      normalX,
      normalY
    };
  }

  // NOTE: Collision resolution is now handled in GameScene for simplicity
  // These methods are kept for potential future use but not currently used
}

class SpatialHash {
  private cellSize: number;
  private grid: Map<string, Array<{ aabb: AABB; entity: Entity }>>;

  constructor(cellSize: number = 64) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private getGridCells(aabb: AABB): string[] {
    const cells: string[] = [];
    const startX = Math.floor(aabb.x / this.cellSize);
    const startY = Math.floor(aabb.y / this.cellSize);
    const endX = Math.floor((aabb.x + aabb.width) / this.cellSize);
    const endY = Math.floor((aabb.y + aabb.height) / this.cellSize);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        cells.push(`${x},${y}`);
      }
    }
    return cells;
  }

  public insert(aabb: AABB, entity: Entity): void {
    const cells = this.getGridCells(aabb);
    const item = { aabb, entity };

    cells.forEach(cell => {
      if (!this.grid.has(cell)) {
        this.grid.set(cell, []);
      }
      this.grid.get(cell)!.push(item);
    });
  }

  public query(aabb: AABB): Entity[] {
    const potentialCollisions: Entity[] = [];
    const cells = this.getGridCells(aabb);
    const seen = new Set<Entity>();

    cells.forEach(cell => {
      const cellItems = this.grid.get(cell) || [];
      cellItems.forEach(item => {
        if (!seen.has(item.entity)) {
          seen.add(item.entity);
          potentialCollisions.push(item.entity);
        }
      });
    });

    return potentialCollisions;
  }

  public clear(): void {
    this.grid.clear();
  }

  public getCellCount(): number {
    return this.grid.size;
  }
}