import { useMemo } from "react";

/** Centralised isometric camera config */
export function useScene() {
  const camera = useMemo(
    () => ({
      zoom: 55,
      position: [10, 10, 10] as [number, number, number],
      near: -100,
      far: 200,
    }),
    [],
  );

  return { camera };
}
