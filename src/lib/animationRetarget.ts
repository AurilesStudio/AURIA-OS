import * as THREE from "three";

/**
 * Mixamo bone name (after stripping "mixamorig:") → common Tripo/VRM/Blender variants.
 * Each Mixamo name maps to an array of known alternative names.
 */
const SYNONYMS: Record<string, string[]> = {
  Hips: ["Hip", "Hips", "Pelvis", "pelvis"],
  Spine: ["Spine", "spine"],
  Spine1: ["Spine1", "Chest", "chest"],
  Spine2: ["Spine2", "UpperChest", "upperchest", "Upper_Chest"],
  Neck: ["Neck", "neck"],
  Head: ["Head", "head"],
  LeftShoulder: ["L_Shoulder", "LeftShoulder", "shoulder_L", "shoulder.L"],
  LeftArm: ["L_Upperarm", "LeftUpperArm", "L_Arm", "upperarm_L", "upperarm.L"],
  LeftForeArm: [
    "L_Forearm",
    "LeftLowerArm",
    "L_ForeArm",
    "forearm_L",
    "forearm.L",
  ],
  LeftHand: ["L_Hand", "LeftHand", "hand_L", "hand.L"],
  LeftHandThumb1: ["L_Thumb1", "LeftHandThumb1", "thumb01_L"],
  LeftHandThumb2: ["L_Thumb2", "LeftHandThumb2", "thumb02_L"],
  LeftHandThumb3: ["L_Thumb3", "LeftHandThumb3", "thumb03_L"],
  LeftHandIndex1: ["L_Index1", "LeftHandIndex1", "index01_L"],
  LeftHandIndex2: ["L_Index2", "LeftHandIndex2", "index02_L"],
  LeftHandIndex3: ["L_Index3", "LeftHandIndex3", "index03_L"],
  LeftHandMiddle1: ["L_Middle1", "LeftHandMiddle1", "middle01_L"],
  LeftHandMiddle2: ["L_Middle2", "LeftHandMiddle2", "middle02_L"],
  LeftHandMiddle3: ["L_Middle3", "LeftHandMiddle3", "middle03_L"],
  LeftHandRing1: ["L_Ring1", "LeftHandRing1", "ring01_L"],
  LeftHandRing2: ["L_Ring2", "LeftHandRing2", "ring02_L"],
  LeftHandRing3: ["L_Ring3", "LeftHandRing3", "ring03_L"],
  LeftHandPinky1: ["L_Pinky1", "LeftHandPinky1", "pinky01_L"],
  LeftHandPinky2: ["L_Pinky2", "LeftHandPinky2", "pinky02_L"],
  LeftHandPinky3: ["L_Pinky3", "LeftHandPinky3", "pinky03_L"],
  RightShoulder: ["R_Shoulder", "RightShoulder", "shoulder_R", "shoulder.R"],
  RightArm: [
    "R_Upperarm",
    "RightUpperArm",
    "R_Arm",
    "upperarm_R",
    "upperarm.R",
  ],
  RightForeArm: [
    "R_Forearm",
    "RightLowerArm",
    "R_ForeArm",
    "forearm_R",
    "forearm.R",
  ],
  RightHand: ["R_Hand", "RightHand", "hand_R", "hand.R"],
  RightHandThumb1: ["R_Thumb1", "RightHandThumb1", "thumb01_R"],
  RightHandThumb2: ["R_Thumb2", "RightHandThumb2", "thumb02_R"],
  RightHandThumb3: ["R_Thumb3", "RightHandThumb3", "thumb03_R"],
  RightHandIndex1: ["R_Index1", "RightHandIndex1", "index01_R"],
  RightHandIndex2: ["R_Index2", "RightHandIndex2", "index02_R"],
  RightHandIndex3: ["R_Index3", "RightHandIndex3", "index03_R"],
  RightHandMiddle1: ["R_Middle1", "RightHandMiddle1", "middle01_R"],
  RightHandMiddle2: ["R_Middle2", "RightHandMiddle2", "middle02_R"],
  RightHandMiddle3: ["R_Middle3", "RightHandMiddle3", "middle03_R"],
  RightHandRing1: ["R_Ring1", "RightHandRing1", "ring01_R"],
  RightHandRing2: ["R_Ring2", "RightHandRing2", "ring02_R"],
  RightHandRing3: ["R_Ring3", "RightHandRing3", "ring03_R"],
  RightHandPinky1: ["R_Pinky1", "RightHandPinky1", "pinky01_R"],
  RightHandPinky2: ["R_Pinky2", "RightHandPinky2", "pinky02_R"],
  RightHandPinky3: ["R_Pinky3", "RightHandPinky3", "pinky03_R"],
  LeftUpLeg: ["L_Thigh", "LeftUpperLeg", "L_UpLeg", "thigh_L", "thigh.L"],
  LeftLeg: ["L_Shin", "LeftLowerLeg", "L_Leg", "shin_L", "shin.L"],
  LeftFoot: ["L_Foot", "LeftFoot", "foot_L", "foot.L"],
  LeftToeBase: ["L_Toe", "LeftToeBase", "toe_L", "toe.L"],
  RightUpLeg: ["R_Thigh", "RightUpperLeg", "R_UpLeg", "thigh_R", "thigh.R"],
  RightLeg: ["R_Shin", "RightLowerLeg", "R_Leg", "shin_R", "shin.R"],
  RightFoot: ["R_Foot", "RightFoot", "foot_R", "foot.R"],
  RightToeBase: ["R_Toe", "RightToeBase", "toe_R", "toe.R"],
};

