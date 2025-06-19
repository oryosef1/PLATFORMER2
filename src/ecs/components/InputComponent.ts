import { IComponent } from './IComponent';

export interface InputMapping {
  [action: string]: string;
}

export class InputComponent implements IComponent {
  public readonly type = 'input';
  private actionBindings: Map<string, string> = new Map();

  constructor(inputMapping?: InputMapping) {
    if (inputMapping) {
      this.setInputMapping(inputMapping);
    }
  }

  public bindAction(action: string, key: string): void {
    this.actionBindings.set(action, key);
  }

  public getActionBinding(action: string): string | undefined {
    return this.actionBindings.get(action);
  }

  public setInputMapping(mapping: InputMapping): void {
    this.actionBindings.clear();
    for (const [action, key] of Object.entries(mapping)) {
      this.actionBindings.set(action, key);
    }
  }

  public getInputMapping(): InputMapping {
    const mapping: InputMapping = {};
    for (const [action, key] of this.actionBindings) {
      mapping[action] = key;
    }
    return mapping;
  }

  public hasAction(action: string): boolean {
    return this.actionBindings.has(action);
  }

  public removeAction(action: string): void {
    this.actionBindings.delete(action);
  }

  public serialize(): Record<string, any> {
    return {
      type: this.type,
      actionBindings: this.getInputMapping()
    };
  }

  public static deserialize(data: Record<string, any>): InputComponent {
    const component = new InputComponent();
    if (data.actionBindings) {
      component.setInputMapping(data.actionBindings);
    }
    return component;
  }
}