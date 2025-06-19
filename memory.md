# Project Memory - Metroidvania Platformer

## Current Status
**Date**: 2025-06-19
**Phase**: Phase 2.2 Enhanced Jumping System - COMPLETED ✅
**Last Updated**: Enhanced jumping system complete with all 108 tests passing

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

## Current Work
- Ready to begin Phase 2.3: Collision System

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
- **108 tests passing** - comprehensive coverage of Phases 1.2, 1.3, 1.4, 2.1, and 2.2
- **Game Logic Tests**: 13 tests covering dimensions, colors, positions, physics
- **FPS Tests**: 8 tests covering calculation logic, timing, and performance
- **ECS Component Tests**: 15 tests covering PositionComponent and VelocityComponent
- **ECS Entity Tests**: 13 tests covering Entity lifecycle and component management
- **Input System Tests**: 18 tests covering InputManager, buffer system, and InputComponent
- **Player Entity Tests**: 22 tests covering movement physics, gravity, ground detection, and collision
- **Jump System Tests**: 19 tests covering variable height, coyote time, buffering, double jump, and state management
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