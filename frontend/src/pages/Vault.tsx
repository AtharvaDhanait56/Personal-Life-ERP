import { Download, Eye, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { deleteDocument, downloadAttachment, fetchDocuments, previewAttachment, uploadAttachment } from "../services/api";

export function Vault() {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: documents = [], isLoading, isError } = useQuery({ queryKey: ["documents"], queryFn: fetchDocuments });
  const [title, setTitle] = useState("");

  const uploadDocument = useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) => uploadAttachment(file, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] })
  });

  const removeDocument = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] })
  });

  const onFile = (file?: File) => {
    if (!file) {
      return;
    }
    const cleanTitle = title.trim() || file.name.replace(/\.[^/.]+$/, "");
    uploadDocument.mutate({ file, title: cleanTitle });
    setTitle("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const viewDocument = (id: number) => {
    // Opens in a new tab and lets the browser render it (PDF/image viewers)
    // instead of forcing a download.
    window.open(previewAttachment(id), "_blank", "noopener,noreferrer");
  };

  const saveDocument = (id: number) => {
    const link = window.document.createElement("a");
    link.href = downloadAttachment(id);
    link.click();
  };

  return (
    <div className="grid gap-4">
      <Card className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <h2 className="text-lg font-semibold">Document Vault</h2>
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none" placeholder="Document title" />
        <div className="flex gap-2">
          <input ref={inputRef} type="file" className="hidden" onChange={(event) => onFile(event.target.files?.[0])} />
          <Button disabled={uploadDocument.isPending} onClick={() => inputRef.current?.click()}><Upload size={16} /> Upload</Button>
        </div>
      </Card>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading && <Card>Loading documents...</Card>}
        {isError && <Card>Unable to load documents.</Card>}
        {documents.length === 0 && !isLoading && <Card>No documents yet.</Card>}
        {documents.map((document) => (
          <Card key={document.id}>
            <p className="text-xs text-muted">{document.documentType}</p>
            <h3 className="mt-2 font-semibold">{document.title}</h3>
            <p className="mt-2 text-sm text-muted">{document.fileName}</p>
            <p className="mt-1 text-xs text-muted">{Math.round(document.sizeBytes / 1024)} KB</p>
            <div className="mt-4 flex gap-2">
              <Button className="h-9 px-3" onClick={() => viewDocument(document.id)} title="Open"><Eye size={15} /></Button>
              <Button className="h-9 px-3" onClick={() => saveDocument(document.id)} title="Download"><Download size={15} /></Button>
              <Button
                className="h-9 px-3"
                title="Delete"
                onClick={() => {
                  if (confirm(`Delete "${document.title}"?`)) {
                    removeDocument.mutate(document.id);
                  }
                }}
              >
                <Trash2 size={15} />
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
