const BASE = "https://api.tripo3d.ai/v2/openapi";

export interface TripoResult {
  taskId: string;
  modelUrl: string;
  renderedImageUrl: string;
}

export interface RigCheckResult {
  riggable: boolean;
  rigType: string;
}

// ── Preset animations available for retargeting ────────────────
export const RETARGET_ANIMATIONS = [
  "preset:idle",
  "preset:walk",
  "preset:run",
  "preset:jump",
  "preset:slash",
  "preset:shoot",
  "preset:dive",
  "preset:climb",
  "preset:hurt",
  "preset:fall",
  "preset:turn",
] as const;

export type RetargetAnimation = (typeof RETARGET_ANIMATIONS)[number];

// ── Helpers ────────────────────────────────────────────────────

/** Create a generic task */
async function createTask(
  apiKey: string,
  body: Record<string, unknown>,
): Promise<string> {
  const res = await fetch(`${BASE}/task`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.code !== 0)
    throw new Error(json.message ?? "Tripo task creation failed");
  return json.data.task_id;
}

/** Upload an image and get a file token */
export async function uploadImage(
  apiKey: string,
  file: File,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  const json = await res.json();
  if (json.code !== 0)
    throw new Error(json.message ?? "Tripo image upload failed");
  return json.data.image_token;
}

export async function getTripoTask(apiKey: string, taskId: string) {
  const res = await fetch(`${BASE}/task/${taskId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return res.json() as Promise<{
    code: number;
    data: {
      status: string;
      progress: number;
      output?: {
        pbr_model?: string;
        model?: string;
        rendered_image?: string;
        riggable?: boolean;
        rig_type?: string;
      };
    };
  }>;
}

/** Poll a task until complete */
async function pollTask(
  apiKey: string,
  taskId: string,
  onProgress?: (pct: number) => void,
): Promise<TripoResult> {
  while (true) {
    await new Promise((r) => setTimeout(r, 3000));
    const { data } = await getTripoTask(apiKey, taskId);
    onProgress?.(data.progress ?? 0);
    if (data.status === "success") {
      return {
        taskId,
        modelUrl: data.output?.pbr_model ?? data.output?.model ?? "",
        renderedImageUrl: data.output?.rendered_image ?? "",
      };
    }
    if (data.status === "failed") throw new Error("Tripo task failed");
  }
}

// ── Generation ─────────────────────────────────────────────────

/** Generate a 3D model from a text prompt */
export async function generateFromText(
  apiKey: string,
  prompt: string,
  onProgress?: (pct: number) => void,
): Promise<TripoResult> {
  const taskId = await createTask(apiKey, { type: "text_to_model", prompt });
  return pollTask(apiKey, taskId, onProgress);
}

/** Generate a 3D model from an uploaded image */
export async function generateFromImage(
  apiKey: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<TripoResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const imageToken = await uploadImage(apiKey, file);
  const taskId = await createTask(apiKey, {
    type: "image_to_model",
    file: { type: ext, file_token: imageToken },
  });
  return pollTask(apiKey, taskId, onProgress);
}

// ── Rigging pipeline ───────────────────────────────────────────

/** Check if a model can be rigged */
export async function checkRiggable(
  apiKey: string,
  originalTaskId: string,
): Promise<RigCheckResult> {
  const taskId = await createTask(apiKey, {
    type: "animate_prerigcheck",
    original_model_task_id: originalTaskId,
  });
  // Poll until check is done
  while (true) {
    await new Promise((r) => setTimeout(r, 2000));
    const { data } = await getTripoTask(apiKey, taskId);
    if (data.status === "success") {
      return {
        riggable: data.output?.riggable ?? false,
        rigType: data.output?.rig_type ?? "biped",
      };
    }
    if (data.status === "failed") throw new Error("Rig check failed");
  }
}

/** Rig a model (add skeleton) */
export async function rigModel(
  apiKey: string,
  originalTaskId: string,
  rigType: string = "biped",
  onProgress?: (pct: number) => void,
): Promise<TripoResult> {
  const taskId = await createTask(apiKey, {
    type: "animate_rig",
    original_model_task_id: originalTaskId,
    out_format: "glb",
    rig_type: rigType,
  });
  return pollTask(apiKey, taskId, onProgress);
}

/** Retarget preset animations onto a rigged model */
export async function retargetAnimation(
  apiKey: string,
  rigTaskId: string,
  animations: RetargetAnimation | RetargetAnimation[],
  onProgress?: (pct: number) => void,
): Promise<TripoResult> {
  const body: Record<string, unknown> = {
    type: "animate_retarget",
    original_model_task_id: rigTaskId,
    out_format: "glb",
    bake_animation: true,
    export_with_geometry: true,
  };
  if (Array.isArray(animations)) {
    body.animations = animations;
  } else {
    body.animation = animations;
  }
  const taskId = await createTask(apiKey, body);
  return pollTask(apiKey, taskId, onProgress);
}

/**
 * Full rig + animate pipeline.
 * 1. Check riggable → 2. Rig → 3. Retarget walk+idle → animated GLB
 */
export async function rigAndAnimate(
  apiKey: string,
  originalTaskId: string,
  onProgress?: (pct: number, stage: string) => void,
): Promise<TripoResult> {
  // Stage 1: check riggable
  onProgress?.(5, "Checking riggability...");
  const check = await checkRiggable(apiKey, originalTaskId);
  if (!check.riggable) throw new Error("This model cannot be rigged");

  // Stage 2: rig
  onProgress?.(20, "Adding skeleton...");
  const rigResult = await rigModel(
    apiKey,
    originalTaskId,
    check.rigType,
    (pct) => onProgress?.(20 + pct * 0.4, "Adding skeleton..."),
  );

  // Stage 3: retarget walk + idle
  onProgress?.(60, "Applying animations...");
  const animResult = await retargetAnimation(
    apiKey,
    rigResult.taskId,
    ["preset:idle", "preset:walk"],
    (pct) => onProgress?.(60 + pct * 0.4, "Applying animations..."),
  );

  onProgress?.(100, "Done");
  return animResult;
}
