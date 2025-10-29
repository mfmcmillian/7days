/**
 * Crafting Recipes for Neural Collapse
 * Defines all craftable items and their requirements
 */

export interface CraftingRecipe {
  wood?: number
  metal?: number
  wire?: number
  nails?: number
  fuel?: number
  health: number
  degradeRate: number
  displayName: string
  description: string
}

export const recipes: Record<string, CraftingRecipe> = {
  woodBarricade: {
    wood: 5,
    nails: 3,
    health: 100,
    degradeRate: 0.5,
    displayName: 'Wood Barricade',
    description: 'Slows zombies to 50% speed'
  },
  steelWall: {
    metal: 8,
    wire: 2,
    health: 300,
    degradeRate: 0.3,
    displayName: 'Steel Wall',
    description: 'Blocks zombie path'
  },
  autoTurret: {
    metal: 10,
    wire: 5,
    fuel: 1,
    health: 150,
    degradeRate: 0.7,
    displayName: 'Auto Turret',
    description: 'Shoots zombies automatically'
  }
}

/**
 * Check if player has required materials for recipe
 */
export function canCraft(
  recipeId: string,
  inventory: {
    wood: number
    metal: number
    wire: number
    nails: number
    fuel: number
  }
): boolean {
  const recipe = recipes[recipeId]
  if (!recipe) return false

  if (recipe.wood && inventory.wood < recipe.wood) return false
  if (recipe.metal && inventory.metal < recipe.metal) return false
  if (recipe.wire && inventory.wire < recipe.wire) return false
  if (recipe.nails && inventory.nails < recipe.nails) return false
  if (recipe.fuel && inventory.fuel < recipe.fuel) return false

  return true
}

/**
 * Deduct materials from inventory
 */
export function consumeMaterials(
  recipeId: string,
  inventory: {
    wood: number
    metal: number
    wire: number
    nails: number
    fuel: number
  }
): boolean {
  const recipe = recipes[recipeId]
  if (!recipe) return false

  // Check if can craft
  if (!canCraft(recipeId, inventory)) return false

  // Deduct materials
  if (recipe.wood) inventory.wood -= recipe.wood
  if (recipe.metal) inventory.metal -= recipe.metal
  if (recipe.wire) inventory.wire -= recipe.wire
  if (recipe.nails) inventory.nails -= recipe.nails
  if (recipe.fuel) inventory.fuel -= recipe.fuel

  return true
}

