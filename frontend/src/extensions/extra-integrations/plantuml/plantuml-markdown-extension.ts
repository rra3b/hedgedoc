/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type MarkdownIt from 'markdown-it'
import plantuml from 'markdown-it-plantuml'
import type Renderer from 'markdown-it/lib/renderer'
import type Token from 'markdown-it/lib/token'
import type { Options } from 'markdown-it/lib'
import { PlantumlNotConfiguredComponentReplacer } from './plantuml-not-configured-component-replacer'
import { Optional } from '@mrdrogdrog/optional'
import type { ComponentReplacer } from '../../../components/markdown-renderer/replace-components/component-replacer'
import { getGlobalState } from '../../../redux'
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'

/**
 * Adds support for chart rendering using plantuml to the markdown rendering using code fences with "plantuml" as language.
 *
 * @see https://plantuml.com
 */
export class PlantumlMarkdownExtension extends MarkdownRendererExtension {
  constructor() {
    super()
  }

  private plantumlError(markdownIt: MarkdownIt): void {
    const defaultRenderer: Renderer.RenderRule = markdownIt.renderer.rules.fence || (() => '')
    markdownIt.renderer.rules.fence = (tokens: Token[], idx: number, options: Options, env, slf: Renderer) => {
      return tokens[idx].info === 'plantuml'
        ? '<plantuml-not-configured></plantuml-not-configured>'
        : defaultRenderer(tokens, idx, options, env, slf)
    }
  }

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    Optional.ofNullable(getGlobalState().config.plantumlServer)
      .map((plantumlServer) =>
        plantuml(markdownIt, {
          openMarker: '```plantuml',
          closeMarker: '```',
          server: plantumlServer
        })
      )
      .orElseGet(() => this.plantumlError(markdownIt))
  }

  public buildTagNameAllowList(): string[] {
    return ['plantuml-not-configured']
  }

  buildReplacers(): ComponentReplacer[] {
    return [new PlantumlNotConfiguredComponentReplacer()]
  }
}
