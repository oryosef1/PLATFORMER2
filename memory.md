# Project Memory - Metroidvania Platformer

## Current Status
**Date**: 2025-06-21
**Phase**: Phase 3.1.1 Pogo Jumping - COMPLETED
**Last Updated**: Complete pogo jumping system with upward attacks and standardized attack dimensions (side 50x16, vertical 16x50), ready for Phase 3.2

## Completed Features
- ✅ Project initialization with Vite + TypeScript + Phaser 3
- ✅ Basic project structure created
- ✅ Git setup with .gitignore and initial commit
- ✅ Core configuration files (vite.config.ts, tsconfig.json)
- ✅ Package.json with proper scripts
- ✅ CLAUDE.md, memory.md, todo.md files created
- ✅ Basic Phaser game with colored rectangle player
- ✅ BootScene with loading screen and title (press SPACE to start)
- ✅ GameScene with player movement and platforms
- ✅ FPS counter and debug information
- ✅ Auto-reload working (no need to restart server on code changes)
- ✅ Game successfully running in browser with proper physics
- ✅ Comprehensive test suite with 21 passing tests (Phase 1.2)
- ✅ Critical testing philosophy and commit rules established
- ✅ **Phase 1.3 ECS Architecture Foundation - COMPLETED**
  - ✅ Entity class with component management (ID system, lifecycle)
  - ✅ IComponent interface for type safety
  - ✅ PositionComponent with utilities (distance, clone, serialization)
  - ✅ VelocityComponent with physics methods (normalize, scale, friction)
  - ✅ All 49 tests passing (15 component tests + 13 entity tests + 21 existing)
  - ✅ Arrow-only movement controls (removed WASD references)
- ✅ **Phase 1.4 Input System with Buffering - COMPLETED**
  - ✅ InputManager class with comprehensive keyboard input handling
  - ✅ 10-frame input buffer system for precise input timing
  - ✅ Input state management (justPressed, justReleased, held duration)
  - ✅ InputComponent for ECS entities with action mapping
  - ✅ Debug visualization support for input states
  - ✅ Extensive console debugging for troubleshooting
  - ✅ GameScene integration with dual input systems (Phaser + InputManager)
  - ✅ User testing completed and confirmed working
  - ✅ All 67 tests passing (18 input tests + 49 existing)
- ✅ **Phase 2.1 Player Entity & Basic Movement - COMPLETED**
  - ✅ PlayerEntity class with full ECS integration
  - ✅ Horizontal movement with acceleration and speed limits
  - ✅ Proper friction and air control systems
  - ✅ Gravity system with terminal velocity
  - ✅ Ground detection and collision response
  - ✅ Visual representation with physics body integration
  - ✅ Critical collision bug fixed (player no longer sinks into platforms)
  - ✅ All 89 tests passing (22 PlayerEntity tests + 67 existing)
  - ✅ User testing completed and confirmed working
- ✅ **Phase 2.2 Enhanced Jumping System - COMPLETED**
  - ✅ Variable jump height system (hold UP for 12 frames: 300-500 px/s scaling)
  - ✅ Coyote time system (6-frame grace period after leaving ground)
  - ✅ Jump buffering system (10-frame input window for smooth controls)
  - ✅ Double jump mechanics (UP+UP instead of UP+SPACE)
  - ✅ Jump state management and cancellation system
  - ✅ Input timing bug fixed (InputManager update order corrected)
  - ✅ Coyote time small jump issue resolved
  - ✅ Smart collision detection (side vs top platform detection)
  - ✅ Proper rendering depth (player appears on top of platforms)
  - ✅ All 108 tests passing (19 jump tests + 89 existing)
  - ✅ User testing completed and confirmed working
- ✅ **Phase 2.3 Collision System - COMPLETED**
  - ✅ CollisionComponent with AABB bounding boxes and tags
  - ✅ Advanced AABB collision detection with normal calculation
  - ✅ Collision response system with proper position/velocity resolution
  - ✅ Spatial hashing optimization for large numbers of entities (64px cells)
  - ✅ CollisionSystem class for managing all collision entities
  - ✅ Debug visualization system with collision box rendering
  - ✅ Entity tagging system for collision layers and filtering
  - ✅ Integration with existing ECS architecture
  - ✅ Player and Platform entities with collision components
  - ✅ GameScene updated to use new collision system (no more Phaser physics dependency)
  - ✅ **CRITICAL ARCHITECTURE FIXES**: Resolved double movement application and conflicting collision resolution
  - ✅ **STICKY MOVEMENT FIXED**: Eliminated slow/stuttering movement on platforms
  - ✅ **PLATFORM TUNNELING FIXED**: Cannot jump through platforms anymore, even near edges
  - ✅ Simplified collision system architecture for reliability and maintainability
  - ✅ All 142 tests passing (34 collision tests + 108 existing)
  - ✅ User testing completed and confirmed working
