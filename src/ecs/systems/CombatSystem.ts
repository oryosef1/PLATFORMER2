import { Entity } from '../Entity';
import { HitboxComponent } from '../components/HitboxComponent';
import { HurtboxComponent } from '../components/HurtboxComponent';
import { PositionComponent } from '../components/PositionComponent';
import { VelocityComponent } from '../components/VelocityComponent';

export interface CombatResult {
  attacker: Entity;
  target: Entity;
  damage: number;
  knockback: { x: number; y: number };
  isCritical: boolean;
}

export class CombatSystem {
  private entities: Entity[] = [];

  public addEntity(entity: Entity): void {
    if (entity.hasComponent('hitbox') || entity.hasComponent('hurtbox')) {
      this.entities.push(entity);
      console.log(`[COMBAT] Added entity to combat system: ${entity.id}`);
    }
  }

  public removeEntity(entity: Entity): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      console.log(`[COMBAT] Removed entity from combat system: ${entity.id}`);
    }
  }

  public update(): CombatResult[] {
    const combatResults: CombatResult[] = [];

    // Update all hitboxes and hurtboxes
    for (const entity of this.entities) {
      const hitbox = entity.getComponent<HitboxComponent>('hitbox');
      const hurtbox = entity.getComponent<HurtboxComponent>('hurtbox');
      const position = entity.getComponent<PositionComponent>('position');

      if (hitbox && position) {
        // Don't update hitbox position if it's a melee or pogo attack - these hitboxes have their own offset positioning handled by PlayerEntity
        if (hitbox.attackType !== 'melee' && hitbox.attackType !== 'pogo') {
          // Only update position for projectiles and other moving hitboxes
          hitbox.updatePosition(position.x, position.y);
        }
        hitbox.update();
      }

      if (hurtbox && position) {
        // Update hurtbox position to match entity
        hurtbox.updatePosition(position.x, position.y);
        hurtbox.update();
      }
    }

    // Check for hitbox vs hurtbox collisions
    for (const attackerEntity of this.entities) {
      const hitbox = attackerEntity.getComponent<HitboxComponent>('hitbox');
      if (!hitbox || !hitbox.active) continue;

      for (const targetEntity of this.entities) {
        if (attackerEntity === targetEntity) continue;

        const hurtbox = targetEntity.getComponent<HurtboxComponent>('hurtbox');
        if (!hurtbox || !hurtbox.vulnerable || hurtbox.isDead()) continue;

        // Check if target is an enemy with dead AI state - dead enemies cannot be damaged
        const targetAI = targetEntity.getComponent('enemyAI') as any;
        if (targetAI && targetAI.state === 'dead') {
          console.log(`[COMBAT_DEBUG] Skipping dead enemy ${targetEntity.id} (AI state: dead)`);
          continue;
        }

        // Don't allow self-damage (same owner)
        if (hitbox.owner === hurtbox.owner) continue;

        // Check if this target has already been hit by this hitbox
        if (hitbox.hitTargets.has(targetEntity.id)) {
          console.log(`[COMBAT_DEBUG] Target ${targetEntity.id} already hit by this attack`);
          continue;
        }

        // Check for collision
        const hitboxAABB = hitbox.getAABB();
        const hurtboxAABB = hurtbox.getAABB();
        console.log(`[COMBAT_DEBUG] Checking collision between ${attackerEntity.id} and ${targetEntity.id}:`);
        console.log(`[COMBAT_DEBUG] Hitbox active: ${hitbox.active}, duration: ${hitbox.duration}/${hitbox.maxDuration}`);
        console.log(`[COMBAT_DEBUG] Hurtbox vulnerable: ${hurtbox.vulnerable}, health: ${hurtbox.currentHealth}/${hurtbox.maxHealth}`);
        
        if (this.checkCollision(hitboxAABB, hurtboxAABB)) {
          console.log(`[COMBAT_DEBUG] Collision detected! Processing combat...`);
          const combatResult = this.processCombat(attackerEntity, targetEntity, hitbox, hurtbox);
          if (combatResult) {
            combatResults.push(combatResult);
          }
        } else {
          console.log(`[COMBAT_DEBUG] No collision detected`);
        }
      }
    }

    return combatResults;
  }

  private checkCollision(hitbox: any, hurtbox: any): boolean {
    return !(hitbox.x + hitbox.width < hurtbox.x ||
             hurtbox.x + hurtbox.width < hitbox.x ||
             hitbox.y + hitbox.height < hurtbox.y ||
             hurtbox.y + hurtbox.height < hitbox.y);
  }

  private processCombat(
    attackerEntity: Entity,
    targetEntity: Entity,
    hitbox: HitboxComponent,
    hurtbox: HurtboxComponent
  ): CombatResult | null {
    // Calculate damage
    const isCritical = Math.random() < hitbox.criticalChance;
    const multiplier = isCritical ? 2.0 : 1.0;
    const finalDamage = Math.max(0, (hitbox.damage * multiplier) - hurtbox.defense);

    // Apply damage
    const damageDealt = hurtbox.takeDamage(finalDamage);
    if (!damageDealt) {
      return null; // No damage dealt (blocked by invincibility)
    }

    // Mark this target as hit by this hitbox to prevent multiple hits
    hitbox.hitTargets.add(targetEntity.id);
    console.log(`[COMBAT_DEBUG] Added ${targetEntity.id} to hitTargets for hitbox ${hitbox.owner}`);
    
    // Trigger visual feedback for enemy damage
    if ((targetEntity as any).startDamageFlash) {
      (targetEntity as any).startDamageFlash();
    }

    // Check for pogo bounce - if this is a pogo attack hitting an enemy, trigger bounce
    if (hitbox.attackType === 'pogo' && (attackerEntity as any).executePogoBounce) {
      const bounceSuccess = (attackerEntity as any).executePogoBounce();
      if (bounceSuccess) {
        console.log('[COMBAT] Pogo bounce triggered on enemy hit!');
        
        // Restore abilities for pogo bouncing
        if ((attackerEntity as any).restoreAbilitiesOnPogo) {
          (attackerEntity as any).restoreAbilitiesOnPogo();
        }
      }
    }

    // Calculate knockback
    const knockback = this.calculateKnockback(attackerEntity, targetEntity, hitbox.knockbackForce);

    // Apply knockback to target
    const targetVelocity = targetEntity.getComponent<VelocityComponent>('velocity');
    if (targetVelocity) {
      targetVelocity.x = knockback.x;
      targetVelocity.y = knockback.y;
      console.log(`[COMBAT] Applied knockback: (${knockback.x.toFixed(1)}, ${knockback.y.toFixed(1)})`);
    }

    // Deactivate hitbox after successful hit
    hitbox.active = false;

    console.log(`[COMBAT] Combat hit - Damage: ${finalDamage}, Critical: ${isCritical}`);

    return {
      attacker: attackerEntity,
      target: targetEntity,
      damage: finalDamage,
      knockback,
      isCritical
    };
  }

  private calculateKnockback(attacker: Entity, target: Entity, force: number): { x: number; y: number } {
    const attackerPos = attacker.getComponent<PositionComponent>('position');
    const targetPos = target.getComponent<PositionComponent>('position');

    if (!attackerPos || !targetPos) {
      return { x: 0, y: 0 };
    }

    // Calculate direction from attacker to target
    const direction = {
      x: targetPos.x - attackerPos.x,
      y: targetPos.y - attackerPos.y
    };

    // Normalize direction
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (magnitude === 0) {
      return { x: force, y: 0 }; // Default to right if same position
    }

    const normalizedDirection = {
      x: direction.x / magnitude,
      y: direction.y / magnitude
    };

    return {
      x: normalizedDirection.x * force,
      y: normalizedDirection.y * force
    };
  }

  public createMeleeHitbox(
    owner: Entity,
    facingDirection: number,
    damage: number,
    range: number = 40,
    width: number = 32,
    height: number = 16,
    duration: number = 8
  ): HitboxComponent {
    const position = owner.getComponent<PositionComponent>('position');
    if (!position) {
      throw new Error('Entity must have position component to create melee hitbox');
    }

    const hitboxX = position.x + (facingDirection * range);
    const hitboxY = position.y;

    const hitbox = new HitboxComponent({
      x: hitboxX,
      y: hitboxY,
      width,
      height,
      damage,
      owner: owner.id,
      active: true,
      type: 'melee',
      duration,
      knockbackForce: 150, // Quick push, not too much
      criticalChance: 0.1
    });

    console.log(`[COMBAT] Created melee hitbox at (${hitboxX}, ${hitboxY}) facing ${facingDirection > 0 ? 'right' : 'left'}`);

    return hitbox;
  }

  public getActiveHitboxes(): HitboxComponent[] {
    return this.entities
      .map(entity => entity.getComponent<HitboxComponent>('hitbox'))
      .filter(hitbox => hitbox && hitbox.active) as HitboxComponent[];
  }

  public getVulnerableHurtboxes(): HurtboxComponent[] {
    return this.entities
      .map(entity => entity.getComponent<HurtboxComponent>('hurtbox'))
      .filter(hurtbox => hurtbox && hurtbox.vulnerable) as HurtboxComponent[];
  }
}