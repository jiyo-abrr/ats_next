"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import DOMPurify from "isomorphic-dompurify";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Redo,
  Undo,
} from "lucide-react";

import { cn } from "cn";

function extensions(placeholder?: string) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      // keep the surface small — no code blocks / blockquotes / hr for job copy
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
    }),
    Placeholder.configure({ placeholder: placeholder ?? "" }),
  ];
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-7 place-items-center rounded text-sm disabled:opacity-40",
        active ? "bg-accent text-accent-foreground" : "hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className="font-semibold">H</span>
      </ToolbarButton>
      <ToolbarButton
        label="Bulleted list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <span className="bg-border mx-1 h-4 w-px" />
      <ToolbarButton
        label="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="size-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  id,
  invalid,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  id?: string;
  invalid?: boolean;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: extensions(placeholder),
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id: id ?? "",
        class:
          "rich-text min-h-32 resize-y overflow-y-auto px-3 py-2 text-sm outline-none",
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onBlur: () => onBlur?.(),
  });

  // Keep the editor in sync when the form resets / loads async data.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="border-input bg-muted/20 h-40 rounded-lg border" aria-hidden />
    );
  }

  return (
    <div
      data-invalid={invalid}
      className={cn(
        "border-input focus-within:border-ring focus-within:ring-ring/50 overflow-hidden rounded-lg border transition-colors focus-within:ring-3",
        invalid &&
          "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

/** Tags/attributes the editor can produce — anything else is stripped. */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "s",
    "u",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "a",
  ],
  ALLOWED_ATTR: ["href", "target", "rel"],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
};

/** Read-only render of editor HTML (job description on careers/preview pages).
 * The stored HTML is authored in the ATS but rendered on the public careers
 * page, so it is always sanitized before injection. */
export function RichText({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(html);
  const raw = looksLikeHtml
    ? html
    : `<p>${html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/\n/g, "<br />")}</p>`;
  const safe = DOMPurify.sanitize(raw, SANITIZE_CONFIG);
  return (
    <div
      className={cn("rich-text text-sm", className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
