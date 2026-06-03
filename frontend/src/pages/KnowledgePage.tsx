import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, FileUp, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { ListPagination } from "@/components/list-pagination";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListPagination } from "@/hooks/use-list-pagination";
import { api } from "@/api/client";
import { type PaginatedResponse, paginatedUrl } from "@/lib/pagination";

interface Document {
  id: number;
  filename: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ready: "default",
  processing: "secondary",
  failed: "destructive",
};

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

async function uploadDocument(file: File): Promise<Document> {
  const form = new FormData();
  form.append("file", file);
  const token = localStorage.getItem("access_token");
  const res = await fetch("/api/v1/documents", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err.detail === "string" ? err.detail : `Failed to upload ${file.name}`
    );
  }
  return res.json();
}

export default function KnowledgePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const { offset, setOffset, reset } = useListPagination();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["documents", offset],
    queryFn: () => api<PaginatedResponse<Document>>(paginatedUrl("/documents", offset)),
  });

  const docs = data?.items ?? [];
  const total = data?.total ?? 0;

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      const accepted = files.filter(isAcceptedFile);
      const rejected = files.length - accepted.length;

      if (accepted.length === 0) {
        throw new Error("Only PDF, DOCX, and TXT files are supported");
      }

      let succeeded = 0;
      let failed = 0;

      for (let i = 0; i < accepted.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${accepted.length}…`);
        try {
          await uploadDocument(accepted[i]);
          succeeded++;
        } catch {
          failed++;
        }
      }

      return { succeeded, failed, rejected };
    },
    onSuccess: ({ succeeded, failed, rejected }) => {
      reset();
      qc.invalidateQueries({ queryKey: ["documents"] });
      setUploadProgress(null);
      if (succeeded > 0) {
        toast.success(
          succeeded === 1
            ? "Document uploaded — indexing started"
            : `${succeeded} documents uploaded — indexing started`
        );
      }
      if (failed > 0) {
        toast.error(
          failed === 1 ? "1 file failed to upload" : `${failed} files failed to upload`
        );
      }
      if (rejected > 0) {
        toast.error(
          rejected === 1
            ? "1 file skipped (unsupported type)"
            : `${rejected} files skipped (unsupported type)`
        );
      }
    },
    onError: (err) => {
      setUploadProgress(null);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    },
  });

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    upload.mutate(Array.from(fileList));
  };

  const isUploading = upload.isPending;

  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        description="Upload one or more PDF or DOCX files. ALF answers customer questions from these documents (RAG)."
      >
        <>
          <Button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileUp className="size-4" />
            )}
            {isUploading && uploadProgress ? uploadProgress : "Upload PDF / DOCX"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            multiple
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No documents yet"
          description="Upload project brochures and price sheets (PDF or DOCX). You can select multiple files at once."
        />
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {docs.map((d) => (
              <Card key={d.id}>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{d.filename}</p>
                    {d.error_message && (
                      <p className="mt-1 text-xs text-destructive">{d.error_message}</p>
                    )}
                  </div>
                  <Badge
                    variant={statusVariant[d.status] ?? "outline"}
                    className="capitalize shrink-0"
                  >
                    {d.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <ListPagination offset={offset} total={total} onOffsetChange={setOffset} />
        </div>
      )}
    </div>
  );
}
