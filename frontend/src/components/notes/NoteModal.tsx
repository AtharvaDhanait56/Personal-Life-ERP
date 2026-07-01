import { Dialog, DialogPanel } from "@headlessui/react";
import { Pin, PinOff, Trash2, X } from "lucide-react";

import RichTextEditor from "./RichTextEditor";
import ColorPicker from "./ColorPicker";
import Attachments from "./Attachments";
import Checklist from "./Checklist";

import type { Note, ChecklistItem, Attachment } from "../../types";

type Props = {
  open: boolean;
  note: Note | null;

  onClose: () => void;

  onChange: (note: Note) => void;

  onDelete: (id: number) => void;
};

export default function NoteModal({
  open,
  note,
  onClose,
  onChange,
  onDelete,
}: Props) {
  if (!note) return null;

  const checklist: ChecklistItem[] = note.checklistJson
    ? JSON.parse(note.checklistJson)
    : [];

  const attachments: Attachment[] = note.attachmentsJson
    ? JSON.parse(note.attachmentsJson)
    : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-center justify-center p-6">

        <DialogPanel
          className="
            w-full
            max-w-4xl
            rounded-2xl
            border
            border-white/10
            bg-[#071012]
            shadow-2xl
          "
        >
          {/* Header */}

          <div className="flex items-center justify-between border-b border-white/10 p-5">

            <input
              value={note.title}
              onChange={(e) =>
                onChange({
                  ...note,
                  title: e.target.value,
                })
              }
              placeholder="Title..."
              className="
                w-full
                bg-transparent
                text-2xl
                font-semibold
                outline-none
              "
            />

            <div className="ml-4 flex gap-2">

              <button
                onClick={() =>
                  onChange({
                    ...note,
                    pinned: !note.pinned,
                  })
                }
              >
                {note.pinned ? (
                  <PinOff size={20} />
                ) : (
                  <Pin size={20} />
                )}
              </button>

              <button
                onClick={() => {

                  if (
                    confirm(
                      "Delete this note?"
                    )
                  ) {

                    onDelete(note.id);

                  }

                }}
              >
                <Trash2 size={20} />
              </button>

              <button onClick={onClose}>
                <X size={20} />
              </button>

            </div>

          </div>

          {/* Editor */}

          <div className="space-y-6 p-6">

            <RichTextEditor
              value={note.body}
              onChange={(body) =>
                onChange({
                  ...note,
                  body,
                })
              }
            />

            <Checklist
              items={checklist}
              onChange={(items) =>
                onChange({
                  ...note,
                  checklistJson: JSON.stringify(items),
                })
              }
            />

            <Attachments
              attachments={attachments}
              onChange={(items) =>
                onChange({
                  ...note,
                  attachmentsJson: JSON.stringify(items),
                })
              }
            />

            <div>

              <h3 className="mb-3 text-sm font-semibold">
                Note Color
              </h3>

              <ColorPicker
                value={note.color ?? "#ffffff"}
                onChange={(color) =>
                  onChange({
                    ...note,
                    color,
                  })
                }
              />

            </div>

          </div>

        </DialogPanel>

      </div>

    </Dialog>
  );
}