import { Pin } from "lucide-react";
import { Card } from "../ui/Card";
import type { Note } from "../../types";

type Props = {
  note: Note;
  onClick: () => void;
};

export default function NoteCard({
  note,
  onClick,
}: Props) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-teal hover:shadow-lg"
    >
      <div className="flex items-start justify-between">

        <h2 className="font-semibold text-lg line-clamp-2">
          {note.title}
        </h2>

        {note.pinned && (
          <Pin
            size={16}
            className="text-amber fill-amber"
          />
        )}

      </div>

      <div
        className="mt-4 line-clamp-6 text-sm text-muted"
        dangerouslySetInnerHTML={{
          __html: note.body,
        }}
      />

      <div className="mt-5 flex justify-between">

        <span className="text-xs text-teal">
          {note.tags}
        </span>

        {note.favorite && (
          <span>⭐</span>
        )}

      </div>

    </Card>
  );
}