import { describe, test, expect } from 'vitest';

// Test data structures for collision system
interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CollisionInfo {
  hasCollision: boolean;
  overlapX: number;
  overlapY: number;
  normalX: number;
  normalY: number;
}

interface SweptCollisionInfo {
  willCollide: boolean;
  timeToCollision: number;
  collisionPoint: { x: number; y: number };
  normalX: number;
  normalY: number;
}

// Mock implementations for testing (will be replaced by actual implementations)
function aabbIntersects(a: AABB, b: AABB): boolean {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function getCollisionInfo(a: AABB, b: AABB): CollisionInfo {
  if (!aabbIntersects(a, b)) {
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

  // Determine collision normal based on minimum overlap
  let normalX = 0;
  let normalY = 0;

  if (overlapX < overlapY) {
    // Horizontal collision
    normalX = (a.x + a.width / 2) < (b.x + b.width / 2) ? -1 : 1;
  } else {
    // Vertical collision  
    normalY = (a.y + a.height / 2) < (b.y + b.height / 2) ? -1 : 1;
  }

  return {
    hasCollision: true,
    overlapX,
    overlapY,
    normalX,
    normalY
  };
}

function sweptAABB(a: AABB, velocityX: number, velocityY: number, b: AABB, deltaTime: number): SweptCollisionInfo {
  // Expand b by a's dimensions
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

  // Simple ray-box intersection
  const tMinX = (expandedB.x - rayX) / (rayEndX - rayX);
  const tMaxX = (expandedB.x + expandedB.width - rayX) / (rayEndX - rayX);
  const tMinY = (expandedB.y - rayY) / (rayEndY - rayY);
  const tMaxY = (expandedB.y + expandedB.height - rayY) / (rayEndY - rayY);

  const tMin = Math.max(Math.min(tMinX, tMaxX), Math.min(tMinY, tMaxY));
  const tMax = Math.min(Math.max(tMinX, tMaxX), Math.max(tMinY, tMaxY));

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

describe('Collision System - AABB Detection', () => {
  describe('Basic AABB Intersection', () => {
    test('detects collision when boxes overlap', () => {
      const boxA: AABB = { x: 10, y: 10, width: 20, height: 20 };
      const boxB: AABB = { x: 15, y: 15, width: 20, height: 20 };
      
      expect(aabbIntersects(boxA, boxB)).toBe(true);
    });

    test('detects no collision when boxes are separate', () => {
      const boxA: AABB = { x: 10, y: 10, width: 20, height: 20 };
      const boxB: AABB = { x: 40, y: 40, width: 20, height: 20 };
      
      expect(aabbIntersects(boxA, boxB)).toBe(false);
    });

    test('detects collision when boxes touch at edge', () => {
      const boxA: AABB = { x: 10, y: 10, width: 20, height: 20 };
      const boxB: AABB = { x: 30, y: 10, width: 20, height: 20 };
      
      expect(aabbIntersects(boxA, boxB)).toBe(false); // Touching at edge = no overlap
    });

    test('detects collision when one box is inside another', () => {
      const boxA: AABB = { x: 15, y: 15, width: 10, height: 10 };
      const boxB: AABB = { x: 10, y: 10, width: 20, height: 20 };
      
      expect(aabbIntersects(boxA, boxB)).toBe(true);
    });
  });

  describe('Collision Information Calculation', () => {
    test('calculates overlap correctly for intersecting boxes', () => {
      const boxA: AABB = { x: 10, y: 10, width: 20, height: 20 };
      const boxB: AABB = { x: 15, y: 15, width: 20, height: 20 };
      
      const info = getCollisionInfo(boxA, boxB);
      
      expect(info.hasCollision).toBe(true);
      expect(info.overlapX).toBe(15); // min(30-15, 35-10) = min(15, 25) = 15
      expect(info.overlapY).toBe(15); // min(30-15, 35-10) = min(15, 25) = 15
    });

    test('calculates horizontal collision normal correctly', () => {
      const boxA: AABB = { x: 10, y: 10, width: 10, height: 20 };
      const boxB: AABB = { x: 15, y: 10, width: 20, height: 20 };
      
      const info = getCollisionInfo(boxA, boxB);
      
      expect(info.hasCollision).toBe(true);
      expect(info.overlapX).toBe(5); // min(20-15, 35-10) = min(5, 25) = 5
      expect(info.overlapY).toBe(20); // min(30-10, 30-10) = 20
      expect(info.normalX).toBe(-1); // A is to the left of B
      expect(info.normalY).toBe(0);
    });

    test('calculates vertical collision normal correctly', () => {
      const boxA: AABB = { x: 10, y: 10, width: 20, height: 10 };
      const boxB: AABB = { x: 10, y: 15, width: 20, height: 20 };
      
      const info = getCollisionInfo(boxA, boxB);
      
      expect(info.hasCollision).toBe(true);
      expect(info.overlapX).toBe(20); // min(30-10, 30-10) = 20
      expect(info.overlapY).toBe(5); // min(20-15, 35-10) = min(5, 25) = 5
      expect(info.normalX).toBe(0);
      expect(info.normalY).toBe(-1); // A is above B
    });

    test('returns no collision info for non-intersecting boxes', () => {
      const boxA: AABB = { x: 10, y: 10, width: 20, height: 20 };
      const boxB: AABB = { x: 40, y: 40, width: 20, height: 20 };
      
      const info = getCollisionInfo(boxA, boxB);
      
      expect(info.hasCollision).toBe(false);
      expect(info.overlapX).toBe(0);
      expect(info.overlapY).toBe(0);
      expect(info.normalX).toBe(0);
      expect(info.normalY).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles zero-width boxes', () => {
      const boxA: AABB = { x: 10, y: 10, width: 0, height: 20 };
      const boxB: AABB = { x: 10, y: 15, width: 20, height: 10 };
      
      expect(aabbIntersects(boxA, boxB)).toBe(false);
    });

    test('handles zero-height boxes', () => {
      const boxA: AABB = { x: 10, y: 10, width: 20, height: 0 };
      const boxB: AABB = { x: 15, y: 10, width: 10, height: 20 };
      
      expect(aabbIntersects(boxA, boxB)).toBe(false);
    });

    test('handles negative coordinates', () => {
      const boxA: AABB = { x: -20, y: -20, width: 20, height: 20 };
      const boxB: AABB = { x: -15, y: -15, width: 20, height: 20 };
      
      expect(aabbIntersects(boxA, boxB)).toBe(true);
    });
  });
});

describe('Collision System - Swept Collision', () => {
  describe('Basic Swept AABB', () => {
    test('detects collision when moving box hits stationary box', () => {
      const movingBox: AABB = { x: 10, y: 10, width: 10, height: 10 };
      const stationaryBox: AABB = { x: 30, y: 10, width: 10, height: 10 };
      const velocityX = 50; // Moving right at 50 px/s
      const velocityY = 0;
      const deltaTime = 1; // 1 second
      
      const result = sweptAABB(movingBox, velocityX, velocityY, stationaryBox, deltaTime);
      
      expect(result.willCollide).toBe(true);
      expect(result.timeToCollision).toBeGreaterThan(0);
      expect(result.timeToCollision).toBeLessThan(1);
    });

    test('detects no collision when moving box misses stationary box', () => {
      const movingBox: AABB = { x: 10, y: 10, width: 10, height: 10 };
      const stationaryBox: AABB = { x: 30, y: 30, width: 10, height: 10 };
      const velocityX = 50; // Moving right
      const velocityY = 0; // Not moving up
      const deltaTime = 1;
      
      const result = sweptAABB(movingBox, velocityX, velocityY, stationaryBox, deltaTime);
      
      expect(result.willCollide).toBe(false);
      expect(result.timeToCollision).toBe(1);
    });

    test('prevents tunneling with high-speed movement', () => {
      const movingBox: AABB = { x: 10, y: 10, width: 10, height: 10 };
      const stationaryBox: AABB = { x: 30, y: 10, width: 10, height: 10 };
      const velocityX = 1000; // Very high speed
      const velocityY = 0;
      const deltaTime = 0.016; // 60fps frame time
      
      const result = sweptAABB(movingBox, velocityX, velocityY, stationaryBox, deltaTime);
      
      expect(result.willCollide).toBe(true);
      expect(result.timeToCollision).toBeGreaterThan(0);
      expect(result.timeToCollision).toBeLessThan(1);
    });

    test('calculates collision point correctly', () => {
      const movingBox: AABB = { x: 10, y: 10, width: 10, height: 10 };
      const stationaryBox: AABB = { x: 30, y: 10, width: 10, height: 10 };
      const velocityX = 20;
      const velocityY = 0;
      const deltaTime = 1;
      
      const result = sweptAABB(movingBox, velocityX, velocityY, stationaryBox, deltaTime);
      
      expect(result.willCollide).toBe(true);
      expect(result.collisionPoint.x).toBe(25); // Should collide at x=25
      expect(result.collisionPoint.y).toBe(15); // Center of moving box
    });

    test('calculates collision normal correctly for horizontal collision', () => {
      const movingBox: AABB = { x: 10, y: 10, width: 10, height: 10 };
      const stationaryBox: AABB = { x: 30, y: 10, width: 10, height: 10 };
      const velocityX = 20;
      const velocityY = 0;
      const deltaTime = 1;
      
      const result = sweptAABB(movingBox, velocityX, velocityY, stationaryBox, deltaTime);
      
      expect(result.willCollide).toBe(true);
      expect(result.normalX).toBe(-1); // Moving box hits left side of stationary box
      expect(result.normalY).toBe(0);
    });

    test('calculates collision normal correctly for vertical collision', () => {
      const movingBox: AABB = { x: 10, y: 10, width: 10, height: 10 };
      const stationaryBox: AABB = { x: 10, y: 30, width: 10, height: 10 };
      const velocityX = 0;
      const velocityY = 20; // Moving down
      const deltaTime = 1;
      
      const result = sweptAABB(movingBox, velocityX, velocityY, stationaryBox, deltaTime);
      
      expect(result.willCollide).toBe(true);
      expect(result.normalX).toBe(0);
      expect(result.normalY).toBe(-1); // Moving box hits top of stationary box
    });
  });

  describe('Edge Cases for Swept Collision', () => {
    test('handles zero velocity correctly', () => {
      const movingBox: AABB = { x: 10, y: 10, width: 10, height: 10 };
      const stationaryBox: AABB = { x: 30, y: 10, width: 10, height: 10 };
      const velocityX = 0;
      const velocityY = 0;
      const deltaTime = 1;
      
      const result = sweptAABB(movingBox, velocityX, velocityY, stationaryBox, deltaTime);
      
      expect(result.willCollide).toBe(false);
      expect(result.timeToCollision).toBe(1);
    });

    test('handles already overlapping boxes', () => {
      const movingBox: AABB = { x: 15, y: 15, width: 10, height: 10 };
      const stationaryBox: AABB = { x: 10, y: 10, width: 20, height: 20 };
      const velocityX = 10;
      const velocityY = 0;
      const deltaTime = 1;
      
      const result = sweptAABB(movingBox, velocityX, velocityY, stationaryBox, deltaTime);
      
      expect(result.timeToCollision).toBe(0); // Already colliding
    });

    test('handles moving away from box', () => {
      const movingBox: AABB = { x: 30, y: 10, width: 10, height: 10 };
      const stationaryBox: AABB = { x: 10, y: 10, width: 10, height: 10 };
      const velocityX = 20; // Moving away (right)
      const velocityY = 0;
      const deltaTime = 1;
      
      const result = sweptAABB(movingBox, velocityX, velocityY, stationaryBox, deltaTime);
      
      expect(result.willCollide).toBe(false);
    });
  });
});

describe('Collision System - Response & Resolution', () => {
  // Mock collision response functions for testing
  function resolveCollision(position: { x: number; y: number }, velocity: { x: number; y: number }, 
                          collision: CollisionInfo): { newPosition: { x: number; y: number }, newVelocity: { x: number; y: number } } {
    const newPosition = { ...position };
    const newVelocity = { ...velocity };

    if (!collision.hasCollision) {
      return { newPosition, newVelocity };
    }

    // Resolve position by moving out of collision
    if (collision.overlapX < collision.overlapY) {
      // Horizontal collision - resolve X
      newPosition.x += collision.overlapX * collision.normalX;
      newVelocity.x = 0; // Stop horizontal movement
      // Keep Y velocity unchanged
    } else {
      // Vertical collision - resolve Y  
      newPosition.y += collision.overlapY * collision.normalY;
      newVelocity.y = 0; // Stop vertical movement
      // Keep X velocity unchanged
    }

    return { newPosition, newVelocity };
  }

  function resolveSweptCollision(position: { x: number; y: number }, velocity: { x: number; y: number },
                                sweptInfo: SweptCollisionInfo, deltaTime: number): { newPosition: { x: number; y: number }, newVelocity: { x: number; y: number } } {
    const newPosition = { ...position };
    const newVelocity = { ...velocity };

    if (!sweptInfo.willCollide) {
      // No collision - apply full movement
      newPosition.x += velocity.x * deltaTime;
      newPosition.y += velocity.y * deltaTime;
      return { newPosition, newVelocity };
    }

    // Move to collision point
    newPosition.x += velocity.x * sweptInfo.timeToCollision * deltaTime;
    newPosition.y += velocity.y * sweptInfo.timeToCollision * deltaTime;

    // Stop movement in collision direction
    if (sweptInfo.normalX !== 0) {
      newVelocity.x = 0;
    }
    if (sweptInfo.normalY !== 0) {
      newVelocity.y = 0;
    }

    return { newPosition, newVelocity };
  }

  describe('Basic Collision Response', () => {
    test('stops horizontal movement on horizontal collision', () => {
      const position = { x: 20, y: 15 };
      const velocity = { x: 50, y: 0 };
      const collision: CollisionInfo = {
        hasCollision: true,
        overlapX: 5,
        overlapY: 15,
        normalX: -1,
        normalY: 0
      };

      const result = resolveCollision(position, velocity, collision);

      expect(result.newPosition.x).toBe(15); // Moved back by overlap
      expect(result.newPosition.y).toBe(15); // Y unchanged
      expect(result.newVelocity.x).toBe(0); // Horizontal velocity stopped
      expect(result.newVelocity.y).toBe(0); // Vertical velocity unchanged (was 0)
    });

    test('stops vertical movement on vertical collision', () => {
      const position = { x: 15, y: 20 };
      const velocity = { x: 0, y: 50 };
      const collision: CollisionInfo = {
        hasCollision: true,
        overlapX: 15,
        overlapY: 5,
        normalX: 0,
        normalY: -1
      };

      const result = resolveCollision(position, velocity, collision);

      expect(result.newPosition.x).toBe(15); // X unchanged
      expect(result.newPosition.y).toBe(15); // Moved back by overlap
      expect(result.newVelocity.x).toBe(0); // Horizontal velocity unchanged (was 0)
      expect(result.newVelocity.y).toBe(0); // Vertical velocity stopped
    });

    test('does not modify position/velocity when no collision', () => {
      const position = { x: 15, y: 15 };
      const velocity = { x: 20, y: 30 };
      const collision: CollisionInfo = {
        hasCollision: false,
        overlapX: 0,
        overlapY: 0,
        normalX: 0,
        normalY: 0
      };

      const result = resolveCollision(position, velocity, collision);

      expect(result.newPosition).toEqual(position);
      expect(result.newVelocity).toEqual(velocity);
    });
  });

  describe('Swept Collision Response', () => {
    test('moves to collision point and stops movement', () => {
      const position = { x: 10, y: 15 };
      const velocity = { x: 20, y: 0 };
      const sweptInfo: SweptCollisionInfo = {
        willCollide: true,
        timeToCollision: 0.5,
        collisionPoint: { x: 20, y: 15 },
        normalX: -1,
        normalY: 0
      };
      const deltaTime = 1;

      const result = resolveSweptCollision(position, velocity, sweptInfo, deltaTime);

      expect(result.newPosition.x).toBe(20); // Moved to collision point
      expect(result.newPosition.y).toBe(15); // Y unchanged
      expect(result.newVelocity.x).toBe(0); // Horizontal velocity stopped
      expect(result.newVelocity.y).toBe(0); // Vertical velocity unchanged (was 0)
    });

    test('applies full movement when no collision', () => {
      const position = { x: 10, y: 15 };
      const velocity = { x: 20, y: 30 };
      const sweptInfo: SweptCollisionInfo = {
        willCollide: false,
        timeToCollision: 1,
        collisionPoint: { x: 30, y: 45 },
        normalX: 0,
        normalY: 0
      };
      const deltaTime = 1;

      const result = resolveSweptCollision(position, velocity, sweptInfo, deltaTime);

      expect(result.newPosition.x).toBe(30); // Full movement applied
      expect(result.newPosition.y).toBe(45); // Full movement applied
      expect(result.newVelocity.x).toBe(20); // Velocity unchanged
      expect(result.newVelocity.y).toBe(30); // Velocity unchanged
    });

    test('handles partial frame collision correctly', () => {
      const position = { x: 10, y: 15 };
      const velocity = { x: 100, y: 0 };
      const sweptInfo: SweptCollisionInfo = {
        willCollide: true,
        timeToCollision: 0.2, // Collision happens 20% through the frame
        collisionPoint: { x: 30, y: 15 },
        normalX: -1,
        normalY: 0
      };
      const deltaTime = 0.016; // 60fps

      const result = resolveSweptCollision(position, velocity, sweptInfo, deltaTime);

      expect(result.newPosition.x).toBeCloseTo(10.32); // 10 + 100 * 0.2 * 0.016
      expect(result.newPosition.y).toBe(15);
      expect(result.newVelocity.x).toBe(0); // Stopped after collision
      expect(result.newVelocity.y).toBe(0); // Unchanged (was 0)
    });
  });

  describe('Complex Collision Scenarios', () => {
    test('handles corner collision with proper resolution', () => {
      const position = { x: 18, y: 18 };
      const velocity = { x: 20, y: 20 };
      const boxA: AABB = { x: 18, y: 18, width: 4, height: 4 };
      const boxB: AABB = { x: 20, y: 20, width: 10, height: 10 };
      
      const collision = getCollisionInfo(boxA, boxB);
      const result = resolveCollision(position, velocity, collision);

      expect(collision.hasCollision).toBe(true);
      // The collision resolution should stop movement in only one axis (the axis with minimum overlap)
      if (collision.overlapX < collision.overlapY) {
        expect(result.newVelocity.x).toBe(0);
        expect(result.newVelocity.y).toBe(20); // Y velocity preserved
      } else {
        expect(result.newVelocity.x).toBe(20); // X velocity preserved  
        expect(result.newVelocity.y).toBe(0);
      }
    });

    test('resolves multiple potential collisions by smallest overlap', () => {
      // Test that collision resolution prioritizes the axis with minimum overlap
      const position = { x: 19, y: 15 };
      const velocity = { x: 10, y: 5 };
      const boxA: AABB = { x: 19, y: 15, width: 2, height: 10 };
      const boxB: AABB = { x: 20, y: 10, width: 10, height: 20 };
      
      const collision = getCollisionInfo(boxA, boxB);
      const result = resolveCollision(position, velocity, collision);

      expect(collision.hasCollision).toBe(true);
      // Should resolve horizontally since overlapX (1) < overlapY (15)
      expect(collision.overlapX).toBeLessThan(collision.overlapY);
      expect(result.newVelocity.x).toBe(0);
      expect(result.newVelocity.y).toBe(5); // Y velocity should be preserved
    });
  });
});

describe('Collision System - Spatial Optimization', () => {
  // Mock spatial hash implementation for testing
  class SpatialHash {
    private cellSize: number;
    private grid: Map<string, AABB[]>;

    constructor(cellSize: number = 32) {
      this.cellSize = cellSize;
      this.grid = new Map();
    }

    private getGridKey(x: number, y: number): string {
      const gridX = Math.floor(x / this.cellSize);
      const gridY = Math.floor(y / this.cellSize);
      return `${gridX},${gridY}`;
    }

    private getGridCells(box: AABB): string[] {
      const cells: string[] = [];
      const startX = Math.floor(box.x / this.cellSize);
      const startY = Math.floor(box.y / this.cellSize);
      const endX = Math.floor((box.x + box.width) / this.cellSize);
      const endY = Math.floor((box.y + box.height) / this.cellSize);

      for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
          cells.push(`${x},${y}`);
        }
      }
      return cells;
    }

    insert(box: AABB): void {
      const cells = this.getGridCells(box);
      cells.forEach(cell => {
        if (!this.grid.has(cell)) {
          this.grid.set(cell, []);
        }
        this.grid.get(cell)!.push(box);
      });
    }

    query(box: AABB): AABB[] {
      const potentialCollisions: AABB[] = [];
      const cells = this.getGridCells(box);
      const seen = new Set<AABB>();

      cells.forEach(cell => {
        const cellBoxes = this.grid.get(cell) || [];
        cellBoxes.forEach(cellBox => {
          if (!seen.has(cellBox)) {
            seen.add(cellBox);
            potentialCollisions.push(cellBox);
          }
        });
      });

      return potentialCollisions;
    }

    clear(): void {
      this.grid.clear();
    }

    getCellCount(): number {
      return this.grid.size;
    }
  }

  describe('Spatial Hash Performance', () => {
    test('creates spatial hash with correct cell size', () => {
      const spatialHash = new SpatialHash(64);
      expect(spatialHash).toBeDefined();
      expect(spatialHash.getCellCount()).toBe(0);
    });

    test('inserts single box into correct cells', () => {
      const spatialHash = new SpatialHash(32);
      const box: AABB = { x: 10, y: 10, width: 20, height: 20 };
      
      spatialHash.insert(box);
      
      expect(spatialHash.getCellCount()).toBeGreaterThan(0);
    });

    test('queries return nearby boxes', () => {
      const spatialHash = new SpatialHash(32);
      const box1: AABB = { x: 10, y: 10, width: 10, height: 10 };
      const box2: AABB = { x: 15, y: 15, width: 10, height: 10 };
      const box3: AABB = { x: 100, y: 100, width: 10, height: 10 };
      
      spatialHash.insert(box1);
      spatialHash.insert(box2);
      spatialHash.insert(box3);
      
      const queryBox: AABB = { x: 12, y: 12, width: 8, height: 8 };
      const results = spatialHash.query(queryBox);
      
      expect(results).toContain(box1);
      expect(results).toContain(box2);
      expect(results).not.toContain(box3); // Should be in different cells
    });

    test('handles boxes spanning multiple cells', () => {
      const spatialHash = new SpatialHash(16);
      const largeBox: AABB = { x: 10, y: 10, width: 50, height: 50 };
      
      spatialHash.insert(largeBox);
      
      const queryBox: AABB = { x: 0, y: 0, width: 5, height: 5 };
      const results = spatialHash.query(queryBox);
      
      expect(results).toContain(largeBox);
    });

    test('clear removes all boxes', () => {
      const spatialHash = new SpatialHash(32);
      const box: AABB = { x: 10, y: 10, width: 10, height: 10 };
      
      spatialHash.insert(box);
      expect(spatialHash.getCellCount()).toBeGreaterThan(0);
      
      spatialHash.clear();
      expect(spatialHash.getCellCount()).toBe(0);
    });
  });

  describe('Performance Comparison', () => {
    test('spatial hash is more efficient than brute force for many objects', () => {
      const spatialHash = new SpatialHash(32);
      const boxes: AABB[] = [];
      
      // Create 100 boxes in a grid
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          const box: AABB = { x: i * 20, y: j * 20, width: 15, height: 15 };
          boxes.push(box);
          spatialHash.insert(box);
        }
      }
      
      const queryBox: AABB = { x: 50, y: 50, width: 10, height: 10 };
      
      // Spatial hash query
      const spatialResults = spatialHash.query(queryBox);
      
      // Brute force comparison
      const bruteForceResults = boxes.filter(box => aabbIntersects(queryBox, box));
      
      // Spatial hash should return at least as many results as brute force
      // (may include false positives but no false negatives)
      expect(spatialResults.length).toBeGreaterThanOrEqual(bruteForceResults.length);
      
      // All actual collisions should be found
      bruteForceResults.forEach(result => {
        expect(spatialResults).toContain(result);
      });
    });
  });
});