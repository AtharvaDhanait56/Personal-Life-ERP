import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Undo,
    Redo,
    Highlighter,
} from "lucide-react";

import { Editor } from "@tiptap/react";

type Props = {
    editor: Editor | null;
};

export default function Toolbar({

    editor,

}: Props) {

    if (!editor)
        return null;

    return (

        <div className="flex flex-wrap gap-2 border-b border-white/10 p-3">

            <button
                onClick={() =>
                    editor.chain().focus().toggleBold().run()
                }
            >
                <Bold size={18}/>
            </button>

            <button
                onClick={() =>
                    editor.chain().focus().toggleItalic().run()
                }
            >
                <Italic size={18}/>
            </button>

            <button
                onClick={() =>
                    editor.chain().focus().toggleUnderline().run()
                }
            >
                <Underline size={18}/>
            </button>

            <button
                onClick={() =>
                    editor.chain().focus().toggleHighlight().run()
                }
            >
                <Highlighter size={18}/>
            </button>

            <button
                onClick={() =>
                    editor.chain().focus().toggleHeading({
                        level:1,
                    }).run()
                }
            >
                <Heading1 size={18}/>
            </button>

            <button
                onClick={() =>
                    editor.chain().focus().toggleHeading({
                        level:2,
                    }).run()
                }
            >
                <Heading2 size={18}/>
            </button>

            <button
                onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                }
            >
                <List size={18}/>
            </button>

            <button
                onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                }
            >
                <ListOrdered size={18}/>
            </button>

            <button
                onClick={() =>
                    editor.chain().focus().undo().run()
                }
            >
                <Undo size={18}/>
            </button>

            <button
                onClick={() =>
                    editor.chain().focus().redo().run()
                }
            >
                <Redo size={18}/>
            </button>

        </div>

    );

}