- ✅ **Phase 2.4 Advanced Movement - COMPLETED**
  - ✅ Wall detection system with left/right contact tracking
  - ✅ Wall sliding mechanics with consistent 60 px/s fall speed
  - ✅ Wall jumping system with proper directional velocity
  - ✅ Wall jump coyote time (6-frame grace period after leaving wall)
  - ✅ Wall jump control lockout (4 frames) and cooldown system (8 frames)
  - ✅ **Hollow Knight-style dash mechanics**: Facing-based dash direction (not input-based)
  - ✅ Dash system with cooldown (60 frames), duration (8 frames), and invincibility (6 frames)
  - ✅ Downward dash support (X+DOWN for downward dash like Dashmaster charm)
  - ✅ Sprint system with stamina management (300 frames max, drain rate 2/frame, regen 1/frame)
  - ✅ Sprint speed and acceleration multipliers (1.5x speed, 1.3x acceleration)
  - ✅ Dash and sprint integration (can dash while sprinting, sprint continues after dash)
  - ✅ **CRITICAL GAME DESIGN**: Wall interactions NEVER restore double jump (only ground landing)
  - ✅ **CRITICAL BUG FIX**: Fixed double jump consumption during key holding
  - ✅ Jump action consumption flag prevents multiple jumps per key press
  - ✅ All 204 tests passing (32 dash/sprint tests + 172 existing)
  - ✅ User testing completed and confirmed working

## Current Work  
- ✅ **Phase 3.1 Combat System Foundation - COMPLETED**
  - ✅ Hitbox/Hurtbox system with proper collision detection
  - ✅ Melee attack system with 40x16 hitbox (matches sword visual)
  - ✅ Damage calculation (15 damage per hit)
  - ✅ Strong knockback system (1000 force for dramatic impact)
  - ✅ Enemy invincibility frames (15 frames)
  - ✅ Screen shake on enemy hit (8 intensity, 12 frames duration)
  - ✅ Screen shake on player hit (12 intensity, 15 frames duration - stronger feedback)
  - ✅ Enemy damage flash visual feedback
  - ✅ Player invincibility flash visual feedback
  - ✅ All combat features working and tested
- ✅ **Phase 3.1.1 Pogo Jumping - COMPLETED**
  - ✅ Pogo jumping mechanics with DOWN + Z input combination
  - ✅ Downward attack hitbox creation positioned below player (16x50 dimensions)
  - ✅ Upward attack functionality with UP + Z input combination (16x50 dimensions)
  - ✅ Regular side attacks with proper dimensions (50x16 for horizontal reach)
  - ✅ Attack dimension standardization: side attacks 50x16, vertical attacks 16x50
  - ✅ Pogo bounce system with 400 px/s upward velocity
  - ✅ 10-frame success window after downward attack
  - ✅ Automatic pogo bounce on enemy hit detection
  - ✅ Pogo chain mechanics (infinite bounces with timing)
  - ✅ Integration with existing combat and movement systems
  - ✅ Enhanced screen shake for pogo hits (10 intensity vs 8 for regular hits)
  - ✅ Pogo target detection (works on enemies, not platforms)
  - ✅ All sword visuals updated to match hitbox dimensions
  - ✅ All 23 pogo/positioning tests passing (249 total tests)
- Ready to begin Phase 3.2: Enemy System

## Important Learnings - WSL2 Development & Vite Setup
1. **WSL2 Networking Issue**: WSL2 uses a virtual network adapter that doesn't always communicate well with Windows host
2. **Solution**: Run dev server from Windows PowerShell instead of WSL
3. **Steps to run**:
   - Use `powershell.exe -Command "cd C:\path; npm run dev"` from WSL
   - Or open PowerShell in Windows and run commands directly
