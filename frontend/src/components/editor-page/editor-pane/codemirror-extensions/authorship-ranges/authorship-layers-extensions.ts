/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Range, Transaction } from '@codemirror/state'
import { StateEffect, StateField } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { Decoration, EditorView } from '@codemirror/view'
import { Logger } from '../../../../../utils/logger'

export interface AuthorshipUpdate {
  from: number
  to: number
  userId: string
  localUpdate: boolean
}

type MarkDecoration = {
  attributes?: Record<string, string>
}

const logger = new Logger('AuthorshipLayersExtensions')

const createMark = (from: number, to: number, userId: string): Range<Decoration> => {
  logger.debug('createMark from', from, 'to', to, 'userId', userId)
  return Decoration.mark({
    class: 'authorship-highlight',
    attributes: {
      'data-user-id': userId
    }
  }).range(from, to)
}

/**
 * Used to provide a new set of {@link Authorship authorships} to a codemirror state.
 */
export const authorshipsUpdateEffect = StateEffect.define<AuthorshipUpdate>({
  map: (value, change) => ({ ...value, from: change.mapPos(value.from), to: change.mapPos(value.to) })
})

/**
 * Saves the currently visible {@link RemoteCursor remote cursors}
 * and saves new cursors if a transaction with an {@link remoteCursorUpdateEffect update effect} has been dispatched.
 */
export const authorshipsStateField = StateField.define<DecorationSet>({
  create(): DecorationSet {
    return Decoration.none
  },
  update(authorshipDecorations: DecorationSet, transaction: Transaction) {
    authorshipDecorations = authorshipDecorations.map(transaction.changes)
    const effects = transaction.effects.filter((effect) => effect.is<AuthorshipUpdate>(authorshipsUpdateEffect))
    if (effects.length === 0) {
      return authorshipDecorations
    }
    effects.forEach((effect: StateEffect<AuthorshipUpdate>) => {
      const addedDecorations: Range<Decoration>[] = []
      const effectUserId = effect.value.userId
      const effectFrom = effect.value.from
      const effectTo = effect.value.to
      const effectIsLocal = effect.value.localUpdate
      const effectLength = effectTo - effectFrom
      logger.debug(
        'eff_from',
        effectFrom,
        'eff_to',
        effectTo,
        'eff_user',
        effectUserId,
        'eff_len',
        effectLength,
        'eff_local',
        effectIsLocal
      )
      logger.debug('#decorations', authorshipDecorations.size)
      authorshipDecorations = authorshipDecorations.update({
        filter: (decorationFrom: number, decorationTo: number, value) => {
          const decorationUserId = (value.spec as MarkDecoration).attributes?.['data-user-id'] ?? ''
          const sameUserId = decorationUserId === effectUserId && decorationUserId !== undefined
          logger.debug('dec_from', decorationFrom, 'dec_to', decorationTo, 'dec_user', decorationUserId)

          if (sameUserId) {
            // The decoration is by the same user as the effect/change

            if (decorationFrom === effectTo || decorationTo === effectFrom) {
              logger.debug('In own text (extending)')
              // We can extend the existing decoration by adding a new one with the adjusted length
              addedDecorations.push(
                createMark(Math.min(decorationFrom, effectFrom), Math.max(decorationTo, effectTo), decorationUserId)
              )
              return false
            }
            logger.debug('before or after own text')
            // the authorshipsUpdateEffect already updates the length of the decoration, so we only need to recreate it
            // otherwise we would have another second decoration wrapped around the first one
            addedDecorations.push(createMark(decorationFrom, decorationTo, decorationUserId))
            return false
          } else {
            // The decoration is by a different user than the effect/change

            if (
              decorationFrom === effectTo ||
              (!effectIsLocal && decorationTo === effectFrom) ||
              (effectIsLocal && decorationTo - effectLength === effectFrom)
            ) {
              // The decoration is before or after the effect/change,
              // so we just create another decoration and keep the existing one
              logger.debug('before or after others text')
              addedDecorations.push(createMark(effectFrom, effectTo, effectUserId))
              return true
            }

            // Split the decoration by inserting a third decoration in the middle
            logger.debug('In others text (splitting)')
            addedDecorations.push(
              createMark(decorationFrom, effectFrom, decorationUserId),
              createMark(effectFrom, effectTo, effectUserId),
              createMark(effectTo, decorationTo, decorationUserId)
            )
            return false
          }
        },
        filterFrom: effectFrom,
        filterTo: effectTo
      })

      if (addedDecorations.length === 0) {
        // on an empty decoration set add the effect
        addedDecorations.push(createMark(effectFrom, effectTo, effectUserId))
      }

      authorshipDecorations = authorshipDecorations.update({
        add: addedDecorations
      })
    })
    return authorshipDecorations
  },
  provide: (decorationSet) => EditorView.decorations.from(decorationSet)
})
