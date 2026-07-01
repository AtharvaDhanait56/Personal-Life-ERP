import { Plus, Pin } from "lucide-react";
import type { Note } from "../../types";
import SearchBar from "./SearchBar";

type Props = {
  notes: Note[];
  search: string;
  selectedId: number | null;
  onSearch: (value: string) => void;
  onSelect: (note: Note) => void;
  onNew: () => void;
};

export default function NotesSidebar({
  notes,
  search,
  selectedId,
  onSearch,
  onSelect,
  onNew,
}: Props) {
  const pinned = notes.filter((n) => n.pinned);
  const others = notes.filter((n) => !n.pinned);

  const renderItem = (note: Note) => (
    <button
      key={note.id}
      onClick={() => onSelect(note)}
      className={`w-full border-l-4 px-4 py-3 text-left transition ${
        selectedId === note.id
          ? "border-teal bg-white/10"
          : "border-transparent hover:bg-white/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <h4 className="truncate font-medium">
          {note.title || "Untitled"}
        </h4>

        {note.pinned && (
          <Pin size={14} className="text-amber-400" />
        )}
      </div>

      <p className="mt-1 line-clamp-2 text-xs text-muted">
        {(note.body || "")
          .replace(/<[^>]*>/g, "")
          .substring(0, 80)}
      </p>
    </button>
  );

  return (
    <aside className="flex h-full w-80 flex-col border-r border-white/10 bg-[#0b1518]">

      <div className="border-b border-white/10 p-4">

        <button
          onClick={onNew}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-teal py-3 font-semibold text-slate-900 hover:opacity-90"
        >
          <Plus size={18} />
          New Note
        </button>

        <SearchBar
          value={search}
          onChange={onSearch}
        />

      </div>

      <div className="flex-1 overflow-y-auto">

        {pinned.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs uppercase text-muted">
              Pinned
            </div>
            {pinned.map(renderItem)}
          </>
        )}

        <div className="px-4 py-2 text-xs uppercase text-muted">
          Notes
        </div>

        {others.map(renderItem)}

      </div>

    </aside>
  );
}