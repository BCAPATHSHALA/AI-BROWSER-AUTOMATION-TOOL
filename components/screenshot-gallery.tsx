"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Download, Eye, Trash2, Clock, Globe } from "lucide-react";

interface Screenshot {
  id: string;
  timestamp: string;
  url: string;
  title: string;
  action: string;
  base64Data: string;
}

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export function ScreenshotGallery({
  screenshots,
  onDelete,
  onDownload,
}: ScreenshotGalleryProps) {
  const [selectedScreenshot, setSelectedScreenshot] =
    useState<Screenshot | null>(null);

  const handleDownload = (screenshot: Screenshot) => {
    const link = document.createElement("a");
    link.href = screenshot.base64Data;
    link.download = `screenshot_${screenshot.id}_${screenshot.timestamp.replace(
      /[:.]/g,
      "-"
    )}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onDownload?.(screenshot.id);
  };

  if (screenshots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Screenshots
          </CardTitle>
          <CardDescription>No screenshots captured yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Screenshots will appear here as the automation runs</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Screenshots
          <Badge variant="outline" className="ml-auto">
            {screenshots.length}
          </Badge>
        </CardTitle>
        <CardDescription>Captured during automation execution</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {screenshots.map((screenshot) => (
              <div
                key={screenshot.id}
                className="border rounded-lg overflow-hidden"
              >
                <div className="relative group">
                  <img
                    src={screenshot.base64Data || "/placeholder.svg"}
                    alt={`Screenshot: ${screenshot.action}`}
                    className="w-full h-32 object-cover cursor-pointer"
                    onClick={() => setSelectedScreenshot(screenshot)}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedScreenshot(screenshot)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(screenshot)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(screenshot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {screenshot.timestamp}
                  </div>
                  <p className="text-sm font-medium truncate">
                    {screenshot.action}
                  </p>
                  {screenshot.url && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">{screenshot.url}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Screenshot Modal */}
        <Dialog
          open={!!selectedScreenshot}
          onOpenChange={() => setSelectedScreenshot(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedScreenshot?.action}</DialogTitle>
              <DialogDescription>
                Captured at {selectedScreenshot?.timestamp}
                {selectedScreenshot?.url && ` from ${selectedScreenshot.url}`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              <img
                src={selectedScreenshot?.base64Data || "/placeholder.svg"}
                alt={`Screenshot: ${selectedScreenshot?.action}`}
                className="max-w-full max-h-[60vh] object-contain rounded border"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  selectedScreenshot && handleDownload(selectedScreenshot)
                }
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {onDelete && selectedScreenshot && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete(selectedScreenshot.id);
                    setSelectedScreenshot(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
