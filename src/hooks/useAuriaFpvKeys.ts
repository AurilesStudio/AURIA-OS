import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { auriaFpvDirection } from "@/lib/auriaFpvDirection";

/**
 * Global keyboard listener for AURIA FPV controls.
 *
 * ZQSD / WASD  → movement (relative to camera direction)
 * Arrow keys   → camera rotation (yaw)
 * Escape       → exit FPV
 *
 * Ignores keys when an input/textarea is focused.
 */
export function useAuriaFpvKeys() {
  const fpvActive = useStore((s) => s.auriaFpvActive);
  const setFpvActive = useStore((s) => s.setAuriaFpvActive);
  const pressed = useRef(new Set<string>());

  useEffect(() => {
    if (!fpvActive) {
      auriaFpvDirection.moveForward = 0;
      auriaFpvDirection.moveRight = 0;
      auriaFpvDirection.anyMove = false;
      auriaFpvDirection.yawInput = 0;
      pressed.current.clear();
      return;
    }

    const update = () => {
      const s = pressed.current;

      // ── Movement (ZQSD / WASD) ──
      let fwd = 0;
      let right = 0;
      if (s.has("KeyW") || s.has("KeyZ")) fwd += 1;
      if (s.has("KeyS")) fwd -= 1;
      if (s.has("KeyD")) right += 1;
      if (s.has("KeyA") || s.has("KeyQ")) right -= 1;

      // Normalize diagonals
      const len = Math.sqrt(fwd * fwd + right * right);
      if (len > 1) {
        fwd /= len;
        right /= len;
      }

      auriaFpvDirection.moveForward = fwd;
      auriaFpvDirection.moveRight = right;
      auriaFpvDirection.anyMove = len > 0;

      // ── Camera rotation (Arrows) ──
      let yaw = 0;
      if (s.has("ArrowRight")) yaw += 1;
      if (s.has("ArrowLeft")) yaw -= 1;
      auriaFpvDirection.yawInput = yaw;
    };

    const isInputFocused = () => {
      const tag = document.activeElement?.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || (document.activeElement as HTMLElement)?.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      if (e.code === "Escape") {
        setFpvActive(false);
        return;
      }

      // Prevent arrow keys from scrolling the page
      if (e.code.startsWith("Arrow")) e.preventDefault();

      pressed.current.add(e.code);
      update();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      pressed.current.delete(e.code);
      update();
    };

    const onBlur = () => {
      pressed.current.clear();
      update();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      pressed.current.clear();
      auriaFpvDirection.moveForward = 0;
      auriaFpvDirection.moveRight = 0;
      auriaFpvDirection.anyMove = false;
      auriaFpvDirection.yawInput = 0;
    };
  }, [fpvActive, setFpvActive]);
}
