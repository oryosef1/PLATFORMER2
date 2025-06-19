export interface InputState {
  isDown: boolean;
  justPressed: boolean;
  justReleased: boolean;
  heldDuration: number;
}

export interface InputBufferEntry {
  action: string;
  frame: number;
}

export interface DebugInfo {
  activeKeys: string[];
  bufferHistory: InputBufferEntry[];
  bufferedInputs: string[];
  bufferFrames: number[];
}

export class InputBuffer {
  private buffer: InputBufferEntry[] = [];
  private readonly capacity: number = 10;
  private currentFrame: number = 0;

  public getCapacity(): number {
    return this.capacity;
  }

  public isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  public getSize(): number {
    return this.buffer.length;
  }

  public addInput(action: string, frame: number): void {
    this.buffer.push({ action, frame });
    
    // Remove old entries beyond capacity
    if (this.buffer.length > this.capacity) {
      this.buffer.shift();
    }
  }

  public getInputsAtFrame(frame: number): string[] {
    return this.buffer
      .filter(entry => entry.frame === frame)
      .map(entry => entry.action);
  }

  public wasInputInWindow(action: string, currentFrame: number, windowSize: number): boolean {
    const minFrame = Math.max(0, currentFrame - windowSize);
    return this.buffer.some(entry => 
      entry.action === action && 
      entry.frame >= minFrame && 
      entry.frame <= currentFrame
    );
  }

  public update(currentFrame: number): void {
    this.currentFrame = currentFrame;
    
    // Remove entries older than 10 frames
    const cutoff = currentFrame - 10;
    this.buffer = this.buffer.filter(entry => entry.frame > cutoff);
  }

  public getEntries(): InputBufferEntry[] {
    return [...this.buffer];
  }
}

export class InputManager {
  private keyStates: Map<string, InputState> = new Map();
  private inputBuffer: InputBuffer = new InputBuffer();
  private currentFrame: number = 0;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown.bind(this));
      window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.code || event.key;
    console.log(`[INPUT] Key DOWN: ${key}`);
    this.setKeyState(key, true);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.code || event.key;
    console.log(`[INPUT] Key UP: ${key}`);
    this.setKeyState(key, false);
  }

  public setKeyState(key: string, isDown: boolean): void {
    const currentState = this.keyStates.get(key) || {
      isDown: false,
      justPressed: false,
      justReleased: false,
      heldDuration: 0
    };

    const wasDown = currentState.isDown;
    
    // Set the justPressed/justReleased flags immediately
    const justPressed = !wasDown && isDown;
    const justReleased = wasDown && !isDown;
    
    if (justPressed) {
      console.log(`[INPUT] ${key} JUST PRESSED (frame ${this.currentFrame})`);
    }
    if (justReleased) {
      console.log(`[INPUT] ${key} JUST RELEASED (frame ${this.currentFrame})`);
    }
    
    this.keyStates.set(key, {
      isDown,
      justPressed,
      justReleased,
      heldDuration: isDown ? (wasDown ? currentState.heldDuration : 0) : 0
    });

    // Add to buffer if just pressed
    if (justPressed) {
      this.inputBuffer.addInput(key, this.currentFrame);
      console.log(`[INPUT BUFFER] Added ${key} to buffer at frame ${this.currentFrame}`);
    }
  }

  public update(): void {
    // First clear previous frame's just pressed/released flags
    for (const [key, state] of this.keyStates) {
      if (state.justPressed || state.justReleased) {
        console.log(`[INPUT] Clearing flags for ${key} (justPressed: ${state.justPressed}, justReleased: ${state.justReleased})`);
      }
      this.keyStates.set(key, {
        ...state,
        justPressed: false, // Reset previous frame flags
        justReleased: false, // Reset previous frame flags
        heldDuration: state.isDown ? state.heldDuration + 1 : 0
      });
    }
    
    this.currentFrame++;
    this.inputBuffer.update(this.currentFrame);
  }

  public isKeyDown(key: string): boolean {
    return this.keyStates.get(key)?.isDown || false;
  }

  public isKeyJustPressed(key: string): boolean {
    return this.keyStates.get(key)?.justPressed || false;
  }

  public isKeyJustReleased(key: string): boolean {
    return this.keyStates.get(key)?.justReleased || false;
  }

  public getKeyHeldDuration(key: string): number {
    return this.keyStates.get(key)?.heldDuration || 0;
  }

  public getInputBuffer(): InputBuffer {
    return this.inputBuffer;
  }

  public addBufferedInput(action: string, frame: number): void {
    this.inputBuffer.addInput(action, frame);
  }

  public wasInputBuffered(action: string, currentFrame: number, windowSize: number): boolean {
    return this.inputBuffer.wasInputInWindow(action, currentFrame, windowSize);
  }

  public getDebugInfo(): DebugInfo {
    const activeKeys = Array.from(this.keyStates.entries())
      .filter(([_, state]) => state.isDown)
      .map(([key, _]) => key);

    const bufferEntries = this.inputBuffer.getEntries();
    
    return {
      activeKeys,
      bufferHistory: bufferEntries,
      bufferedInputs: [...new Set(bufferEntries.map(entry => entry.action))],
      bufferFrames: bufferEntries.map(entry => entry.frame)
    };
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown.bind(this));
      window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }
  }
}