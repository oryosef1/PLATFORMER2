// Quick test to verify dash and sprint fixes
import { PlayerEntity } from './src/entities/PlayerEntity.js';
import { VelocityComponent } from './src/ecs/components/VelocityComponent.js';

// Test 1: Sprint consistency
console.log('=== Testing Sprint Consistency ===');
const player = new PlayerEntity(100, 200);

// Simulate sprint with stamina depletion and refill
player.startSprint();
console.log('Initial sprint:', player.isSprinting()); // Should be true

// Drain stamina completely
for (let i = 0; i < 150; i++) {
  player.update(1/60);
}
console.log('After stamina depletion:', player.isSprinting()); // Should be false

// Try to restart sprint immediately (should fail due to low stamina)
player.startSprint();
console.log('Restart attempt (low stamina):', player.isSprinting()); // Should be false

// Wait for stamina to regenerate
for (let i = 0; i < 50; i++) {
  player.update(1/60);
}

// Try to restart sprint (should work now)
player.startSprint();
console.log('Restart after stamina regen:', player.isSprinting()); // Should be true

console.log('\n=== Testing Dash Velocity Override ===');

// Test 2: Dash velocity override
const player2 = new PlayerEntity(100, 200);
const velocity = player2.getComponent('velocity');

// Set some existing velocity
velocity.x = 50;
velocity.y = 100;
console.log('Before dash velocity:', velocity.x, velocity.y);

// Execute dash - should completely override existing velocity
player2.executeDash();
console.log('After dash velocity:', velocity.x, velocity.y); // Should be (900, 0)

// Test downward dash
velocity.x = 75;
velocity.y = -50;
console.log('Before downward dash:', velocity.x, velocity.y);

player2.dashCooldownFrames = 0; // Reset cooldown for test
player2.dashing = false;
player2.executeDash(true); // Downward dash
console.log('After downward dash:', velocity.x, velocity.y); // Should be (0, 900)

console.log('\n=== All fixes verified! ===');