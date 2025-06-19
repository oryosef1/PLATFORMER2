# The Ultimate Guide to Implementing Amazing Movement and Combat Systems

Based on deep technical analysis of Celeste, Hollow Knight, and Dead Cells, this comprehensive guide provides exact implementation details for creating movement and combat systems that feel incredible to play.

## Core Movement Physics Framework

### Building Your Physics Foundation

Start with Celeste's proven integer-locked collision system combined with floating-point movement tracking. This approach eliminates precision issues while maintaining smooth motion:

```csharp
// Core physics constants (Celeste-inspired)
const float GRAVITY = 900f;
const float MAX_FALL = 160f;         // Terminal velocity
const float MAX_RUN = 90f;           // Ground speed
const float RUN_ACCEL = 1000f;       // Acceleration  
const float RUN_REDUCE = 400f;       // Deceleration
const float AIR_MULT = 0.65f;        // Air control
const float JUMP_H_BOOST = 40f;      // Jump horizontal boost
```

**Key Implementation Details:**
- Separate X and Y movement processing
- Use micro-stepping for collision detection
- Track movement remainders for subpixel precision
- Implement state machine architecture for player states

### Essential Movement Feel Mechanics

**Input Buffering System** (Critical for responsiveness):
- Jump buffer: 5-8 frames
- Dash/ability buffer: 5 frames  
- Attack buffer: 8 frames minimum
- Store buffered inputs with timestamp

**Coyote Time** (Forgiveness mechanics):
- 5 frames after leaving platform edge
- Reset on wall touch or enemy bounce
- Essential for precise platforming feel

**Corner Correction**:
- 4 pixels of automatic push-around
- Prevents frustrating near-misses
- Apply during collision resolution

## Advanced Movement Systems

### Variable Jump Implementation

Celeste and Hollow Knight both use hold-to-jump-higher mechanics:
- Minimum jump: ~3 tiles
- Maximum jump: ~8 tiles  
- Jump release window: 12 frames
- Apply reduced gravity during rise when button held

### Dash/Air Dash System

**Celeste's Dash Values:**
- Duration: 15 frames (4 freeze + 10 movement + 1 end)
- Speed: 240 absolute (169.7 per axis diagonal)
- Cooldown: 15 frames from start
- Direction lock: Frame 5 (4-frame redirect window)
- Ground refill: 10 frames after dash start

**Hollow Knight's Dash:**
- Base cooldown: 0.6 seconds (36 frames)
- Fixed horizontal distance
- Refreshes on: landing, nail bounce, wall cling

### Wall Mechanics

Combine both games' approaches:
- **Stamina system**: 110 initial, depletes with movement
- **Wall jump**: 130 horizontal, -105 vertical velocity
- **Auto-grab**: When dashing into walls
- **Wall slide**: ~60-80 pixels/second

## Combat Feel Implementation

### Screen Shake System (Dead Cells Style)

**Technical Implementation:**
```csharp
// Weapon-specific shake values
Dictionary<WeaponType, ShakeParams> shakeValues = new() {
    { WeaponType.Light, new ShakeParams(2f, 0.1f) },
    { WeaponType.Heavy, new ShakeParams(5f, 0.2f) },
    { WeaponType.Critical, new ShakeParams(8f, 0.3f) }
};

// Apply on both hit AND miss for weight
void TriggerWeaponShake(WeaponType type, bool isHit) {
    var shake = shakeValues[type];
    if (isHit) shake.intensity *= 1.5f;
    camera.Shake(shake);
}
```

**Important**: Include accessibility options to reduce/disable shake

### Hit Stop/Pause Implementation

**Frame-perfect combat feedback:**
- Light attacks: 2-3 frames pause
- Heavy attacks: 4-6 frames pause
- Critical hits: 8-10 frames pause
- Apply to both attacker and target
- Scale with damage dealt

### Attack Feel Mechanics

**Hollow Knight's Nail Bounce System:**
- Trigger: Down attack connects before landing
- Bounce velocity: Resets fall, adds upward force
- Chain potential: Infinite with proper timing
- Success window: Increases with range upgrades

**Dead Cells' Recovery System:**
- 80% of damage becomes recoverable
- 0.08 second delay before drain
- Drain rate: 30% max health/second
- Recovered by dealing damage

### Enemy Reaction Systems

