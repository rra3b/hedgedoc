/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildStateFromFirstHeadingUpdate } from './build-state-from-first-heading-update'
import { initialState } from '../initial-state'

// noinspection JSUnusedGlobalSymbols
jest.mock('../generate-note-title', () => ({
  generateNoteTitle: () => 'generated title'
}))

describe('build state from first heading update', () => {
  it('generates a new state with the given first heading', () => {
    const startState = { ...initialState, firstHeading: 'heading', title: 'noteTitle' }
    const actual = buildStateFromFirstHeadingUpdate(startState, 'new first heading')
    expect(actual).toStrictEqual({ ...initialState, firstHeading: 'new first heading', title: 'generated title' })
  })
})
