/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import Optional from 'optional-js'
import type { CodeMirrorSelection } from './code-mirror-selection'
import type { ContentFormatter } from './change-content-context'
import { useCodeMirrorReference } from './change-content-context'
import type { CursorSelection } from '../editor-pane/tool-bar/formatters/types/cursor-selection'
import type { EditorView } from '@codemirror/view'

/**
 * Changes the content of the given CodeMirror view using the given formatter function.
 *
 * @param view The CodeMirror view whose content should be changed
 * @param formatter A function that generates changes that get dispatched to CodeMirror
 */
export const changeEditorContent = (view: EditorView, formatter: ContentFormatter): void => {
  const [changes, selection] = formatter({
    currentSelection: {
      from: view.state.selection.main.from,
      to: view.state.selection.main.to
    },
    markdownContent: view.state.doc.toString()
  })

  view.dispatch({ changes: changes, selection: convertSelectionToCodeMirrorSelection(selection) })
}

/**
 * Provides a {@link ContentFormatter formatter function} that is linked to the current CodeMirror-View
 * @see changeEditorContent
 */
export const useChangeEditorContentCallback = () => {
  const codeMirrorRef = useCodeMirrorReference()
  return useMemo(() => {
    if (codeMirrorRef) {
      return (callback: ContentFormatter) => changeEditorContent(codeMirrorRef, callback)
    }
  }, [codeMirrorRef])
}

const convertSelectionToCodeMirrorSelection = (selection: CursorSelection | undefined) => {
  return Optional.ofNullable(selection)
    .map<CodeMirrorSelection | undefined>((selection) => ({ anchor: selection.from, head: selection.to }))
    .orElse(undefined)
}
