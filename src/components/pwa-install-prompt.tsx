import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePWAInstall } from "~/hooks/use-pwa-install";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export function PWAInstallPrompt() {
  const { isInstallable, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after a short delay if installable
    if (isInstallable) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  if (!isInstallable || !isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] w-full max-w-sm -translate-x-1/2 px-4 animate-in fade-in slide-in-from-bottom-4">
      <Card className="border-[#6366F1]/20 bg-white/90 shadow-2xl backdrop-blur-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6366F1] text-white">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#1E1B4B]">
              Install App
            </h3>
            <p className="text-xs text-[#1E1B4B]/60">
              Get the best experience by installing our app.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-[#6366F1] text-white hover:bg-[#6366F1]/90"
              onClick={install}
            >
              Install
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#1E1B4B]/40 hover:text-[#1E1B4B]"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
