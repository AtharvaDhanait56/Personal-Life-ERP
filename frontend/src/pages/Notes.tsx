import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Note } from "../types";

import {
  createNote,
  deleteNote,
  fetchNotes,
  updateNote,
} from "../services/api";

import NotesSidebar from "../components/notes/NotesSidebar";
import NoteEditor from "../components/notes/NoteEditor";
import EmptyState from "../components/notes/EmptyState";

export function Notes() {

  const queryClient = useQueryClient();

  const {
    data: notes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  const [search, setSearch] = useState("");

  const [selectedNote, setSelectedNote] =
    useState<Note | null>(null);

  const filteredNotes = useMemo(() => {

    const keyword = search.toLowerCase();

    return [...notes]

      .filter((note) => {

        if (note.archived) return false;

        return (

          note.title
            .toLowerCase()
            .includes(keyword)

          ||

          note.body
            .toLowerCase()
            .includes(keyword)

          ||

          (note.tags ?? "")
            .toLowerCase()
            .includes(keyword)

        );

      })

      .sort(
        (a, b) =>
          Number(b.pinned) -
          Number(a.pinned)
      );

  }, [notes, search]);

  useEffect(() => {

    if (
      !selectedNote &&
      filteredNotes.length
    ) {

      setSelectedNote(filteredNotes[0]);

    }

  }, [filteredNotes]);

  const createMutation = useMutation({

    mutationFn: createNote,

    onSuccess(note) {

      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });

      setSelectedNote(note);

    },

  });

  const updateMutation = useMutation({

    mutationFn: updateNote,

    onSuccess(updated) {

      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });

      setSelectedNote(updated);

    },

  });

  const deleteMutation = useMutation({

    mutationFn: deleteNote,

    onSuccess() {

      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });

      setSelectedNote(null);

    },

  });

    // Auto Save
  // Only autosave when the note content was actually edited (dirtyRef.current),
  // never just because the user selected a note or a save response replaced the
  // object reference — otherwise every save would set a "new" selectedNote,
  // re-trigger this effect, and save again forever.
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!selectedNote || !selectedNote.id || !dirtyRef.current) return;

    const timer = setTimeout(() => {
      dirtyRef.current = false;
      updateMutation.mutate(selectedNote);
    }, 800);

    return () => clearTimeout(timer);
  }, [selectedNote]);

  const createNewNote = () => {
  createMutation.mutate({
    title: "Untitled Note",
    body: "",
    format: "HTML",
    tags: "",
    pinned: false,
    favorite: false,
    archived: false,
    color: "#ffffff",

    checklistJson: "[]",
    attachmentsJson: "[]",
  });
};

  const selectNote = (note: Note | null) => {
    dirtyRef.current = false;
    setSelectedNote(note);
  };

  const updateSelectedNote = (note: Note) => {
    dirtyRef.current = true;
    setSelectedNote(note);
  };

  const removeSelectedNote = (id: number) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        Loading Notes...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        Unable to load notes.
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-xl border border-white/10 bg-[#071012]">

      <NotesSidebar
        notes={filteredNotes}
        search={search}
        selectedId={selectedNote?.id ?? null}
        onSearch={setSearch}
        onSelect={selectNote}
        onNew={createNewNote}
      />

      {selectedNote ? (
        <NoteEditor
          note={selectedNote}
          onChange={updateSelectedNote}
          onDelete={removeSelectedNote}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState />
        </div>
      )}

    </div>
  );
}