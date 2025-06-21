# TDD Development Plan - Metroidvania Platformer

## Development Phases

### Phase 1: Foundation (Week 1)
**Goal**: Establish core systems with immediate visual feedback

#### 1.1 Basic Game Setup ✅
- [x] Initialize Vite + TypeScript + Phaser 3
- [x] Create project structure
- [x] Setup configuration files
- [x] Initialize Git repository

#### 1.2 Core Game Loop & Visual Output ✅
**Status**: ✅ Completed with comprehensive tests

**Tests Completed**:
- [x] Test game logic (dimensions, colors, positions, physics constants) - 13 tests
- [x] Test FPS calculation logic and timing functions - 8 tests
- [x] Test performance monitoring and display formatting
- [x] All 21 tests passing with proper test coverage

**Sub-tasks**:
- [x] Create main.ts entry point
- [x] Setup basic Phaser game configuration
- [x] Create BootScene for initial loading
- [x] Create GameScene with colored rectangle
- [x] Add FPS counter display
- [x] Test hot reload functionality

#### 1.3 ECS Architecture Foundation ✅
**Status**: ✅ Completed with comprehensive tests

**Tests Completed**:
- [x] Test Entity creation and ID assignment - 13 tests
- [x] Test Component attachment/detachment
- [x] Test Position component updates - 15 tests
- [x] Test Velocity component calculations
- [x] All 49 tests passing with proper test coverage

**Sub-tasks**:
- [x] Create Entity base class
- [x] Implement Component system
- [x] Create PositionComponent
- [x] Create VelocityComponent
- [x] Add component serialization/deserialization
- [x] Arrow-only movement controls documented
- [x] ECS foundation ready for systems implementation

#### 1.4 Input System with Buffering ✅
**Status**: ✅ Completed with comprehensive tests

**Tests Completed**:
- [x] Test keyboard input detection - 18 tests
- [x] Test input buffer stores inputs correctly
- [x] Test buffer maintains 10-frame history
- [x] Test input buffer retrieval within time window
- [x] Test input state transitions
- [x] All 67 tests passing with proper test coverage

**Sub-tasks**:
- [x] Create InputManager class
- [x] Implement 10-frame input buffer
- [x] Add keyboard event handling
- [x] Create InputComponent for entities
- [x] Add debug display for input state
- [x] Test input responsiveness
- [x] Integrate with GameScene
- [x] Add extensive console debugging
- [x] User testing completed and confirmed working

### Phase 2: Player Implementation (Week 2)
**Goal**: Responsive player movement with tight controls

#### 2.1 Player Entity & Basic Movement ✅
**Status**: ✅ COMPLETED with comprehensive tests

**Tests Completed**:
- [x] Test player entity creation - 22 tests
- [x] Test horizontal movement acceleration
- [x] Test movement speed limits  
- [x] Test deceleration when input stops
- [x] Test air control reduction
- [x] Test gravity system and terminal velocity
- [x] Test ground detection system
- [x] Test collision detection and position correction
- [x] All 89 tests passing (22 PlayerEntity tests + 67 existing)

**Sub-tasks**:
- [x] Create PlayerEntity class with ECS integration
- [x] Add horizontal movement with acceleration
- [x] Implement movement speed limits
- [x] Add basic gravity implementation
- [x] Create ground detection system
- [x] Add visual rectangle for player
- [x] Fix collision detection bug (player sinking into platforms)
- [x] Implement proper collision response

#### 2.2 Enhanced Jumping System ✅
**Status**: ✅ COMPLETED with comprehensive tests

**Tests Completed**:
- [x] Test minimum jump height (300 px/s) - 19 tests
- [x] Test maximum jump height (500 px/s) with variable scaling
- [x] Test variable jump height based on hold duration (12 frames)
- [x] Test coyote time system (6 frames after leaving ground)
- [x] Test jump buffering system (10 frames input window)
- [x] Test double jump mechanics (UP+UP instead of UP+SPACE)
- [x] Test jump state management and cancellation
- [x] Test jump physics integration with movement constants
- [x] All 108 tests passing (19 jump tests + 89 existing)

**Sub-tasks**:
- [x] Implement variable height jumping with hold scaling
- [x] Add coyote time system with 6-frame grace period
- [x] Create jump buffering with 10-frame input window
- [x] Implement double jump with UP+UP controls
- [x] Add comprehensive jump state tracking
- [x] Fix input timing bug (InputManager update order)
- [x] Fix coyote time small jump issue
- [x] Fix collision detection for side vs top platform hits
- [x] Add proper rendering depth (player on top of platforms)
- [x] Test and debug all edge cases

#### 2.3 Collision System ✅
**Status**: ✅ COMPLETED with comprehensive tests and critical architecture fixes

**Tests Completed**:
- [x] Test AABB collision detection - 34 tests
- [x] Test collision response (stopping movement)
- [x] Test collision normals calculation
- [x] Test spatial hashing performance
- [x] All 142 tests passing (34 collision tests + 108 existing)

**Sub-tasks**:
- [x] Implement AABB collision detection with normal calculation
- [x] Create spatial hashing for optimization (64px cells)
- [x] Add collision response system with position/velocity resolution
- [x] Implement debug visualization with collision box rendering
- [x] Test with high-speed movement scenarios
- [x] Integrate with existing ECS architecture
- [x] Replace Phaser physics with custom collision system
- [x] **CRITICAL FIX**: Resolve double movement application architecture issue
- [x] **CRITICAL FIX**: Eliminate conflicting collision resolution systems
- [x] **CRITICAL FIX**: Fix sticky/slow movement on platforms
- [x] **CRITICAL FIX**: Fix platform tunneling near edges
- [x] Simplify collision architecture for reliability and maintainability
- [x] User testing completed and confirmed working

