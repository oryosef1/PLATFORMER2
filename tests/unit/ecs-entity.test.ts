import { describe, it, expect, beforeEach } from 'vitest';
import { Entity } from '../../src/ecs/Entity';

describe('Phase 1.3: ECS Entity System Tests', () => {
  describe('Entity Creation and ID Assignment', () => {
    it('should create entity with unique ID', () => {
      const entity = new Entity();
      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe('string');
    });

    it('should assign unique IDs to different entities', () => {
      const entity1 = new Entity();
      const entity2 = new Entity();
      expect(entity1.id).not.toBe(entity2.id);
    });

    it('should initialize entity with empty components map', () => {
      const entity = new Entity();
      expect(entity.components).toBeDefined();
      expect(entity.components.size).toBe(0);
    });

    it('should track entity creation count', () => {
      const initialCount = Entity.getEntityCount();
      const entity = new Entity();
      expect(Entity.getEntityCount()).toBe(initialCount + 1);
    });
  });

  describe('Component Attachment and Detachment', () => {
    it('should attach component to entity', () => {
      const entity = new Entity();
      const component = { type: 'position', x: 10, y: 20, serialize: () => ({}) };
      entity.addComponent('position', component);
      expect(entity.hasComponent('position')).toBe(true);
    });

    it('should retrieve attached component', () => {
      const entity = new Entity();
      const component = { type: 'position', x: 10, y: 20, serialize: () => ({}) };
      entity.addComponent('position', component);
      const retrieved = entity.getComponent('position');
      expect(retrieved).toBe(component);
    });

    it('should detach component from entity', () => {
      const entity = new Entity();
      const component = { type: 'position', x: 10, y: 20, serialize: () => ({}) };
      entity.addComponent('position', component);
      entity.removeComponent('position');
      expect(entity.hasComponent('position')).toBe(false);
    });

    it('should return undefined for non-existent component', () => {
      const entity = new Entity();
      const component = entity.getComponent('nonexistent');
      expect(component).toBeUndefined();
    });

    it('should handle multiple components on same entity', () => {
      const entity = new Entity();
      const posComponent = { type: 'position', x: 10, y: 20, serialize: () => ({}) };
      const velComponent = { type: 'velocity', x: 5, y: -2, serialize: () => ({}) };
      
      entity.addComponent('position', posComponent);
      entity.addComponent('velocity', velComponent);
      
      expect(entity.hasComponent('position')).toBe(true);
      expect(entity.hasComponent('velocity')).toBe(true);
      expect(entity.getComponent('position')).toBe(posComponent);
      expect(entity.getComponent('velocity')).toBe(velComponent);
    });
  });

  describe('Entity Lifecycle', () => {
    it('should mark entity as active by default', () => {
      const entity = new Entity();
      expect(entity.isActive()).toBe(true);
    });

    it('should allow deactivating entity', () => {
      const entity = new Entity();
      entity.setActive(false);
      expect(entity.isActive()).toBe(false);
    });

    it('should allow reactivating entity', () => {
      const entity = new Entity();
      entity.setActive(false);
      entity.setActive(true);
      expect(entity.isActive()).toBe(true);
    });

    it('should destroy entity and clear components', () => {
      const entity = new Entity();
      entity.addComponent('position', { type: 'position', x: 10, y: 20, serialize: () => ({}) });
      entity.destroy();
      expect(entity.isActive()).toBe(false);
      expect(entity.components.size).toBe(0);
    });
  });
});