import {
  Upload,
  Trash2,
  Download,
  File,
  Image as ImageIcon,
  FileText,
  Archive,
} from "lucide-react";

import { useRef, useState } from "react";

import type { Attachment } from "../../types";

import {
  uploadAttachment,
  downloadAttachment,
} from "../../services/api";

type Props = {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
};

export default function Attachments({
  attachments,
  onChange,
}: Props) {

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [uploading, setUploading] =
    useState(false);

  const openPicker = () => {
    if (!uploading) {
      inputRef.current?.click();
    }
  };

  const uploadFiles = async (
    files: FileList | null
  ) => {

    if (!files || files.length === 0)
      return;

    setUploading(true);

    try {

      const uploaded: Attachment[] = [];

      for (const file of Array.from(files)) {

        const document =
          await uploadAttachment(file);

        uploaded.push({
          id: document.id,
          title: document.title,
          fileName: document.fileName,
          contentType:
            document.contentType ?? "",
          sizeBytes:  
            document.sizeBytes,
        });

      }

      onChange([
        ...attachments,
        ...uploaded,
      ]);

    } catch (err) {

      console.error(err);

      alert("Upload failed.");

    } finally {

      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

    }

  };

  const removeAttachment = (
    id: number
  ) => {

    onChange(
      attachments.filter(
        (a) => a.id !== id
      )
    );

  };

  const icon = (
    type: string
  ) => {

    if (type.startsWith("image"))
      return (
        <ImageIcon
          size={22}
          className="text-teal"
        />
      );

    if (type.includes("pdf"))
      return (
        <FileText
          size={22}
          className="text-red-400"
        />
      );

    if (
      type.includes("zip") ||
      type.includes("rar")
    )
      return (
        <Archive
          size={22}
          className="text-yellow-400"
        />
      );

    return (
      <File
        size={22}
        className="text-slate-300"
      />
    );
  };

  return ( 
        <div className="space-y-6">

      {/* Upload Area */}

      <div>

        <h3 className="mb-3 text-lg font-semibold">
          Attachments
        </h3>

        <div
          onClick={openPicker}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            uploadFiles(e.dataTransfer.files);
          }}
          className="
            flex
            cursor-pointer
            flex-col
            items-center
            justify-center
            rounded-xl
            border-2
            border-dashed
            border-white/10
            bg-white/5
            p-10
            transition-all
            hover:border-teal
            hover:bg-white/10
          "
        >

          <Upload
            size={46}
            className="mb-4 text-teal"
          />

          <h4 className="text-lg font-semibold">
            Drag & Drop files here
          </h4>

          <p className="mt-2 text-sm text-muted">
            or click to browse
          </p>

          {uploading && (

            <div className="mt-5 flex items-center gap-3 text-teal">

              <div
                className="
                  h-5
                  w-5
                  animate-spin
                  rounded-full
                  border-2
                  border-teal
                  border-t-transparent
                "
              />

              Uploading files...

            </div>

          )}

          <input
            ref={inputRef}
            hidden
            multiple
            type="file"
            onChange={(e) =>
              uploadFiles(e.target.files)
            }
          />

        </div>

      </div>

      {/* Uploaded Files */}

      {attachments.length > 0 && (

        <div className="grid gap-4">
                  {attachments.map((attachment) => {

            const isImage =
              (
                attachment.contentType ??
                ""
              ).startsWith("image");

            return (

              <div
                key={attachment.id}
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-white/10
                  bg-[#0b1518]
                  shadow-lg
                "
              >

                {/* Image Preview */}

                {isImage && (

                  <img
                    src={downloadAttachment(
                      attachment.id
                    )}
                    alt={attachment.fileName}
                    className="
                      h-56
                      w-full
                      object-cover
                    "
                  />

                )}

                {/* File Details */}

                <div className="flex items-center justify-between p-5">

                  <div className="flex items-center gap-4">

                    {!isImage &&
                      icon(
                        attachment.contentType ??
                          ""
                      )}

                    <div>

                      <h4 className="break-all text-base font-semibold">

                        {attachment.fileName}

                      </h4>

                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">

                        <span>

                          📦{" "}
                          {(
                            attachment.sizeBytes /
                            1024
                          ).toFixed(1)}
                          {" "}
                          KB

                        </span>

                        <span>

                          📄{" "}
                          {attachment.contentType ||
                            "Unknown"}

                        </span>

                      </div>

                    </div>

                  </div>

                  {/* Buttons */}

                  <div className="flex gap-2">

                    <a
                      href={downloadAttachment(
                        attachment.id
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        rounded-lg
                        bg-teal/20
                        p-2.5
                        transition-all
                        hover:bg-teal
                        hover:text-black
                      "
                    >

                      <Download size={18} />

                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        removeAttachment(
                          attachment.id
                        )
                      }
                      className="
                        rounded-lg
                        bg-red-500/20
                        p-2.5
                        transition-all
                        hover:bg-red-500
                        hover:text-white
                      "
                    >

                      <Trash2 size={18} />

                    </button>

                  </div>

                </div>

              </div>

            );

          })}
                  </div>

      )}

      {attachments.length === 0 && (

        <div
          className="
            rounded-xl
            border
            border-dashed
            border-white/10
            bg-white/5
            p-8
            text-center
            text-muted
          "
        >

          <File
            size={42}
            className="mx-auto mb-4 opacity-50"
          />

          <p className="text-lg font-medium">
            No attachments yet
          </p>

          <p className="mt-2 text-sm">
            Upload images, PDFs, Word documents,
            Excel sheets, ZIP files and more.
          </p>

        </div>

      )}

    </div>

  );

}