import { Node, mergeAttributes } from '@tiptap/core';
import type { NodeViewProps } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { DrawingCanvas } from '../atoms/DrawingCanvas.js';

/* ── Styled ── */

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  max-width: 100%;
  margin: 8px 0;
  cursor: default;

  &:hover .drawing-edit-btn {
    opacity: 1;
  }
`;

const DrawingImg = styled.img`
  display: block;
  max-width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  border: 1px solid var(--accent-stroke, ${({ theme }) => theme.colors.border});
`;

const EditBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  font-size: 13px;
  font-family: var(--font-label);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.surfaceHover}; }
`;

/* ── Node View ── */

function DrawingNodeView({ node, updateAttributes }: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const svg = node.attrs.svgContent as string;

  const handleSave = (newSvg: string) => {
    updateAttributes({ svgContent: newSvg });
    setEditing(false);
  };

  return (
    <NodeViewWrapper>
      <Wrapper>
        {svg && (
          <DrawingImg
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
            alt="Drawing"
            draggable={false}
          />
        )}
        <EditBtn
          className="drawing-edit-btn"
          onClick={() => setEditing(true)}
          contentEditable={false}
        >
          Edit
        </EditBtn>
      </Wrapper>
      {editing && createPortal(
        <DrawingCanvas
          initialSvg={svg || undefined}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />,
        document.body
      )}
    </NodeViewWrapper>
  );
}

/* ── TipTap Node ── */

export const DrawingNode = Node.create({
  name: 'drawing',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      svgContent: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="drawing"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'drawing' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DrawingNodeView);
  },
});
