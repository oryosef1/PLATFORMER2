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