import { StickyNote } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center text-center">

      <StickyNote
        size={64}
        className="text-muted"
      />

      <h2 className="mt-5 text-xl font-semibold">
        No Notes Yet
      </h2>

      <p className="mt-2 text-muted">
        Create your first note.
      </p>

    </div>
  );
}