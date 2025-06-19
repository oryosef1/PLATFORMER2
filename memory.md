# Project Memory - Metroidvania Platformer

## Current Status
**Date**: 2025-06-19
**Phase**: Foundation Complete - Phase 1.2 ✅
**Last Updated**: Game running successfully from Windows

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
- ✅ Hot reload working (dev server running on localhost:3000)
- ✅ Game successfully running in browser with proper physics

## Current Work
- Ready to begin Phase 1.3: ECS Architecture Foundation

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
- **Dev**: vite, typescript, vitest, @playwright/test, @types/node

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

## Notes
- Following game-plan.md and make-movement-good.md specifications
- Emphasizing TDD approach with tests before features
- Visual feedback priority for immediate development feedback
- To run dev server: Use Windows PowerShell with `npm run dev`
- Game features working: 
  - Red rectangle player with arrow key movement
  - Jump mechanics with gravity
  - Green platforms for collision
  - Debug info showing position
  - FPS counter
  - Title screen with SPACE to start