import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

import Toolbar from "./Toolbar";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({
  value,
  onChange,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,

      Underline,

      Highlight,

      Link.configure({
        openOnClick: true,
      }),

      Image,

      TaskList,

      TaskItem.configure({
        nested: true,
      }),

      Placeholder.configure({
        placeholder: "Start writing your note...",
      }),
    ],

    content: value,

    immediatelyRender: false,

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Keep editor synchronized when opening another note
  useEffect(() => {
    if (!editor) return;

    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/6">

      <Toolbar editor={editor} />

      <EditorContent
        editor={editor}
        className="
          min-h-[320px]
          p-5
          max-w-none
          focus:outline-none
        "
      />

    </div>
  );
}