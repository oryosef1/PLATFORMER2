import { IComponent } from './components/IComponent';

export class Entity {
  private static entityCounter = 0;
  public readonly id: string;
  public readonly components: Map<string, IComponent> = new Map();
  private active: boolean = true;

  constructor() {
    Entity.entityCounter++;
    this.id = `entity_${Entity.entityCounter}`;
  }

  public static getEntityCount(): number {
    return Entity.entityCounter;
  }

  public addComponent(type: string, component: IComponent): void {
    this.components.set(type, component);
  }

  public getComponent<T extends IComponent>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  public hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  public removeComponent(type: string): void {
    this.components.delete(type);
  }

  public isActive(): boolean {
    return this.active;
  }

  public setActive(active: boolean): void {
    this.active = active;
  }

  public destroy(): void {
    this.active = false;
    this.components.clear();
  }
}