**Breach System (Dead Cells):**
- Threshold: 100+ breach damage causes stun
- Decay: 20 points/second at tier 1
- Scaling: Increases with enemy tier
- Bonus breach for: heavy weapons, combo finishers

**Knockback Values:**
- Light: 50-100 units
- Medium: 100-200 units  
- Heavy: 200-400 units
- Scale with weapon type and enemy weight

## Animation and Visual Feedback Pipeline

### Pose-to-Pose Animation (Dead Cells Method)

1. **Key Poses Only**: Design attacks as 2-3 key poses
2. **VFX for Motion**: Use particles/trails for movement feel
3. **No Interpolation Between**: Only ease in/out of poses
4. **Frame Triggers**: Attach effects to specific frames

### Particle System Integration

**Attack Impact Particles:**
- Trigger on: animation frame, collision, critical hit
- Layer multiple systems: sparks + dust + weapon trail
- Scale with: weapon type, damage dealt, hit location
- Performance: Limit to 10-20% density on low-end

### Visual Feedback Layers

For every attack, combine:
1. **Animation** (pose change)
2. **VFX** (particles, trails)
3. **Screen shake** (camera offset)
4. **Hit pause** (time freeze)
5. **Sound** (synchronized)
6. **Enemy reaction** (knockback, flash)

## State Machine Architecture

### Player State Management

```csharp
enum PlayerState {
    Normal, Dash, Attack, WallSlide, 
    AirAttack, Hurt, Dead
}

class PlayerStateMachine {
    // Transition rules
    Dictionary<PlayerState, List<PlayerState>> validTransitions;
    
    // State-specific update logic
    void UpdateState() {
        switch(currentState) {
            case PlayerState.Dash:
                // Can transition to: Attack, Normal, WallSlide
                // Cannot transition to: Dash (until cooldown)
                break;
        }
    }
}
```

### Combat State Handling

**Attack Chains:**
- Store combo counter
- Reset after: timeout (30 frames), different attack, taking damage
- Allow dodge-cancel windows between attacks
- Preserve combo through rolls (Dead Cells style)

## Performance Optimization

### Unity-Specific (Hollow Knight Style)

- Use Unity 2D physics with fixed timestep
- Sprite batching for performance
- Simple shaders (sprite_default)
- Particle pooling system
- Frame-by-frame animation as sprite sheets

### General Optimization

- **Collision**: Spatial partitioning for enemy checks
- **Effects**: LOD system for particles/shakes
- **Update Order**: Physics → Input → Animation → Rendering
- **Frame Budget**: 60fps minimum, test at 144fps+

## Tuning Guidelines

### Movement Tuning Priority

1. **Get basic movement smooth** (run, jump)
2. **Add dash with proper timing**
3. **Implement buffering/coyote time**
4. **Add advanced techniques** (emerge from basics)
5. **Test with speedrunners** (they'll find everything)

### Combat Feel Tuning

1. **Start with one weapon type**
2. **Layer feedback systems one at a time**
3. **Get frame data exact** (record and analyze)
4. **Add enemy reactions**
5. **Implement combo systems**
6. **Polish with particles/sound**

### Critical Success Factors

**From Celeste:**
- Exact frame timing (no approximations)
- Input forgiveness without compromising precision
- Emergent complexity from simple rules

**From Hollow Knight:**
- Responsive controls with minimal lag
- Clear visual feedback for all actions
- Meaningful upgrade progression

**From Dead Cells:**
- Layered feedback reinforcement
- Weapon-specific everything
- Risk/reward mechanics encourage aggression

## Testing and Iteration

### Debug Visualization Tools

Essential debug displays:
- Hitbox/hurtbox rendering
- State machine visualization  
- Frame counter overlay
- Input buffer display
- Velocity vectors
- Collision points

### Playtesting Focus Areas

1. **First 5 minutes**: Is basic movement fun?
2. **Advanced techniques**: Can players discover them?
3. **Combat rhythm**: Does it flow naturally?
4. **Feedback clarity**: Can players read what's happening?
5. **Accessibility**: Test with various player abilities

## Conclusion

Creating movement and combat that feels amazing requires obsessive attention to timing, layered feedback systems, and constant iteration. Start with these exact values as a foundation, but remember that the magic comes from tuning everything to work together as a cohesive whole. The best games make complex systems feel simple through careful design and relentless polish.