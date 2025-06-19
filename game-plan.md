# Metroidvania Game Technical Implementation Plan

## Technology Stack Decision

**Primary Framework: Phaser 3**
- **Reasoning**: Best balance of built-in physics (Arcade Physics ideal for tight platforming), excellent TDD support with Vitest integration, superior debugging tools with frame-by-frame stepping capabilities, and hot reload support
- **Performance**: Easily maintains 60fps for metroidvania gameplay
- **Development Speed**: Rich feature set reduces implementation time

**Supporting Technologies:**
- **Build Tool**: Vite (sub-1-second hot reload)
- **Language**: TypeScript (better for AI-assisted development)
- **Testing**: Vitest + Playwright for visual regression
- **Version Control**: Git with conventional commits
- **State Management**: Hierarchical State Machines
- **Architecture**: Entity Component System (ECS)

## Project Structure

```
metroidvania-game/
├── CLAUDE.md                    # AI memory and context file
├── package.json                 # Dependencies and scripts
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── .gitignore                  
├── src/
│   ├── main.ts                 # Entry point with immediate visual output
│   ├── core/
│   │   ├── Game.ts             # Main game class
│   │   ├── GameLoop.ts         # Fixed timestep game loop
│   │   ├── InputManager.ts     # Input handling with buffering
│   │   └── DebugConsole.ts     # Debug interface
│   ├── ecs/
│   │   ├── Entity.ts           # Base entity class
│   │   ├── components/         # Pure data components
│   │   │   ├── PositionComponent.ts
│   │   │   ├── VelocityComponent.ts
│   │   │   ├── ColliderComponent.ts
│   │   │   ├── HealthComponent.ts
│   │   │   └── InputComponent.ts
│   │   └── systems/            # Logic systems
│   │       ├── MovementSystem.ts
│   │       ├── CollisionSystem.ts
│   │       ├── CombatSystem.ts
│   │       └── RenderSystem.ts
│   ├── entities/
│   │   ├── player/
│   │   │   ├── PlayerEntity.ts
│   │   │   ├── PlayerStateMachine.ts
│   │   │   └── states/         # Player states
│   │   └── enemies/
│   │       ├── EnemyFactory.ts
│   │       └── types/          # Enemy implementations
│   ├── physics/
│   │   ├── CollisionDetection.ts
│   │   └── PhysicsConstants.ts
│   ├── scenes/
│   │   ├── BootScene.ts        # Initial loading
│   │   ├── GameScene.ts        # Main gameplay
│   │   └── DebugScene.ts       # Debug overlay
│   ├── utils/
│   │   └── SaveManager.ts      # Local storage saves
│   └── data/
│       └── levels/             # Level data files
├── tests/
│   ├── unit/                   # Component tests
│   ├── integration/            # System tests
│   └── visual/                 # Screenshot tests
└── public/
    └── index.html              # Entry HTML
```

## Prioritized TODO List (Ordered by Dependencies)

### Phase 1: Foundation (Week 1)
1. **Project Setup & Immediate Visual**
   - Initialize Vite + TypeScript + Phaser 3
   - Create basic HTML5 Canvas with colored rectangle
   - Implement hot reload configuration
   - Setup Git with .gitignore

2. **Core Game Loop**
   - Fixed timestep game loop (60fps)
   - Basic rendering system with geometric shapes
   - FPS counter display

3. **ECS Architecture Foundation**
   - Entity base class
   - Component system (Position, Velocity)
   - Basic Movement System
   - Render System for rectangles

4. **Input System with Buffering**
   - Keyboard input manager
   - 10-frame input buffer implementation
   - Debug display for input state

### Phase 2: Player Implementation (Week 2)
5. **Player Entity & Basic Movement**
   - Player entity with rectangle visual
   - Horizontal movement with acceleration
   - Basic gravity implementation
   - Ground detection

6. **Jump Mechanics**
   - Variable height jumping
   - Coyote time (6 frames)
   - Jump buffering
   - Double jump implementation

7. **Collision System**
   - AABB collision detection
   - Swept collision for high speeds
   - Spatial hashing for optimization
   - Debug visualization of collision boxes

8. **Advanced Movement**
   - Wall sliding/jumping
   - Dash mechanic with invincibility
   - Sprint implementation
   - Pogo jumping setup

