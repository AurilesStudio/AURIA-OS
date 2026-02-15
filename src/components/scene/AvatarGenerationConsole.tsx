import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Box, Upload, Trash2, Eye, EyeOff, Bone, HardDriveDownload } from "lucide-react";
import { useStore } from "@/store/useStore";
import { generateFromText, generateFromImage, rigAndAnimate } from "@/lib/tripo";
import { storeGlbFile, bufferToBlobUrl } from "@/lib/glbStore";
import { generateId } from "@/lib/utils";

interface AvatarGenerationConsoleProps {
  open: boolean;
  onClose: () => void;
}

type GenMode = "text" | "image";

export function AvatarGenerationConsole({ open, onClose }: AvatarGenerationConsoleProps) {
  const tripoApiKey = useStore((s) => s.tripoApiKey);
  const setTripoApiKey = useStore((s) => s.setTripoApiKey);
  const appearances = useStore((s) => s.appearances);
  const addAppearance = useStore((s) => s.addAppearance);
  const updateAppearance = useStore((s) => s.updateAppearance);
  const removeAppearance = useStore((s) => s.removeAppearance);

  const [showApiKey, setShowApiKey] = useState(false);
  const [genMode, setGenMode] = useState<GenMode>("text");
  const [prompt, setPrompt] = useState("");
  const [appearanceName, setAppearanceName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genError, setGenError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rigging state
  const [riggingId, setRiggingId] = useState<string | null>(null);
  const [rigProgress, setRigProgress] = useState(0);
  const [rigStage, setRigStage] = useState("");
  const [rigError, setRigError] = useState<string | null>(null);

  // GLB import state
  const glbInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImportGlb = async (file: File) => {
    if (importing) return;
    setImporting(true);
    setImportError(null);
    try {
      const buffer = await file.arrayBuffer();
      const id = `appearance-${generateId()}`;
      // Store in IndexedDB for persistence
      await storeGlbFile(id, buffer);
      // Create a live blob URL for this session
      const blobUrl = bufferToBlobUrl(buffer);
      // Derive name from filename (strip extension)
      const name = file.name.replace(/\.(glb|gltf)$/i, "");

      // Add directly with known id (bypass addAppearance to set id ourselves)
      useStore.setState((state) => ({
        appearances: [
          ...state.appearances,
          {
            id,
            name,
            thumbnailUrl: "",
            modelUrl: blobUrl,
            createdAt: Date.now(),
            localGlb: true,
            rigged: true, // imported GLBs are assumed pre-rigged
          },
        ],
      }));
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const canGenerate =
    tripoApiKey &&
    !generating &&
    appearanceName.trim() !== "" &&
    (genMode === "text" ? prompt.trim() !== "" : imageFile !== null);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setGenProgress(0);
    setGenError(null);
    try {
      const result =
        genMode === "image" && imageFile
          ? await generateFromImage(tripoApiKey, imageFile, (pct) => setGenProgress(pct))
          : await generateFromText(tripoApiKey, prompt, (pct) => setGenProgress(pct));

      addAppearance({
        name: appearanceName.trim(),
        modelUrl: result.modelUrl,
        thumbnailUrl: result.renderedImageUrl,
        originalTaskId: result.taskId,
        rigged: false,
      });

      // Reset form
      setPrompt("");
      setAppearanceName("");
      setImageFile(null);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleRig = async (appearanceId: string, originalTaskId: string) => {
    if (!tripoApiKey || riggingId) return;
    setRiggingId(appearanceId);
    setRigProgress(0);
    setRigStage("Starting...");
    setRigError(null);
    try {
      const result = await rigAndAnimate(tripoApiKey, originalTaskId, (pct, stage) => {
        setRigProgress(pct);
        setRigStage(stage);
      });
      updateAppearance(appearanceId, {
        modelUrl: result.modelUrl,
        rigged: true,
      });
    } catch (err) {
      setRigError(err instanceof Error ? err.message : "Rigging failed");
    } finally {
      setRiggingId(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed left-1/2 top-1/2 z-50 w-[560px] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
          >
            <div className="overlay-glass rounded-xl border border-white/10 p-6">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Box className="h-5 w-5 text-neon-purple" />
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">Avatar Studio</h2>
                    <p className="text-[10px] text-text-muted">Generate, rig & animate 3D appearances</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tripo API Key */}
              <div className="mb-4">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-text-muted">Tripo API Key</span>
                  <div className="flex gap-1">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={tripoApiKey}
                      onChange={(e) => setTripoApiKey(e.target.value)}
                      placeholder="tsk_..."
                      className="min-w-0 flex-1 rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="rounded border border-white/10 bg-bg-base/50 px-2 text-text-muted transition-colors hover:text-text-primary"
                    >
                      {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                </label>
              </div>

              {/* Mode tabs */}
              <div className="mb-4 flex gap-1">
                <button
                  type="button"
                  onClick={() => setGenMode("text")}
                  className={`flex-1 rounded px-3 py-1.5 text-[10px] font-bold uppercase transition-colors ${
                    genMode === "text"
                      ? "bg-white/10 text-text-primary"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Text to 3D
                </button>
                <button
                  type="button"
                  onClick={() => setGenMode("image")}
                  className={`flex-1 rounded px-3 py-1.5 text-[10px] font-bold uppercase transition-colors ${
                    genMode === "image"
                      ? "bg-white/10 text-text-primary"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Image to 3D
                </button>
              </div>

              {/* Generation form */}
              <div className="mb-4 flex flex-col gap-3">
                {genMode === "text" ? (
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the 3D character you want to generate..."
                    rows={3}
                    className="w-full resize-none rounded border border-white/10 bg-bg-base/50 px-2.5 py-2 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                  />
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    />
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex cursor-pointer flex-col items-center gap-2 rounded border border-dashed px-4 py-6 text-center transition-colors ${
                        dragOver
                          ? "border-white/30 bg-white/5"
                          : "border-white/15 hover:border-white/25"
                      }`}
                    >
                      <Upload className="h-5 w-5 text-text-muted" />
                      {imageFile ? (
                        <span className="text-xs text-text-primary">{imageFile.name}</span>
                      ) : (
                        <span className="text-[10px] text-text-muted">
                          Drag & drop an image, or click to browse
                          <br />
                          PNG, JPG, WebP
                        </span>
                      )}
                    </div>
                  </>
                )}

                {/* Appearance name */}
                <input
                  value={appearanceName}
                  onChange={(e) => setAppearanceName(e.target.value)}
                  placeholder="Appearance name"
                  className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                />

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="rounded bg-white/10 px-4 py-2 text-xs font-bold uppercase text-text-primary transition-colors hover:bg-white/15 disabled:opacity-30"
                >
                  {generating ? "Generating..." : "Generate"}
                </button>

                {/* Progress bar */}
                {generating && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-neon-purple transition-all duration-300"
                      style={{ width: `${genProgress}%` }}
                    />
                  </div>
                )}

                {/* Error */}
                {genError && (
                  <p className="text-[10px] text-neon-red">{genError}</p>
                )}
              </div>

              {/* Rigging progress (shown globally when rigging any appearance) */}
              {riggingId && (
                <div className="mb-4 rounded border border-white/10 bg-bg-base/30 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase text-text-muted">
                    <Bone className="h-3 w-3" />
                    Rigging in progress
                  </div>
                  <p className="mb-2 text-[10px] text-text-muted">{rigStage}</p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${rigProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {rigError && !riggingId && (
                <p className="mb-4 text-[10px] text-neon-red">{rigError}</p>
              )}

              {/* Library grid */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase text-text-muted">
                    Appearance Library
                  </h3>
                  <input
                    ref={glbInputRef}
                    type="file"
                    accept=".glb,.gltf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImportGlb(f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => glbInputRef.current?.click()}
                    disabled={importing}
                    className="flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-[10px] font-bold uppercase text-text-muted transition-colors hover:border-white/20 hover:text-text-primary disabled:opacity-40"
                  >
                    <HardDriveDownload className="h-3 w-3" />
                    {importing ? "Importing..." : "Import GLB"}
                  </button>
                </div>

                {importError && (
                  <p className="mb-2 text-[10px] text-neon-red">{importError}</p>
                )}

                {appearances.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {appearances.map((app) => (
                      <div
                        key={app.id}
                        className="group relative flex flex-col items-center rounded-lg border border-white/5 bg-bg-base/40 px-2 py-3 transition-all hover:border-white/15"
                      >
                        {/* Thumbnail or fallback */}
                        {app.thumbnailUrl ? (
                          <img
                            src={app.thumbnailUrl}
                            alt={app.name}
                            className="mb-1.5 h-16 w-16 rounded object-cover"
                          />
                        ) : (
                          <div className="mb-1.5 flex h-16 w-16 items-center justify-center rounded bg-white/5">
                            <Box className="h-6 w-6 text-text-muted" />
                          </div>
                        )}
                        <span className="text-[10px] font-medium text-text-primary">
                          {app.name}
                        </span>

                        {/* Rigged badge or Rig button */}
                        {app.rigged ? (
                          <span className="mt-1 flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase text-emerald-400">
                            <Bone className="h-2 w-2" /> {app.localGlb ? "Imported" : "Rigged"}
                          </span>
                        ) : app.originalTaskId ? (
                          <button
                            onClick={() => handleRig(app.id, app.originalTaskId!)}
                            disabled={!!riggingId}
                            className="mt-1 flex items-center gap-0.5 rounded-full border border-white/10 px-1.5 py-0.5 text-[8px] font-bold uppercase text-text-muted transition-colors hover:border-white/20 hover:text-text-primary disabled:opacity-30"
                          >
                            <Bone className="h-2 w-2" />
                            {riggingId === app.id ? "Rigging..." : "Rig & Animate"}
                          </button>
                        ) : (
                          <span className="mt-1 text-[8px] text-text-muted/50">Static model</span>
                        )}

                        {/* Delete button (hover) */}
                        <button
                          onClick={() => removeAppearance(app.id)}
                          className="absolute right-1 top-1 rounded p-0.5 text-text-muted opacity-0 transition-all hover:bg-neon-red/10 hover:text-neon-red group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-[10px] text-text-muted">
                    No appearances yet
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
