export interface IComponent {
  readonly type: string;
  serialize(): Record<string, any>;
}