### Phase 3: Combat & Enemies (Week 3)
9. **Combat System Foundation**
   - Hitbox/Hurtbox components
   - Melee attack implementation
   - Damage calculation
   - Knockback system

10. **Enemy System**
    - Enemy factory pattern
    - Walker enemy with basic AI
    - State machine for enemy behavior
    - Enemy-player collision

11. **Additional Enemy Types**
    - Flyer enemy implementation
    - Charger enemy
    - Spitter with projectiles
    - Shield enemy with blocking

12. **Player Combat Abilities**
    - Blade tornado
    - Rocket dive
    - Deflect shield
    - Shatter strike

### Phase 4: Level & Game Systems (Week 4)
13. **Level System**
    - Room-based level structure
    - Level loading from JSON
    - Camera system
    - Room transitions

14. **Save System**
    - Game state serialization
    - LocalStorage integration
    - Save/load UI
    - Multiple save slots

15. **Charm System**
    - Charm component structure
    - 10 basic charm implementations
    - Charm UI and management
    - Charm synergy system

16. **Debug Interface**
    - Console commands
    - State inspection
    - Frame stepping controls
    - Performance profiler

### Phase 5: Content & Polish (Week 5)
17. **Level Design Tools**
    - Level editor basics
    - Enemy placement
    - Ability gates
    - Secret areas

18. **Three Demo Areas**
    - 5-7 rooms per area
    - Unique challenges per area
    - Boss room preparations
    - Interconnections

19. **Ranged Combat**
    - Projectile system
    - Ranged upgrade mechanic
    - Projectile pooling
    - Visual effects

20. **Final Polish**
    - Menu system
    - Death/respawn system
    - Particle effects
    - Sound system hooks

## Testing Strategy Per Component

### Movement System Tests
```typescript
describe('PlayerMovement', () => {
  test('jump achieves minimum height of 4 units', () => {
    const player = createPlayer({ grounded: true });
    const input = { jump: true };
    
    const result = updatePlayer(player, input, FIXED_TIMESTEP);
    
    expect(result.velocity.y).toBe(JUMP_VELOCITY);
    expect(calculateJumpHeight(result.velocity.y)).toBeGreaterThan(4);
  });

  test('coyote time allows jump 6 frames after leaving ground', () => {
    const player = createPlayer({ 
      grounded: false, 
      lastGroundedFrame: currentFrame - 5 
    });
    
    expect(canJump(player)).toBe(true);
  });
});
```

### Collision System Tests
```typescript
describe('CollisionDetection', () => {
  test('swept AABB prevents tunneling at high speeds', () => {
    const player = { x: 0, y: 0, width: 32, height: 64 };
    const wall = { x: 100, y: 0, width: 32, height: 100 };
    const velocity = { x: 200, y: 0 }; // Would tunnel without swept
    
    const collision = sweptAABB(player, wall, velocity);
    
    expect(collision.time).toBeLessThan(1);
    expect(collision.normal).toEqual({ x: -1, y: 0 });
  });
});
```

### Combat System Tests
```typescript
describe('CombatSystem', () => {
  test('invincibility frames prevent multiple hits', () => {
    const enemy = createEnemy();
    const hitbox = createHitbox({ damage: 10, owner: player });
    
    processCombatHit(enemy, hitbox);
    const firstHealth = enemy.health;
    
    processCombatHit(enemy, hitbox); // Should be ignored
    
    expect(enemy.health).toBe(firstHealth);
  });
});
```

## Complete CLAUDE.md Template

