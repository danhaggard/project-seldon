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
import {
  Trash2,
  Plus,
  Link as LinkIcon,
  FileText,
  Video,
  Mic,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PREDICTION_SOURCE_MEDIA_TYPE,
  PREDICTION_SOURCE_STATUS,
  PREDICTION_SOURCE_TYPE,
  PredictionSourceMediaTypes,
  PredictionSourceStatuses,
  PredictionSourceTypes,
} from "@/lib/definitions/prediction-source";
import { capitalize } from "@/lib/utils";
import { PredictionByIdWithSources } from "@/lib/data/predictions";

type PredictionSource = PredictionByIdWithSources["prediction_sources"][number];

type Source = Partial<PredictionSource> & {
  // We need a temp ID for UI keys before it's saved to DB
  id?: string;
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

    const newSource: Partial<Source> = {
      id: `temp-${Date.now()}`, // Temporary ID
      url: newUrl,
      type: newType,
      status: newStatus,
      media_type: newMediaType,
    };

    const updated = [...sources, newSource];
    setSources(updated);
    onChange(updated);

    // Reset and Close
    setNewUrl("");
    setIsModalOpen(false);
  };

  const getMediaIcon = (type: string = "text") => {
    switch (type) {
      case "video":
        return <Video className="w-3 h-3" />;
      case "audio":
        return <Mic className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
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

        {sources.map((source) => (
          <div
            key={source.id}
            className="flex items-center justify-between p-3 rounded-md border bg-card"
          >
            <div className="flex flex-col gap-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <Badge
                  variant={source.type === "primary" ? "default" : "secondary"}
                  className="text-[10px] h-5 px-1.5 uppercase"
                >
                  {source.type}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {getMediaIcon(source.media_type)}
                  <span className="capitalize">{source.media_type}</span>
                </div>
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm truncate hover:underline flex items-center gap-1 text-primary"
              >
                <LinkIcon className="w-3 h-3 shrink-0" />
                {source.url}
              </a>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => (source.id ? handleDelete(source.id) : undefined)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