4. **Key Fix**: Vite config should use `host: true` for better compatibility
5. **CRITICAL Vite File Structure**: 
   - **index.html MUST be in ROOT directory** for dev server to work
   - public/ folder is for static assets only
   - Had 404 errors until index.html was moved to root
6. **Build Process**: `npm run build` creates dist/ folder with production files

## Project Structure
```
PLATFORMER/
├── CLAUDE.md          # AI instructions
├── memory.md          # This file - project memory
├── todo.md           # TDD-based task list
├── index.html        # MAIN HTML FILE (required in root for Vite)
├── package.json      # Dependencies and scripts
├── vite.config.ts    # Vite configuration
├── tsconfig.json     # TypeScript configuration
├── src/
│   ├── main.ts       # Entry point
│   ├── core/         # Game core systems
│   ├── ecs/          # Entity Component System
│   ├── entities/     # Player, enemies
│   ├── physics/      # Physics systems
│   ├── scenes/       # Phaser scenes
│   ├── utils/        # Utilities
│   └── data/         # Game data
├── tests/            # Test files
└── public/           # Static assets (NO index.html here)
```

## Dependencies Installed
- **Runtime**: phaser@3.70.0
- **Dev**: vite, typescript, vitest, @playwright/test, @types/node, jsdom, canvas, @vitest/ui

## Test Coverage
- **249 tests passing** - comprehensive coverage of Phases 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, and 3.1.1
- **Game Logic Tests**: 13 tests covering dimensions, colors, positions, physics
- **FPS Tests**: 8 tests covering calculation logic, timing, and performance
- **ECS Component Tests**: 15 tests covering PositionComponent and VelocityComponent
- **ECS Entity Tests**: 13 tests covering Entity lifecycle and component management
- **Input System Tests**: 18 tests covering InputManager, buffer system, and InputComponent
- **Player Entity Tests**: 22 tests covering movement physics, gravity, ground detection, and collision
- **Jump System Tests**: 19 tests covering variable height, coyote time, buffering, double jump, and state management
- **Collision System Tests**: 34 tests covering AABB detection, collision response, spatial hashing, and collision normals
- **Wall Mechanics Tests**: 30 tests covering wall detection, sliding, jumping, and cooldown systems
- **Dash/Sprint Tests**: 32 tests covering Hollow Knight-style dash mechanics and sprint stamina management
- **Pogo Mechanics Tests**: 19 tests covering downward attacks, bounce mechanics, and chaining
- **Pogo Positioning Tests**: 4 tests covering hitbox positioning and visual synchronization
- **Test Strategy**: Simplified logic tests instead of complex Phaser mocking

## Key Decisions Made
1. **Framework**: Phaser 3 chosen for built-in physics and debugging tools
2. **Build Tool**: Vite for fast hot reload
3. **Testing**: Vitest + Playwright for comprehensive testing
4. **Architecture**: ECS pattern for flexibility and testability

## Next Priorities
1. Create comprehensive todo.md with TDD approach
2. Implement basic Phaser game with colored rectangle
3. Setup hot reload functionality
4. Begin ECS foundation with tests

## Issues/Blockers
None currently.

## CRITICAL TESTING PHILOSOPHY
**NEVER DOWNGRADE TESTS TO MAKE THEM PASS - ALWAYS FIX THE PROBLEMS**
- Goal is to make the GAME work correctly, not make tests green
- Tests are tools to help build the game right
- If tests fail, fix the implementation, never weaken the tests
- Failing tests reveal real problems that need solving

## CRITICAL COMMIT RULES
**NEVER COMMIT UNTIL ALL TESTS PASS AND USER CONFIRMS IT WORKS**
- ALL tests must be green before any commit
- User must see and confirm changes work in browser
- No exceptions - quality over speed
- Broken commits destroy project integrity

## USER TESTING COMMUNICATION PROTOCOL
**ALWAYS INFORM USER WHAT TO TEST WHEN REQUESTING CONFIRMATION**
- Clearly explain what was added or changed in this implementation
- Provide specific testing instructions for what the user should verify
- List expected behaviors and what to look for in the browser
- Include any new console output or debug information to check
- Mention any new controls, features, or visual elements to test

