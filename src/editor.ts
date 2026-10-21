import { EditorView, keymap, drawSelection, highlightActiveLine, placeholder } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { StreamLanguage, HighlightStyle, syntaxHighlighting, bracketMatching } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { stex } from '@codemirror/legacy-modes/mode/stex';
import { tags as t } from '@lezer/highlight';

// LaTeX mode that only auto-closes brackets, never quotes (quotes are rare and odd in math).
const latex = StreamLanguage.define({
  ...stex,
  languageData: { closeBrackets: { brackets: ['(', '[', '{'] } },
});

const highlight = HighlightStyle.define([
  { tag: t.tagName, color: 'var(--accent)', fontWeight: '600' },
  { tag: [t.bracket, t.squareBracket, t.brace], color: 'var(--muted)' },
  { tag: t.keyword, color: 'var(--accent)' },
  { tag: [t.atom, t.number], color: 'var(--ink)' },
  { tag: t.comment, color: 'var(--muted)', fontStyle: 'italic' },
  { tag: t.invalid, color: 'var(--accent)', textDecoration: 'underline wavy' },
]);

const theme = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: 'var(--ink)', height: '100%' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', fontSize: '17px', lineHeight: '1.6' },
  '.cm-content': { padding: '14px 0', caretColor: 'var(--accent)' },
  '.cm-line': { padding: '0 16px' },
  '.cm-cursor': { borderLeftColor: 'var(--accent)', borderLeftWidth: '2px' },
  '.cm-activeLine': { backgroundColor: 'rgba(30, 27, 24, 0.04)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(232, 83, 43, 0.22) !important',
  },
  '.cm-matchingBracket': { backgroundColor: 'rgba(232, 83, 43, 0.18)', outline: 'none' },
  '.cm-placeholder': { color: 'var(--muted)', fontStyle: 'italic' },
});

export interface EditorOptions {
  parent: HTMLElement;
  onChange: (text: string) => void;
  onSubmit: () => void;
}

export function createEditor({ parent, onChange, onSubmit }: EditorOptions): EditorView {
  return new EditorView({
    parent,
    state: EditorState.create({
      extensions: [
        history(),
        drawSelection(),
        highlightActiveLine(),
        bracketMatching(),
        closeBrackets(),
        latex,
        syntaxHighlighting(highlight),
        theme,
        EditorView.lineWrapping,
        placeholder('type LaTeX here, e.g. \\frac{a}{b}'),
        EditorView.contentAttributes.of({ 'aria-label': 'LaTeX source editor', spellcheck: 'false' }),
        keymap.of([
          { key: 'Mod-Enter', run: () => (onSubmit(), true) },
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange(u.state.doc.toString());
        }),
      ],
    }),
  });
}

export function setText(view: EditorView, text: string): void {
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
}
