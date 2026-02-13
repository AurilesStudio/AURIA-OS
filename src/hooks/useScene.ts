import { useMemo } from "react";

/** Centralised isometric camera & room config */
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

  const room = useMemo(
    () => ({
      width: 8,
      depth: 6,
      borderColor: "#ff3c3c",
      floorColor: "#0a0608",
      floorOpacity: 0.6,
      label: "App Development",
    }),
    [],
  );

  return { camera, room };
}