/**
 * Build a mapping from source (Mixamo) bone names to target (avatar) bone names.
 * Tries: exact match → case-insensitive → synonym table.
 */
export function buildBoneMap(
  sourceBoneNames: Set<string>,
  targetBoneNames: Set<string>,
): Map<string, string> {
  const map = new Map<string, string>();
  const targetList = [...targetBoneNames];

  for (const src of sourceBoneNames) {
    // Strip "mixamorig:" prefix
    const stripped = src.replace(/^mixamorig:/, "");

    // 1. Exact match in target
    if (targetBoneNames.has(stripped)) {
      map.set(src, stripped);
      continue;
    }

    // 2. Case-insensitive match
    const ciMatch = targetList.find(
      (t) => t.toLowerCase() === stripped.toLowerCase(),
    );
    if (ciMatch) {
      map.set(src, ciMatch);
      continue;
    }

    // 3. Synonym table
    const synonyms = SYNONYMS[stripped];
    if (synonyms) {
      for (const syn of synonyms) {
        const found = targetList.find(
          (t) => t === syn || t.toLowerCase() === syn.toLowerCase(),
        );
        if (found) {
          map.set(src, found);
          break;
        }
      }
    }
  }

  return map;
}

/**
 * Extract bind pose (rest) quaternions from a scene's bones.
 * Must be called BEFORE any animation plays.
 */
export function getBindPoseQuaternions(
  scene: THREE.Object3D,
): Map<string, THREE.Quaternion> {
  const map = new Map<string, THREE.Quaternion>();
  scene.traverse((obj) => {
    if ((obj as THREE.Bone).isBone) {
      map.set(obj.name, obj.quaternion.clone());
    }
  });
  return map;
}

/**
 * Create a new AnimationClip with track names remapped and bind pose compensated.
 *
 * Only quaternion tracks are kept. Position/scale tracks are dropped to avoid
 * proportion mismatches between source and target skeletons.
 *
 * For each quaternion keyframe, applies bind pose correction:
 *   corrected = targetBind * inv(sourceBind) * animQ
 *
 * This compensates for different rest orientations between skeletons.
 */
export function retargetClip(
  clip: THREE.AnimationClip,
  boneMap: Map<string, string>,
  sourceBindPose: Map<string, THREE.Quaternion>,
  targetBindPose: Map<string, THREE.Quaternion>,
  name?: string,
): THREE.AnimationClip {
  const tracks: THREE.KeyframeTrack[] = [];

  for (const track of clip.tracks) {
    const dotIdx = track.name.lastIndexOf(".");
    const boneName = track.name.substring(0, dotIdx);
    const property = track.name.substring(dotIdx); // e.g. ".quaternion"

    const targetBone = boneMap.get(boneName);
    if (!targetBone) continue;

    // Only keep quaternion tracks — position/scale from a different skeleton
    // would produce wrong results due to different bone lengths/proportions
    if (property !== ".quaternion") continue;

    const newTrack = track.clone();
    newTrack.name = targetBone + property;

    // Apply bind pose correction if we have both bind poses
    const srcBind = sourceBindPose.get(boneName);
    const tgtBind = targetBindPose.get(targetBone);

    if (srcBind && tgtBind) {
      const srcBindInv = srcBind.clone().invert();
      // correction = tgtBind * srcBindInv
      const correction = tgtBind.clone().multiply(srcBindInv);

      const values = newTrack.values;
      const q = new THREE.Quaternion();

      for (let i = 0; i < values.length; i += 4) {
        q.set(values[i]!, values[i + 1]!, values[i + 2]!, values[i + 3]!);
        // corrected = correction * animQ
        q.premultiply(correction);
        q.normalize();
        values[i] = q.x;
        values[i + 1] = q.y;
        values[i + 2] = q.z;
        values[i + 3] = q.w;
      }
    }

    tracks.push(newTrack);
  }

  return new THREE.AnimationClip(name ?? clip.name, clip.duration, tracks);
}

/**
 * Extract unique bone names from an array of AnimationClips.
 */
export function getBoneNamesFromClips(
  clips: THREE.AnimationClip[],
): Set<string> {
  const names = new Set<string>();
  for (const clip of clips) {
    for (const track of clip.tracks) {
      const dotIdx = track.name.lastIndexOf(".");
      names.add(track.name.substring(0, dotIdx));
    }
  }
  return names;
}

/**
 * Extract bone names from a scene graph (all Bone objects).
 */
export function getBoneNamesFromScene(scene: THREE.Object3D): Set<string> {
  const names = new Set<string>();
  scene.traverse((obj) => {
    if ((obj as THREE.Bone).isBone) {
      names.add(obj.name);
    }
  });
  return names;
}
