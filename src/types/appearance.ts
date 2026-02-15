export interface AppearanceEntry {
  id: string;
  name: string;
  thumbnailUrl: string;
  modelUrl: string;
  createdAt: number;
  originalTaskId?: string; // Tripo task ID — needed for rigging pipeline
  rigged?: boolean;
  localGlb?: boolean; // true = GLB stored in IndexedDB, needs hydration on load
}
