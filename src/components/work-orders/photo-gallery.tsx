import { Camera } from "lucide-react";

export function PhotoGallery() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Before Photo */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Before</h4>
          <div className="flex h-[200px] w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Camera className="h-8 w-8" />
              <span className="text-sm">Photo placeholder</span>
            </div>
          </div>
        </div>

        {/* After Photo */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">After</h4>
          <div className="flex h-[200px] w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Camera className="h-8 w-8" />
              <span className="text-sm">Photo placeholder</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Photo upload available in v2
      </p>
    </div>
  );
}
