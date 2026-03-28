import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import styled from 'styled-components';
import { useEffect, useMemo } from 'react';

const EditorWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;

  .tiptap {
    flex: 1;
    padding: ${({ theme }) => theme.spacing.md}px;
    outline: none;
    font-size: ${({ theme }) => theme.fontSize.md}px;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text};

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: ${({ theme }) => theme.colors.textMuted};
      pointer-events: none;
      height: 0;
    }

    h1 { font-size: 1.5em; font-weight: 700; margin: 0.5em 0; }
    h2 { font-size: 1.25em; font-weight: 600; margin: 0.5em 0; }
    h3 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0; }
    ul, ol { padding-left: 1.5em; }
    blockquote {
      border-left: 3px solid ${({ theme }) => theme.colors.border};
      padding-left: 1em;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
    code {
      background: rgba(0,0,0,0.05);
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 0.9em;
    }
    pre {
      background: rgba(0,0,0,0.05);
      padding: 12px;
      border-radius: 6px;
      code { background: none; padding: 0; }
    }
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
`;

const ToolbarDivider = styled.div`
  width: 1px;
  height: 20px;
  background: ${({ theme }) => theme.colors.border};
  margin: 0 4px;
`;

const ToolbarButton = styled.button<{ $active?: boolean }>`
  padding: 4px 8px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  font-weight: ${({ $active, theme }) => $active ? theme.fontWeight.bold : theme.fontWeight.normal};
  color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.textSecondary};
  background: ${({ $active }) => $active ? 'rgba(0, 180, 216, 0.08)' : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

function createCharLimitPlugin(getLimit: () => number | undefined) {
  return new Plugin({
    key: new PluginKey('charLimit'),
    filterTransaction(tr, state) {
      const limit = getLimit();
      if (limit === undefined) return true; // no limit
      if (!tr.docChanged) return true;
      const newText = tr.doc.textContent;
      const oldText = state.doc.textContent;
      // Allow deletions and same-length changes
      if (newText.length <= oldText.length) return true;
      // Block if new text exceeds limit
      return newText.length <= limit;
    },
  });
}

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  charLimit?: number;
}

export function Editor({ content, onChange, readOnly = false, placeholder = 'Start writing...', charLimit }: EditorProps) {
  // Store charLimit in a ref-like closure so the plugin always sees the latest value
  const limitRef = useMemo(() => ({ current: charLimit }), []);
  limitRef.current = charLimit;

  const charLimitExtension = useMemo(() =>
    Extension.create({
      name: 'charLimit',
      addProseMirrorPlugins() {
        return [createCharLimitPlugin(() => limitRef.current)];
      },
    }),
  []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      charLimitExtension,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  // Sync content from parent
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <EditorWrapper>
      {!readOnly && (
        <Toolbar>
          <ToolbarButton
            $active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >B</ToolbarButton>
          <ToolbarButton
            $active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          ><em>I</em></ToolbarButton>
          <ToolbarButton
            $active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          ><s>S</s></ToolbarButton>
          <ToolbarButton
            $active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >&lt;/&gt;</ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            $active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >H1</ToolbarButton>
          <ToolbarButton
            $active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >H2</ToolbarButton>
          <ToolbarButton
            $active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >H3</ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            $active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >• List</ToolbarButton>
          <ToolbarButton
            $active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >1. List</ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            $active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >"</ToolbarButton>
          <ToolbarButton
            $active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >{'{}'}</ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >—</ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >↩</ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >↪</ToolbarButton>
        </Toolbar>
      )}
      <EditorContent editor={editor} />
    </EditorWrapper>
  );
}
