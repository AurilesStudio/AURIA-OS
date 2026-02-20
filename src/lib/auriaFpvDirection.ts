/**
 * Shared FPV input/state — written by useAuriaFpvKeys (DOM) + CameraAnimator (R3F).
 * Read by AvatarModel + CameraAnimator each frame.
 *
 * Module-level singleton avoids React re-renders on every keypress.
 */
export const auriaFpvDirection = {
  // ── Inputs (written by keyboard hook) ──────────────────────
  /** +1 = forward (Z/W), -1 = backward (S) */
  moveForward: 0,
  /** +1 = strafe right (D), -1 = strafe left (Q/A) */
  moveRight: 0,
  /** True when any ZQSD movement key is held */
  anyMove: false,
  /** +1 = turn right (ArrowRight), -1 = turn left (ArrowLeft) */
  yawInput: 0,

  // ── State (accumulated by CameraAnimator each frame) ───────
  /** Camera yaw in radians — this is the "look direction" */
  cameraYaw: 0,
};
