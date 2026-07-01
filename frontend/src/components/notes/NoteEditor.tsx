import {
  Archive,
  Heart,
  HeartOff,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";

import type { Note, ChecklistItem, Attachment } from "../../types";

import RichTextEditor from "./RichTextEditor";
import ColorPicker from "./ColorPicker";
import Checklist from "./Checklist";
import Attachments from "./Attachments";

type Props = {
  note: Note | null;
  onChange: (note: Note) => void;
  onDelete: (id: number) => void;
};

export default function NoteEditor({
  note,
  onChange,
  onDelete,
}: Props) {
  if (!note) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted">
        <h2>Select a note to start editing</h2>
      </div>
    );
  }

  const checklist: ChecklistItem[] =
    note.checklistJson
      ? JSON.parse(note.checklistJson)
      : [];

  const attachments: Attachment[] =
    note.attachmentsJson
      ? JSON.parse(note.attachmentsJson)
      : [];

  // Note colors are light pastels, but this app's text is hardcoded white for
  // the dark theme. Painting the whole panel a solid pastel color made text and
  // icons unreadable. Instead we blend a low-opacity tint of the chosen color
  // over the app's normal dark background, so the color is still visible but
  // white text stays legible.
  const tint =
    note.color && note.color.toLowerCase() !== "#071012"
      ? `${note.color}33`
      : undefined;

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden bg-[#071012] transition-colors duration-300"
      style={{
        backgroundColor: tint,
      }}
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
          placeholder="Untitled Note"
          className="
            w-full
            bg-transparent
            text-3xl
            font-bold
            outline-none
          "
        />

        <div className="ml-4 flex gap-3">

          <button
            type="button"
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
            type="button"
            onClick={() =>
              onChange({
                ...note,
                favorite: !note.favorite,
              })
            }
          >
            {note.favorite ? (
              <Heart
                size={20}
                className="fill-red-500 text-red-500"
              />
            ) : (
              <HeartOff size={20} />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({
                ...note,
                archived: true,
              })
            }
          >
            <Archive size={20} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm("Delete this note?")) {
                onDelete(note.id);
              }
            }}
          >
            <Trash2
              size={20}
              className="text-red-500"
            />
          </button>

        </div>

      </div>

      {/* Body */}

      <div className="flex-1 overflow-y-auto space-y-6 p-6">

        <RichTextEditor
          value={note.body}
          onChange={(body) =>
            onChange({
              ...note,
              body,
            })
          }
        />

        {/* Checklist */}

        <Checklist
          items={checklist}
          onChange={(items) =>
            onChange({
              ...note,
              checklistJson: JSON.stringify(items),
            })
          }
        />

        {/* Attachments */}

        <Attachments
          attachments={attachments}
          onChange={(items) =>
            onChange({
              ...note,
              attachmentsJson: JSON.stringify(items),
            })
          }
        />

        {/* Note Color */}

        <div>

          <h3 className="mb-2 font-semibold">
            Note Color
          </h3>

          <ColorPicker
            value={note.color || "#ffffff"}
            onChange={(color) =>
              onChange({
                ...note,
                color,
              })
            }
          />

        </div>

        {/* Tags */}

        <div>

          <label className="mb-2 block font-semibold">
            Tags
          </label>

          <input
            value={note.tags || ""}
            onChange={(e) =>
              onChange({
                ...note,
                tags: e.target.value,
              })
            }
            placeholder="work, personal..."
            className="
              w-full
              rounded-lg
              border
              border-white/10
              bg-white/6
              p-3
              outline-none
            "
          />

        </div>

      </div>

    </div>
  );
}