## CRITICAL REGRESSION PREVENTION
**ALWAYS RUN ALL TESTS AFTER ANY FEATURE/CHANGE**
- After making any feature and confirming it works
- After any code change, no matter how small
- Run full test suite to ensure nothing was broken
- Regressions are harder to fix than preventing them
- One broken feature can cascade to break others

## Notes
- Following game-plan.md and make-movement-good.md specifications
- Emphasizing TDD approach with tests before features
- Visual feedback priority for immediate development feedback
- To run dev server: Use Windows PowerShell with `npm run dev`
- Game features working: 
  - Red rectangle player with ECS-based movement
  - Advanced movement physics (acceleration, friction, air control)
  - Gravity system with terminal velocity
  - Proper collision detection and ground state management
  - Green platforms for collision testing
  - Debug info showing position, velocity, and ground state
  - FPS counter
  - Title screen with SPACE to start
  - Input system with extensive console debugging
  - Real-time input state display in game
  - 10-frame input buffering for precise controls

## Console Debugging Features
- Key press/release detection with frame numbers
- Input buffer tracking and management
- Movement state logging
- Flag clearing notifications
- Real-time active/buffered input display
- Player movement physics debugging (position, velocity, ground state)
- Collision detection logging

## Critical Issues Resolved
### Phase 2.1 Collision Detection Bug
**Problem**: Player was sinking into platforms due to ECS and Phaser physics conflict
- ECS system continued applying gravity and position updates
- Phaser collision detection fired but only set ground state
- Created infinite loop: player simultaneously "on ground" and "sinking through ground"

**Solution**: Position correction on air-to-ground transition
- Only correct position when transitioning from air to ground (`!wasGrounded && velocity.y > 0`)
- Calculate exact platform surface position
- Update ECS position to match corrected position
- Removed physics body bounce (setBounce(0)) to prevent micro-shake
- Result: Smooth landing with minimal acceptable shake

### Phase 2.2 Critical Issues Resolved
**Problem**: Multiple jumping system issues after initial implementation
1. **Input Timing Bug**: InputManager.update() called before jump input detection
   - Jump input flags cleared before they could be used
   - **Solution**: Capture input states before calling inputManager.update()

2. **Coyote Time Small Jumps**: Coyote time jumps used minimum velocity only
   - **Solution**: Use proper jump velocity scaling for all jump types

3. **Variable Jump Height Not Working**: Hold vs tap produced same results
   - **Solution**: Redesigned updateJump() to properly handle key press duration

4. **Platform Teleportation Bug**: Player teleported to platform top when hitting sides
   - **Solution**: Smart collision detection with geometric checks for top vs side hits

5. **Rendering Order Issue**: Player rendered behind platforms
   - **Solution**: Set depth values (platforms=0, player=100)

6. **Double Jump Controls**: User wanted UP+UP instead of UP+SPACE
   - **Solution**: Modified jump logic to try double jump if regular jump fails

**Result**: All jumping mechanics working perfectly with 108 tests passing

### Phase 2.3 Critical Collision System Architecture Issues
**Problem**: Multiple severe architectural issues causing sticky movement and platform tunneling
1. **Double Movement Application**: Movement applied twice per frame (CollisionSystem + GameScene)
2. **Conflicting Resolution Systems**: Three different collision resolution methods fighting each other
3. **Swept Collision Bugs**: Incorrect positioning causing overshooting and tunneling
4. **Complex Validation**: Over-engineered validation logic running too late to be effective

**Root Cause Analysis**: 
- CollisionSystem.update() applied `velocity * deltaTime` to position (first movement)
- GameScene called collision system, which had already moved entities (second movement)
- Three resolution systems: CollisionSystem.resolveCollision(), CollisionSystem.resolveSweptCollision(), and GameScene validation
- Systems fought each other: one would move player, another would reject/undo the movement
- Result: Stuttering, sticky movement, position corrections, and platform tunneling

**Solution Strategy**: **Architectural Simplification**
- **Single Movement Application**: Only GameScene applies movement, CollisionSystem only detects
- **Single Resolution Path**: Only GameScene handles collision resolution, eliminated complex swept collision
- **Clear Sequence**: Move → Detect → Resolve → Done
- **Simplified Detection**: Removed edge thresholds and complex validation logic

