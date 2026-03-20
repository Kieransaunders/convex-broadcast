import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export function SWUpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);

      // Check for updates periodically (every 30 minutes)
      const interval = setInterval(() => {
        reg.update().catch(() => {});
      }, 1000 * 60 * 30);

      // Listen for new service workers
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          // Only show update prompt if there's a controller (not first install)
          // and the new worker is waiting
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setUpdateAvailable(true);
          }
        });
      });

      return () => clearInterval(interval);
    });
  }, []);

  const handleUpdate = () => {
    // Tell the new service worker to skip waiting
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
    
    // Wait for the new service worker to take control, then reload
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed top-4 left-1/2 z-[60] w-full max-w-md -translate-x-1/2 px-4 animate-in fade-in slide-in-from-top-4">
      <Card className="border-amber-200 bg-amber-50 shadow-lg">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900">
              Update Available
            </h3>
            <p className="text-xs text-amber-700">
              A new version of the app is ready. Refresh to update.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-amber-600 text-white hover:bg-amber-700"
              onClick={handleUpdate}
            >
              Update
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-amber-700 hover:bg-amber-100"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