```markdown
# Metroidvania Game - Claude Development Memory

## Project Overview
- **Game Type**: Ultra-challenging 2D Metroidvania (harder than Hollow Knight)
- **Tech Stack**: Phaser 3, TypeScript, Vite, Vitest
- **Architecture**: ECS with Hierarchical State Machines
- **Visual Style**: Geometric shapes (rectangles, circles) initially
- **Platform**: Web browser (HTML5 Canvas)
- **Save System**: LocalStorage
- **Development Stage**: Prototype

## Current Implementation Status
### Completed Features
- [ ] Project setup with hot reload
- [ ] Basic rendering with geometric shapes
- [ ] Fixed timestep game loop
- [ ] ECS architecture foundation
- [ ] Input system with buffering

### In Progress
- [ ] Player movement system
- [ ] Collision detection
- [ ] State machine implementation

### Next Priorities
1. Complete player jump mechanics with coyote time
2. Implement wall sliding/jumping
3. Add debug visualization for collisions

## Architecture Decisions
### Game Engine: Phaser 3
- **Reasoning**: Built-in Arcade Physics perfect for platformers, excellent debugging tools, strong TDD support
- **Version**: 3.70.0
- **Key Features Used**: Arcade Physics, Scene Management, Input System

### ECS Architecture
- **Pattern**: Entity-Component-System for flexibility and testability
- **Components**: Pure data containers
- **Systems**: Stateless logic processors
- **Benefits**: Easy to test, debug, and extend

### State Management
- **Player**: Hierarchical State Machine (Grounded -> Idle/Running/Attacking, Airborne -> Jumping/Falling/WallSliding)
- **Enemies**: Simple FSM per enemy type
- **Game**: State stack for pause/menu overlays

## Code Patterns
### Input Buffering Implementation
```typescript
class InputBuffer {
  private buffer: InputFrame[] = [];
  private bufferSize = 10;
  
  addInput(input: InputType, frame: number) {
    this.buffer.push({ type: input, frame });
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
  }
  
  hasInput(type: InputType, within: number): boolean {
    const currentFrame = this.game.frame;
    return this.buffer.some(input => 
      input.type === type && 
      currentFrame - input.frame <= within
    );
  }
}
```

### Collision Detection Pattern
```typescript
function sweptAABB(box: AABB, velocity: Vector2, static: AABB): CollisionResult {
  // Calculate entry/exit distances
  const invEntry = calculateInvEntry(box, velocity, static);
  const invExit = calculateInvExit(box, velocity, static);
  
  // Calculate entry/exit times
  const entry = calculateEntryTime(invEntry, velocity);
  const exit = calculateExitTime(invExit, velocity);
  
  // Check for collision
  if (entry.max > exit.min || entry.max > 1 || entry.max < 0) {
    return { hit: false };
  }
  
  // Calculate normal
  const normal = calculateNormal(entry);
  
  return { hit: true, time: entry.max, normal };
}
```

## Physics Constants
```typescript
const PHYSICS = {
  GRAVITY: 980,              // pixels/s²
  JUMP_HEIGHT: 256,          // pixels (4 tiles)
  JUMP_TIME_TO_APEX: 0.4,    // seconds
  MOVE_SPEED: 200,           // pixels/s
  DASH_SPEED: 600,           // pixels/s
  DASH_DISTANCE: 192,        // pixels (3 tiles)
  WALL_SLIDE_SPEED: 100,     // pixels/s
  COYOTE_TIME: 6,           // frames
  JUMP_BUFFER: 10           // frames
};
```

## Testing Strategy
- **Unit Tests**: Pure functions (physics calculations, state transitions)
- **Integration Tests**: System interactions (input -> movement -> collision)
- **Visual Tests**: Rendering output validation
- **Performance Tests**: Maintain 60fps with 100+ entities

## Debug Commands
- `tp <x> <y>` - Teleport player
- `spawn <enemy> <x> <y>` - Spawn enemy
- `give <ability>` - Grant ability
- `room <id>` - Load specific room
- `profile` - Toggle performance profiler
- `collision` - Toggle collision visualization
- `step` - Frame-by-frame stepping

## Performance Targets
- 60 FPS on mid-range hardware
- < 500ms level load time
- < 100MB memory usage
- < 16ms frame time

## Known Issues & Workarounds
### Issue: Input lag in Firefox
- **Workaround**: Use RAF timing instead of setTimeout
- **Fix planned**: Implement in next sprint

### Issue: Collision tunneling at very high speeds
- **Workaround**: Cap maximum velocity
- **Fix planned**: Implement continuous collision detection

## Next Development Session Focus
1. Complete jump implementation with variable height
2. Add wall detection for wall slides
3. Implement debug overlay with input visualization
4. Write tests for movement system
5. Begin dash ability implementation

## Git Commit Convention
- feat: New features
- fix: Bug fixes
- perf: Performance improvements
- test: Test additions/changes
- refactor: Code restructuring
- docs: Documentation updates

Example: `feat(player): add double jump with 6-frame buffer`
```

This comprehensive plan provides everything needed to build the metroidvania game incrementally with TDD practices. The prioritized TODO list ensures each feature builds on previous work, while the testing strategies guarantee quality at each step. The CLAUDE.md template will help Claude Code maintain context and make consistent decisions throughout development.