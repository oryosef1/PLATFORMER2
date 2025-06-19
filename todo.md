# TDD Development Plan - Metroidvania Platformer

## Development Phases

### Phase 1: Foundation (Week 1)
**Goal**: Establish core systems with immediate visual feedback

#### 1.1 Basic Game Setup ✅
- [x] Initialize Vite + TypeScript + Phaser 3
- [x] Create project structure
- [x] Setup configuration files
- [x] Initialize Git repository

#### 1.2 Core Game Loop & Visual Output
**Status**: 🔄 In Progress

**Tests to Write First**:
- [ ] Test game initializes without errors
- [ ] Test canvas creates with correct dimensions
- [ ] Test game loop runs at 60fps
- [ ] Test colored rectangle renders correctly

**Sub-tasks**:
- [ ] Create main.ts entry point
- [ ] Setup basic Phaser game configuration
- [ ] Create BootScene for initial loading
- [ ] Create GameScene with colored rectangle
- [ ] Add FPS counter display
- [ ] Test hot reload functionality

#### 1.3 ECS Architecture Foundation
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test Entity creation and ID assignment
- [ ] Test Component attachment/detachment
- [ ] Test System processing entities
- [ ] Test Position component updates
- [ ] Test Velocity component calculations

**Sub-tasks**:
- [ ] Create Entity base class
- [ ] Implement Component system
- [ ] Create PositionComponent
- [ ] Create VelocityComponent
- [ ] Create basic MovementSystem
- [ ] Create RenderSystem for rectangles
- [ ] Add debug visualization for components

#### 1.4 Input System with Buffering
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test keyboard input detection
- [ ] Test input buffer stores inputs correctly
- [ ] Test buffer maintains 10-frame history
- [ ] Test input buffer retrieval within time window
- [ ] Test input state transitions

**Sub-tasks**:
- [ ] Create InputManager class
- [ ] Implement 10-frame input buffer
- [ ] Add keyboard event handling
- [ ] Create InputComponent for entities
- [ ] Add debug display for input state
- [ ] Test input responsiveness

### Phase 2: Player Implementation (Week 2)
**Goal**: Responsive player movement with tight controls

#### 2.1 Player Entity & Basic Movement
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test player entity creation
- [ ] Test horizontal movement acceleration
- [ ] Test movement speed limits
- [ ] Test deceleration when input stops
- [ ] Test air control reduction

**Sub-tasks**:
- [ ] Create PlayerEntity class
- [ ] Add horizontal movement with acceleration
- [ ] Implement movement speed limits
- [ ] Add basic gravity implementation
- [ ] Create ground detection system
- [ ] Add visual rectangle for player

#### 2.2 Jump Mechanics
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test minimum jump height (4 units)
- [ ] Test maximum jump height (8 units)
- [ ] Test variable jump (hold for higher)
- [ ] Test coyote time (6 frames after leaving ground)
- [ ] Test jump buffering (10 frames)
- [ ] Test double jump mechanics

**Sub-tasks**:
- [ ] Implement variable height jumping
- [ ] Add coyote time system
- [ ] Create jump buffering
- [ ] Implement double jump
- [ ] Add jump state tracking
- [ ] Test edge cases (multiple jumps, etc.)

#### 2.3 Collision System
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test AABB collision detection
- [ ] Test swept collision prevents tunneling
- [ ] Test collision response (stopping movement)
- [ ] Test collision normals calculation
- [ ] Test spatial hashing performance

**Sub-tasks**:
- [ ] Implement AABB collision detection
- [ ] Add swept collision for high speeds
- [ ] Create spatial hashing for optimization
- [ ] Add collision response system
- [ ] Implement debug visualization
- [ ] Test with high-speed movement

#### 2.4 Advanced Movement
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test wall slide speed (60-80 px/s)
- [ ] Test wall jump mechanics
- [ ] Test dash distance and speed
- [ ] Test dash cooldown timing
- [ ] Test invincibility during dash

**Sub-tasks**:
- [ ] Implement wall sliding mechanics
- [ ] Add wall jumping system
- [ ] Create dash mechanic
- [ ] Add dash cooldown system
- [ ] Implement sprint functionality
- [ ] Setup pogo jumping foundation

### Phase 3: Combat & Enemies (Week 3)
**Goal**: Engaging combat with varied enemy types

#### 3.1 Combat System Foundation
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test hitbox/hurtbox creation
- [ ] Test damage calculation
- [ ] Test knockback application
- [ ] Test invincibility frames
- [ ] Test melee attack hitboxes

