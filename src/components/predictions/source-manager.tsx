"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Link as LinkIcon } from "lucide-react";
import {
  PREDICTION_SOURCE_MEDIA_TYPE,
  PREDICTION_SOURCE_STATUS,
  PREDICTION_SOURCE_TYPE,
  PredictionSourceMediaTypes,
  PredictionSourceStatuses,
  PredictionSourceTypes,
} from "@/lib/definitions/prediction-source";
import { capitalize, cn } from "@/lib/utils";
import { PredictionByIdWithSources } from "@/lib/data/predictions";
import { getMediaBadgeClassName, getMediaIcon } from "@/config/getters";

type PredictionSource = PredictionByIdWithSources["prediction_sources"][number];

type Source = Partial<PredictionSource> & {
  // We need a temp ID for UI keys before it's saved to DB
  id?: string;
  title?: string | null;
};

interface SourceManagerProps {
  initialSources: Source[];
  onChange: (sources: Source[]) => void;
}

export function SourceManager({
  initialSources,
  onChange,
}: SourceManagerProps) {
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<PredictionSourceTypes>(
    PREDICTION_SOURCE_TYPE.SECONDARY,
  );
  const [newStatus] = useState<PredictionSourceStatuses>(
    PREDICTION_SOURCE_STATUS.LIVE,
  );
  const [newMediaType, setNewMediaType] = useState<PredictionSourceMediaTypes>(
    PREDICTION_SOURCE_MEDIA_TYPE.TEXT,
  );

  const handleDelete = (idToDelete: string) => {
    const updated = sources.filter((s) => s.id !== idToDelete);
    setSources(updated);
    onChange(updated);
  };

  const handleAddSource = () => {
    if (!newUrl) return;
    // Helper to grab domain root for the UI before it hits the server
    const getTempDomain = (urlString: string) => {
      try {
        return new URL(urlString).hostname.replace(/^www\./, "");
      } catch {
        return urlString;
      }
    };

    const newSource: Partial<Source> = {
      id: `temp-${Date.now()}`, // Temporary ID
      url: newUrl,
      title: (newTitle && newTitle.trim()) || getTempDomain(newUrl),
      type: newType,
      status: newStatus,
      media_type: newMediaType,
    };

    const updated = [...sources, newSource];
    setSources(updated);
    onChange(updated);

    // Reset and Close
    setNewUrl("");
    setNewTitle("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Sources</Label>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" type="button">
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Evidence Source</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Title Input */}
              <div className="grid gap-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Auto-extracted from URL if left blank"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select
                    value={newType}
                    onValueChange={(v: PredictionSourceTypes) => setNewType(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PREDICTION_SOURCE_TYPE.PRIMARY}>
                        {capitalize(PREDICTION_SOURCE_TYPE.PRIMARY)}
                      </SelectItem>
                      <SelectItem value={PREDICTION_SOURCE_TYPE.SECONDARY}>
                        {capitalize(PREDICTION_SOURCE_TYPE.SECONDARY)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Media Type</Label>
                  <Select
                    value={newMediaType}
                    onValueChange={(v: PredictionSourceMediaTypes) =>
                      setNewMediaType(v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PREDICTION_SOURCE_MEDIA_TYPE.TEXT}>
                        {capitalize(PREDICTION_SOURCE_MEDIA_TYPE.TEXT)}
                      </SelectItem>
                      <SelectItem value={PREDICTION_SOURCE_MEDIA_TYPE.VIDEO}>
                        {capitalize(PREDICTION_SOURCE_MEDIA_TYPE.VIDEO)}
                      </SelectItem>
                      <SelectItem value={PREDICTION_SOURCE_MEDIA_TYPE.AUDIO}>
                        {capitalize(PREDICTION_SOURCE_MEDIA_TYPE.AUDIO)}
                      </SelectItem>
                      <SelectItem value={PREDICTION_SOURCE_MEDIA_TYPE.SOCIAL}>
                        {capitalize(PREDICTION_SOURCE_MEDIA_TYPE.SOCIAL)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleAddSource}>
                Add to List
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Source List */}
      <div className="space-y-2">
        {sources.length === 0 && (
          <div className="text-sm text-muted-foreground italic border border-dashed p-4 rounded-md text-center">
            No sources added yet.
          </div>
        )}

        {sources.map((source, idx) => (
          <div
            key={source.id || idx}
            className="flex items-center justify-between p-3 rounded-lg border bg-card shadow-sm gap-3 transition-colors hover:bg-muted/10"
          >
            {/* LEFT SIDE: Content Stack */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {/* Top Row: Metadata & Title */}
              <div className="flex items-center gap-2">
                {/* 1. Colored Media Badge */}
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-md font-medium text-xs shrink-0 border border-transparent",
                    getMediaBadgeClassName(source.media_type),
                  )}
                >
                  {getMediaIcon(source.media_type, "w-3.5 h-3.5")}
                  <span className="capitalize">{source.media_type}</span>
                </div>

                {/* 2. Primary/Secondary Tag */}
                <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                  <span className="uppercase tracking-wider font-semibold text-[10px]">
                    {source.type}
                  </span>
                  <span className="text-border text-[10px] hidden sm:inline-block">
                    •
                  </span>
                </div>

                {/* 3. Title */}
                <span
                  className="font-medium text-sm truncate text-foreground/90 hidden sm:inline-block"
                  title={source.title || source.url}
                >
                  {source.title || "Pending Extraction..."}
                </span>
              </div>

              {/* Mobile Fallback Title (Shows under badges on tiny screens) */}
              <span
                className="font-medium text-sm truncate text-foreground/90 sm:hidden"
                title={source.title || source.url}
              >
                {source.title || "Pending Extraction..."}
              </span>

              {/* Bottom Row: URL */}
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs truncate hover:underline flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                title={source.url}
              >
                <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                {source.url}
              </a>
            </div>

            {/* RIGHT SIDE: Delete Action */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
              onClick={() => (source.id ? handleDelete(source.id) : undefined)}
              title="Remove Source"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
