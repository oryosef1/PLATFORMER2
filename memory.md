# Project Memory - Metroidvania Platformer

## Current Status
**Date**: 2025-06-19
**Phase**: Foundation Setup
**Last Updated**: Initial project setup

## Completed Features
- ✅ Project initialization with Vite + TypeScript + Phaser 3
- ✅ Basic project structure created
- ✅ Git setup with .gitignore
- ✅ Core configuration files (vite.config.ts, tsconfig.json)
- ✅ Package.json with proper scripts

## Current Work
- 🔄 Setting up project files (CLAUDE.md, memory.md, todo.md)
- 🔄 Creating initial Phaser game with visual output

## Project Structure
```
PLATFORMER/
├── CLAUDE.md          # AI instructions
├── memory.md          # This file - project memory
├── todo.md           # TDD-based task list
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
└── public/           # Static assets
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