**Sub-tasks**:
- [ ] Create Hitbox/Hurtbox components
- [ ] Implement melee attack system
- [ ] Add damage calculation
- [ ] Create knockback system
- [ ] Add invincibility frames
- [ ] Implement screen shake on hit

#### 3.2 Enemy System
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test enemy factory creation
- [ ] Test walker enemy AI
- [ ] Test enemy state transitions
- [ ] Test enemy-player collision
- [ ] Test enemy health system

**Sub-tasks**:
- [ ] Create enemy factory pattern
- [ ] Implement walker enemy
- [ ] Add basic AI state machine
- [ ] Create enemy-player collision
- [ ] Add enemy health system
- [ ] Implement enemy death

#### 3.3 Additional Enemy Types
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test flyer movement patterns
- [ ] Test charger attack behavior
- [ ] Test spitter projectile creation
- [ ] Test shield enemy blocking
- [ ] Test enemy type-specific behaviors

**Sub-tasks**:
- [ ] Create flyer enemy
- [ ] Implement charger enemy
- [ ] Add spitter with projectiles
- [ ] Create shield enemy
- [ ] Add enemy variant behaviors
- [ ] Test enemy interactions

#### 3.4 Player Combat Abilities
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test blade tornado range and damage
- [ ] Test rocket dive mechanics
- [ ] Test deflect shield timing
- [ ] Test shatter strike effects
- [ ] Test ability cooldowns

**Sub-tasks**:
- [ ] Implement blade tornado
- [ ] Add rocket dive ability
- [ ] Create deflect shield
- [ ] Implement shatter strike
- [ ] Add ability upgrade system
- [ ] Test ability combinations

### Phase 4: Level & Game Systems (Week 4)
**Goal**: Complete game systems and progression

#### 4.1 Level System
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test room loading from JSON
- [ ] Test camera following player
- [ ] Test room transitions
- [ ] Test level data validation

**Sub-tasks**:
- [ ] Create room-based level structure
- [ ] Implement level loading from JSON
- [ ] Add camera system
- [ ] Create room transitions
- [ ] Add level editor basics
- [ ] Test level performance

#### 4.2 Save System
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test game state serialization
- [ ] Test LocalStorage save/load
- [ ] Test multiple save slots
- [ ] Test save data corruption handling

**Sub-tasks**:
- [ ] Implement game state serialization
- [ ] Add LocalStorage integration
- [ ] Create save/load UI
- [ ] Add multiple save slots
- [ ] Implement auto-save
- [ ] Test save system reliability

#### 4.3 Charm System
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test charm component creation
- [ ] Test charm effect application
- [ ] Test charm synergy system
- [ ] Test charm UI functionality

**Sub-tasks**:
- [ ] Create charm component structure
- [ ] Implement 10 basic charms
- [ ] Add charm UI and management
- [ ] Create charm synergy system
- [ ] Add charm discovery mechanics
- [ ] Test charm balance

### Phase 5: Content & Polish (Week 5)
**Goal**: Playable demo with three areas

#### 5.1 Level Design Tools
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test level editor functionality
- [ ] Test enemy placement system
- [ ] Test ability gate mechanics
- [ ] Test secret area detection

**Sub-tasks**:
- [ ] Enhance level editor
- [ ] Add enemy placement tools
- [ ] Implement ability gates
- [ ] Create secret areas
- [ ] Add interconnected rooms
- [ ] Test level flow

#### 5.2 Three Demo Areas
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test area connectivity
- [ ] Test unique challenges per area
- [ ] Test boss room mechanics
- [ ] Test area progression

**Sub-tasks**:
- [ ] Design 5-7 rooms per area
- [ ] Create unique challenges
- [ ] Add boss room preparations
- [ ] Implement area interconnections
- [ ] Add area-specific mechanics
- [ ] Test area completion

#### 5.3 Final Polish
**Status**: 📋 Pending

**Tests to Write First**:
- [ ] Test menu system navigation
- [ ] Test death/respawn mechanics
- [ ] Test particle system performance
- [ ] Test sound system integration

**Sub-tasks**:
- [ ] Create menu system
- [ ] Implement death/respawn
- [ ] Add particle effects
- [ ] Integrate sound system
- [ ] Add final visual polish
- [ ] Performance optimization

## Testing Strategy
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test system interactions
- **Visual Tests**: Test rendering and animations
- **Performance Tests**: Ensure 60fps with 100+ entities

## Current Priority
Focus on Phase 1.2: Core Game Loop & Visual Output