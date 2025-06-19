# Claude AI Instructions for Metroidvania Platformer Game

## Core Instructions
You are Claude, an AI assistant helping to build a challenging 2D Metroidvania platformer game. You MUST read and follow these instructions at the start of every conversation.

## Required Actions at Start of Each Conversation
1. **ALWAYS** read `memory.md` first to understand the current project state
2. **ALWAYS** read `todo.md` to see the current tasks and priorities
3. **ALWAYS** update `memory.md` with new information as you work
4. **ALWAYS** update `todo.md` when completing tasks or discovering new requirements

## Project Overview
- **Game Type**: Ultra-challenging 2D Metroidvania (harder than Hollow Knight)
- **Tech Stack**: Phaser 3, TypeScript, Vite, Vitest
- **Architecture**: ECS (Entity Component System) with Hierarchical State Machines
- **Visual Style**: Geometric shapes (rectangles, circles) initially
- **Platform**: Web browser (HTML5 Canvas)
- **Development Approach**: Test-Driven Development (TDD)

## Development Philosophy
- **TDD First**: Write tests BEFORE implementing features
- **Immediate Visual Feedback**: Every change should be visible in browser
- **Incremental Progress**: Build one small feature at a time
- **Quality Over Speed**: Ensure each feature is solid before moving on

## File Management Rules
### memory.md
- Contains current project state, decisions made, and discoveries
- Update after every significant change or decision
- Include: completed features, current issues, architectural decisions

### todo.md
- Contains the complete development plan with phases
- Each task must have sub-tasks for easier implementation
- Include test requirements for each feature (TDD approach)
- Update task status as work progresses

## Key Technical Constraints
- Use Phaser 3.70.0 with Arcade Physics
- TypeScript strict mode enabled
- 60fps target performance
- Hot reload for development
- Visual debugging tools for collision boxes, states, etc.

## Code Quality Standards
- Write tests first (TDD)
- Use ECS architecture pattern
- Implement proper state machines for player/enemies
- Include debug visualization for all systems
- Comment complex physics calculations
- Use TypeScript interfaces for all data structures

## Physics Implementation Requirements
Based on Celeste/Hollow Knight analysis:
- Fixed timestep game loop (60fps)
- Separate X/Y movement processing
- Input buffering (5-10 frames)
- Coyote time (6 frames)
- Variable jump heights
- Proper collision detection with swept AABB

## Testing Strategy
- Unit tests for pure functions (physics, calculations)
- Integration tests for system interactions
- Visual regression tests for rendering
- Performance tests to maintain 60fps

## CRITICAL TESTING PHILOSOPHY
**NEVER DOWNGRADE TESTS TO MAKE THEM PASS - ALWAYS FIX THE PROBLEMS**
- Goal is to make the GAME work correctly, not make tests green
- Tests are tools to help build the game right
- If tests fail, fix the implementation, never weaken the tests
- Failing tests reveal real problems that need solving
- Tests protect game quality and prevent regressions

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

## Debug Tools Required
- Collision box visualization
- State machine display
- Input buffer visualization
- Performance profiler
- Frame-by-frame stepping

## Remember
- Always prioritize getting something visual working first
- Test every feature thoroughly before moving to next
- Update memory.md and todo.md consistently
- Focus on tight, responsive controls above all else

## Development Environment Notes
- **Auto-Render**: Vite has auto-reload enabled - no need to restart server after code changes
- **Dev Server**: Game automatically updates in browser when files are saved
- **Control Scheme**: Movement is ONLY with arrow keys (no WASD support)
- **Console Debugging**: Always include extensive console.log output for debugging
- **Debug Feedback**: Log key presses, state changes, and system events to console for troubleshooting