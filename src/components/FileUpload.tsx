import { Upload } from 'lucide-react';
import { useCallback } from 'react';

interface FileUploadProps {
  onFileLoad: (content: string) => void;
  label: string;
  loaded?: boolean;
}

export function FileUpload({ onFileLoad, label, loaded }: FileUploadProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onFileLoad(ev.target?.result as string);
      reader.readAsText(file);
    }
  }, [onFileLoad]);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => onFileLoad(ev.target?.result as string);
        reader.readAsText(file);
      }
    };
    input.click();
  }, [onFileLoad]);

  if (loaded) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 glow-green">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="font-mono text-sm text-primary">{label} loaded</span>
        </div>
        <button 
          onClick={handleClick}
          className="rounded border border-primary/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-secondary/50 px-6 py-4 transition-colors hover:border-primary/50 hover:bg-secondary"
    >
      <Upload className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="font-mono text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">Drop CSV or click to browse</p>
      </div>
    </div>
  );
}
