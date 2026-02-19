/**
 * Global cache of actual 3D world positions for each avatar.
 * Written every frame by AvatarModel's useFrame; read by UI (e.g. camera focus).
 * This avoids expensive store updates every frame while keeping positions accurate.
 */
export const avatarWorldPositions = new Map<string, [number, number, number]>();
