import { describe, it, expect } from 'vitest';
import { PositionComponent } from '../../src/ecs/components/PositionComponent';
import { VelocityComponent } from '../../src/ecs/components/VelocityComponent';

describe('Phase 1.3: ECS Components Tests', () => {
  describe('Position Component', () => {
    it('should create position component with x and y coordinates', () => {
      const position = new PositionComponent(10, 20);
      expect(position.x).toBe(10);
      expect(position.y).toBe(20);
      expect(position.type).toBe('position');
    });

    it('should default to origin when no coordinates provided', () => {
      const position = new PositionComponent();
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });

    it('should allow updating position coordinates', () => {
      const position = new PositionComponent(10, 20);
      position.setPosition(30, 40);
      expect(position.x).toBe(30);
      expect(position.y).toBe(40);
    });

    it('should calculate distance to another position', () => {
      const pos1 = new PositionComponent(0, 0);
      const pos2 = new PositionComponent(3, 4);
      const distance = pos1.distanceTo(pos2);
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('should clone position component', () => {
      const original = new PositionComponent(10, 20);
      const clone = original.clone();
      expect(clone.x).toBe(original.x);
      expect(clone.y).toBe(original.y);
      expect(clone).not.toBe(original); // Different object
    });
  });

  describe('Velocity Component', () => {
    it('should create velocity component with x and y speeds', () => {
      const velocity = new VelocityComponent(5, -2);
      expect(velocity.x).toBe(5);
      expect(velocity.y).toBe(-2);
      expect(velocity.type).toBe('velocity');
    });

    it('should default to zero velocity when no speeds provided', () => {
      const velocity = new VelocityComponent();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });

    it('should calculate velocity magnitude (speed)', () => {
      const velocity = new VelocityComponent(3, 4);
      const magnitude = velocity.getMagnitude();
      expect(magnitude).toBe(5); // sqrt(3² + 4²) = 5
    });

    it('should normalize velocity to unit vector', () => {
      const velocity = new VelocityComponent(3, 4);
      velocity.normalize();
      expect(velocity.x).toBeCloseTo(0.6, 2); // 3/5
      expect(velocity.y).toBeCloseTo(0.8, 2); // 4/5
      expect(velocity.getMagnitude()).toBeCloseTo(1, 2);
    });

    it('should scale velocity by factor', () => {
      const velocity = new VelocityComponent(2, 3);
      velocity.scale(2.5);
      expect(velocity.x).toBe(5);
      expect(velocity.y).toBe(7.5);
    });

    it('should add another velocity', () => {
      const vel1 = new VelocityComponent(2, 3);
      const vel2 = new VelocityComponent(1, -1);
      vel1.add(vel2);
      expect(vel1.x).toBe(3);
      expect(vel1.y).toBe(2);
    });

    it('should apply friction/damping', () => {
      const velocity = new VelocityComponent(10, 5);
      velocity.applyFriction(0.9); // 90% retention
      expect(velocity.x).toBe(9);
      expect(velocity.y).toBe(4.5);
    });
  });

  describe('Component Interface', () => {
    it('should ensure all components have type property', () => {
      const position = new PositionComponent();
      const velocity = new VelocityComponent();
      expect(position.type).toBeDefined();
      expect(velocity.type).toBeDefined();
    });

    it('should support component serialization', () => {
      const position = new PositionComponent(10, 20);
      const serialized = position.serialize();
      expect(serialized).toEqual({ type: 'position', x: 10, y: 20 });
    });

    it('should support component deserialization', () => {
      const data = { type: 'position', x: 10, y: 20 };
      const position = PositionComponent.deserialize(data);
      expect(position.x).toBe(10);
      expect(position.y).toBe(20);
    });
  });
});