#### 2.4 Advanced Movement ✅
**Status**: ✅ COMPLETED with comprehensive tests and Hollow Knight-style dash mechanics

**Tests Completed**:
- [x] Test wall detection (left, right, both walls) - 4 tests
- [x] Test wall slide speed and mechanics - 8 tests
- [x] Test wall jump mechanics and directions - 6 tests
- [x] Test wall jump control lockout system - 3 tests
- [x] Test wall mechanics integration - 3 tests
- [x] Test wall jump cooldown prevention - 6 tests
- [x] Test dash mechanics (facing-based direction, cooldown, duration) - 16 tests
- [x] Test sprint mechanics (stamina management, speed multipliers) - 14 tests
- [x] Test dash/sprint integration (combined usage, priority handling) - 2 tests
- [x] All 62 advanced movement tests passing (204 tests total)

**Sub-tasks**:
- [x] Implement wall detection system (left/right wall contact)
- [x] Add wall sliding mechanics (60 px/s consistent fall speed)
- [x] Create wall jumping system with proper velocity directions
- [x] Add wall jump coyote time (6-frame grace period)
- [x] Implement wall jump control lockout (4 frames)
- [x] Add wall jump cooldown system (8 frames)
- [x] **CRITICAL FIX**: Wall jumps NEVER restore double jump
- [x] Fix gravity conflicts with wall sliding
- [x] Eliminate wall jump spam exploits
- [x] **Hollow Knight-style dash mechanics**: Facing-based dash direction implementation
- [x] Add dash system with cooldown (60 frames), duration (8 frames), invincibility (6 frames)
- [x] Implement downward dash support (X+DOWN for Dashmaster-style downward dash)
- [x] Create sprint system with stamina management (300 max, 2 drain/frame, 1 regen/frame)
- [x] Add sprint speed multipliers (1.5x speed, 1.3x acceleration)
- [x] Implement dash/sprint integration (dash while sprinting, sprint continues after dash)
- [x] Update GameScene input handling for X key (dash) and Shift key (sprint)
- [x] **CRITICAL FIX**: Fixed double jump consumption bug during key holding
- [x] Added jump action consumption flag to prevent multiple jumps per key press
- [x] User testing completed and confirmed working

### Phase 3: Combat & Enemies (Week 3)
**Goal**: Engaging combat with varied enemy types

#### 3.1 Combat System Foundation
**Status**: ✅ COMPLETED (Phase 3.1 Combat Features)

**Tests Completed**:
- ✅ Hitbox/hurtbox creation and positioning
- ✅ Damage calculation and application  
- ✅ Knockback application with strong force
- ✅ Invincibility frames for enemies
- ✅ Melee attack hitboxes with proper sizing

**Sub-tasks**:
- ✅ Create Hitbox/Hurtbox components
- ✅ Implement melee attack system
- ✅ Add damage calculation
- ✅ Create knockback system (1000 force)
- ✅ Add invincibility frames
- ✅ Implement screen shake on enemy hit (8 intensity, 12 frames)
- ✅ Implement screen shake on player hit (12 intensity, 15 frames - stronger)

#### 3.1.1 Pogo Jumping (Combat-Movement Integration)
**Status**: ✅ COMPLETED

**Tests Completed**:
- ✅ Test downward attack input detection (DOWN + Z)
- ✅ Test downward attack hitbox creation
- ✅ Test pogo bounce velocity calculation
- ✅ Test pogo bounce on enemy/object hit
- ✅ Test pogo chain mechanics (infinite bounces)
- ✅ Test pogo success window timing
- ✅ Test pogo vs regular downward dash distinction
- ✅ Test upward attack input detection (UP + Z)
- ✅ Test attack dimension standardization (side 50x16, vertical 16x50)
- ✅ All 19 pogo mechanics tests passing, 4 positioning tests passing

**Sub-tasks**:
- ✅ Add DOWN + Z input combination detection in GameScene
- ✅ Create downward attack hitbox component (16x50 pixels below player)
- ✅ Implement pogo bounce mechanics (reset fall velocity, add upward force 400px/s)
- ✅ Add bounce target detection system (enemies with hurtboxes)
- ✅ Implement pogo chain potential (infinite bounces with timing)
- ✅ Add enhanced screen shake for successful pogo (10 intensity vs 8 regular)
- ✅ Test pogo integration with existing dash and combat systems
- ✅ Add pogo success window (10 frames after attack connects)
- ✅ Automatic pogo bounce detection when hitting enemies
- ✅ Add UP + Z upward attack functionality
- ✅ Standardize attack dimensions: side attacks 50x16, vertical attacks 16x50
- ✅ Update all sword visuals to match hitbox dimensions
- ✅ User testing completed and confirmed working

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
Focus on Phase 3.1: Combat System Foundation (hitbox/hurtbox system, melee attacks)
Note: Pogo jumping moved to Phase 3.1.1 as it requires combat system infrastructure

## Completed Phases
- ✅ Phase 1.1: Basic Game Setup
- ✅ Phase 1.2: Core Game Loop & Visual Output (21 tests passing)
- ✅ Phase 1.3: ECS Architecture Foundation (49 tests passing total)
- ✅ Phase 1.4: Input System with Buffering (67 tests passing total)
- ✅ Phase 2.1: Player Entity & Basic Movement (89 tests passing total)
- ✅ Phase 2.2: Enhanced Jumping System (108 tests passing total)
- ✅ Phase 2.3: Collision System with Critical Architecture Fixes (142 tests passing total)
- ✅ Phase 2.4: Advanced Movement with Dash & Sprint Mechanics (204 tests passing total)
- ✅ Phase 3.1: Combat System Foundation with Screen Shake (All combat features working)