**Technical Implementation**:
1. **Removed double movement** from CollisionSystem.update() lines 37-48
2. **Centralized movement** in GameScene: apply movement first, then detect collisions
3. **Simplified resolution**: Basic overlap correction with clear collision type handling
4. **Eliminated conflicts**: Removed swept collision and multiple resolution paths

**Result**: 
- **Sticky movement eliminated**: Smooth, responsive player movement on all surfaces
- **Platform tunneling fixed**: Cannot jump through platforms even near edges  
- **Architecture simplified**: 300+ lines of complex code → 50 lines of reliable code
- **Maintainability improved**: Single, clear collision handling path
- **All 142 tests passing**: No regressions, improved reliability

### Phase 2.4 Wall Mechanics Implementation Issues and Fixes
**Problem**: Multiple wall mechanics bugs affecting wall sliding and wall jumping
1. **Wall slide falling at regular speed**: Gravity was overriding wall slide deceleration
2. **Wall slide restoring double jump**: Wall contact was incorrectly restoring double jump
3. **Wall jump spam exploits**: Various cooldown and timing issues allowing infinite wall jumps
4. **Fundamental misunderstanding**: Initial implementation had wall jumps restore double jump

**Root Cause Analysis**: 
- Gravity system (16.33 px/frame) was conflicting with wall slide speed control
- Wall contact logic was treating wall interaction as equivalent to ground landing
- Missing cooldown systems allowed wall jump spam between close walls
- Incorrect game design assumption about double jump restoration

**Solution Strategy**: **Targeted Fixes with Clear Game Rules**
- **Gravity Exemption**: Modified `applyGravity()` to skip when wall sliding
- **Double Jump Consumption**: Wall sliding consumes double jump instead of restoring it
- **Consistent Speed Control**: Wall slide always sets velocity to exactly 60 px/s
- **Cooldown Systems**: Added wall jump cooldown (8 frames) and control lockout (4 frames)
- **Clear Game Rule**: Only ground landing restores double jump, never wall interactions

**Technical Implementation**:
1. **Wall Slide Speed**: Always set `velocity.y = WALL_SLIDE_SPEED` during wall slide
2. **Double Jump Rule**: Wall jumps NEVER restore double jump (lines 376-377 in PlayerEntity.ts)
3. **Cooldown Prevention**: Added `wallJumpCooldownFrames` check to `canWallJump()` and `startDoubleJump()`
4. **Coyote Time**: 6-frame grace period for wall jumps after leaving wall
5. **Control Lockout**: 4-frame horizontal input lockout after wall jump

**Result**: 
- **Wall slide mechanics working**: Consistent 60 px/s fall speed when pressing towards wall
- **Wall jump exploits eliminated**: No more infinite wall jumps or double jump spam
- **Clear game rules**: Only ground landing restores double jump, creating strategic depth
- **Smooth wall-to-wall movement**: Proper timing prevents sticky or erratic behavior
- **All 172 tests passing**: Comprehensive coverage with no regressions

### Phase 2.4 Critical Double Jump Input Bug
**Problem**: Double jump being consumed during variable jump height key holding
- When holding UP for variable jump height, input system triggered multiple "just pressed" events
- System executed both ground jump AND double jump from single key press
- Double jump became unavailable immediately after first jump

**Root Cause Analysis**: 
- Input detection logic checked both InputManager and Phaser.Input.Keyboard with OR logic
- Multiple input systems caused duplicate "just pressed" detection during key hold
- No mechanism to prevent multiple jump actions per key press sequence

**Solution Strategy**: **Jump Action Consumption Flag**
- Added `jumpActionConsumed` boolean flag to PlayerEntity
- Jump actions (ground jump, double jump, wall jump) set this flag when executed
- Jump input logic only processes if flag hasn't been set yet
- Flag resets when UP key is released

**Technical Implementation**:
1. **Added jumpActionConsumed flag** to PlayerEntity for tracking jump action state
2. **Modified GameScene input logic** to check `!hasJumpActionBeenConsumed()` before processing
3. **Updated all jump methods** to set consumption flag when executed
4. **Added flag reset** on UP key release to allow next jump sequence

**Result**: 
- **Single jump per key press**: Each UP key press sequence only triggers one jump action
- **Variable jump height preserved**: Can still hold UP for higher jumps without consuming double jump
- **Double jump requires separate press**: Must release and press UP again for double jump
- **All 204 tests passing**: No regressions, improved input reliability