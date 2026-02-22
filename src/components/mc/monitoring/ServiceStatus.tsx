interface Service {
  name: string;
  status: "connected" | "error";
  latency: number;
  error?: string;
}

interface ServiceStatusProps {
  services: Service[];
}

export function ServiceStatus({ services }: ServiceStatusProps) {
  return (
    <div className="overlay-glass rounded-lg p-4">
      <span className="text-[10px] uppercase text-text-muted">Services</span>

      <div className="mt-3 space-y-2">
        {services.map((svc) => (
          <div
            key={svc.name}
            className="flex items-center justify-between rounded-md border border-white/5 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  svc.status === "connected"
                    ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                    : "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]"
                }`}
              />
              <span className="text-xs text-text-primary">{svc.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {svc.error && (
                <span className="text-[10px] text-red-400">{svc.error}</span>
              )}
              <span className="text-[10px] text-text-muted">
                {svc.latency}ms
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
