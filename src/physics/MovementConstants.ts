/**
 * Movement constants for platformer physics
 * Based on analysis of Celeste and Hollow Knight movement feel
 */
export class MovementConstants {
  // Horizontal Movement
  public static readonly ACCELERATION_GROUND = 800; // pixels/second²
  public static readonly ACCELERATION_AIR = 600; // pixels/second²
  public static readonly MAX_SPEED_GROUND = 200; // pixels/second
  public static readonly MAX_SPEED_AIR = 180; // pixels/second
  
  // Friction and Deceleration
  public static readonly FRICTION_GROUND = 0.85; // velocity retention per frame
  public static readonly FRICTION_AIR = 0.95; // less friction in air
  public static readonly DECELERATION_GROUND = 1200; // pixels/second² when stopping
  
  // Air Control
  public static readonly AIR_CONTROL_FACTOR = 0.75; // 75% control in air
  
  // Gravity
  public static readonly GRAVITY = 980; // pixels/second² (earth-like)
  public static readonly TERMINAL_VELOCITY = 500; // max fall speed
  
  // Jumping System
  public static readonly MIN_JUMP_VELOCITY = 300; // minimum jump speed (pixels/second)
  public static readonly MAX_JUMP_VELOCITY = 500; // maximum jump speed (pixels/second)
  public static readonly DOUBLE_JUMP_VELOCITY = 450; // double jump speed (pixels/second)
  public static readonly JUMP_HOLD_FRAMES = 12; // frames to hold for max jump (0.2 seconds at 60fps)
  public static readonly COYOTE_TIME_FRAMES = 6; // frames of grace period after leaving ground
  public static readonly JUMP_BUFFER_FRAMES = 10; // frames to buffer jump input
  
  // Player Dimensions
  public static readonly PLAYER_WIDTH = 32; // pixels
  public static readonly PLAYER_HEIGHT = 48; // pixels
  
  // Visual
  public static readonly PLAYER_COLOR = 0xe74c3c; // red color
  
  // Physics Timing (60fps)
  public static readonly FIXED_TIMESTEP = 1/60; // 16.67ms per frame
  
  // Movement Thresholds
  public static readonly MIN_MOVEMENT_THRESHOLD = 0.1; // minimum velocity to consider "moving"
  public static readonly STOP_THRESHOLD = 0.5; // velocity below this stops the player
  
  // Wall Mechanics
  public static readonly WALL_SLIDE_SPEED = 60; // pixels/second (slow slide down walls)
  public static readonly WALL_SLIDE_ACCELERATION = 240; // pixels/second² (how fast we reach slide speed)
  public static readonly WALL_JUMP_HORIZONTAL_VELOCITY = 250; // pixels/second (push away from wall)
  public static readonly WALL_JUMP_VERTICAL_VELOCITY = 400; // pixels/second (upward velocity)
  public static readonly WALL_JUMP_CONTROL_LOCKOUT_FRAMES = 4; // frames where horizontal input is ignored after wall jump
  public static readonly WALL_DETECTION_OFFSET = 2; // pixels to check for wall proximity
  public static readonly WALL_COYOTE_TIME_FRAMES = 6; // frames of grace period after leaving wall
  
  // Dash Mechanics
  public static readonly DASH_DISTANCE = 120; // pixels (distance covered in ground dash)
  public static readonly DASH_DURATION_FRAMES = 8; // frames dash lasts (about 0.13 seconds)
  public static readonly DASH_VELOCITY = 900; // pixels/second (calculated: 120px / (8 * 1/60)s = 900px/s)
  public static readonly DASH_COOLDOWN_FRAMES = 60; // frames before dash can be used again (1 second)
  public static readonly DASH_INVINCIBILITY_FRAMES = 6; // frames of invincibility during dash
  
  // Air Dash Mechanics (shorter, more controlled air movement)
  public static readonly AIR_DASH_DISTANCE = 100; // pixels (increased from 70 for better mobility)
  public static readonly AIR_DASH_DURATION_FRAMES = 8; // frames air dash lasts (increased from 7)
  public static readonly AIR_DASH_VELOCITY = 750; // pixels/second (calculated: 100px / (8 * 1/60)s = 750px/s)
  
  // Sprint Mechanics
  public static readonly SPRINT_SPEED_MULTIPLIER = 1.5; // 150% of normal speed when sprinting
  public static readonly SPRINT_ACCELERATION_MULTIPLIER = 1.3; // 130% acceleration when sprinting
  public static readonly SPRINT_STAMINA_MAX = 300; // frames of max stamina (5 seconds)
  public static readonly SPRINT_STAMINA_DRAIN_RATE = 2; // stamina points drained per frame while sprinting
  public static readonly SPRINT_STAMINA_REGEN_RATE = 1.5; // stamina points restored per frame when not sprinting
  public static readonly SPRINT_MIN_STAMINA = 10; // minimum stamina needed to start sprinting (reduced for smoother restart)
  
  // Combat Mechanics
  public static readonly ATTACK_COOLDOWN_FRAMES = 15; // frames between attacks (0.25 seconds at 60fps)
  
  // Pogo Jumping Mechanics
  public static readonly POGO_BOUNCE_FORCE = 400; // pixels/second upward velocity on pogo bounce
  public static readonly POGO_SUCCESS_WINDOW_FRAMES = 10; // frames after downward attack where pogo bounce is available
  public static readonly POGO_ATTACK_DURATION_FRAMES = 4; // frames pogo hitbox is active (faster than normal attack)
  public static readonly POGO_COOLDOWN_FRAMES = 8; // frames before pogo can be used again (0.13 seconds at 60fps) - faster for chaining
}

console.log('[PHYSICS] MovementConstants loaded:', {
  groundAccel: MovementConstants.ACCELERATION_GROUND,
  maxSpeed: MovementConstants.MAX_SPEED_GROUND,
  gravity: MovementConstants.GRAVITY,
  playerSize: `${MovementConstants.PLAYER_WIDTH}x${MovementConstants.PLAYER_HEIGHT}`
});