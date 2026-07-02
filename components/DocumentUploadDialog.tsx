"use client";

import { useRef, useState } from "react";
import { uploadDocument } from "@/lib/api/document";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function DocumentUploadDialog() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatus("uploading");
    setMessage("");

    try {
      const response = await uploadDocument(file);
      setStatus("success");
      setMessage(response.message);
    } catch {
      setStatus("error");
      setMessage("업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      // 같은 파일 재업로드를 위해 input 초기화
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setStatus("idle");
      setMessage("");
      setFileName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          문서 업로드
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>문서 업로드</DialogTitle>
          <DialogDescription>
            PDF, Word, 텍스트 파일을 업로드하면 해당 문서를 기반으로 답변합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 업로드 영역 */}
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 px-6 py-10 cursor-pointer hover:border-muted-foreground/60 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <p className="text-sm text-muted-foreground">
              클릭하여 파일 선택
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              PDF, DOCX, TXT 지원
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleFileChange}
              disabled={status === "uploading"}
            />
          </div>

          {/* 상태 메시지 */}
          {status === "uploading" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span>{fileName} 업로드 중...</span>
            </div>
          )}
          {status === "success" && (
            <p className="text-sm text-green-600">{message}</p>
          )}
          {status === "error" && (
            <p className="text-sm text-destructive">{message}</p>
          )}
        </div>

        {status === "success" && (
          <Button className="w-full" onClick={() => handleOpenChange(false)}>
            닫기
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
