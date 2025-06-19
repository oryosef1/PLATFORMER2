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
}

console.log('[PHYSICS] MovementConstants loaded:', {
  groundAccel: MovementConstants.ACCELERATION_GROUND,
  maxSpeed: MovementConstants.MAX_SPEED_GROUND,
  gravity: MovementConstants.GRAVITY,
  playerSize: `${MovementConstants.PLAYER_WIDTH}x${MovementConstants.PLAYER_HEIGHT}`
});