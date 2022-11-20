/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactElement } from 'react'
import React from 'react'
import { Alert } from 'react-bootstrap'
import { LoadingAnimation } from './loading-animation'
import { ShowIf } from '../../common/show-if/show-if'
import styles from '../application-loader.module.scss'

export interface LoadingScreenProps {
  errorMessage?: string | ReactElement
}

/**
 * Renders a loading animation.
 *
 * @param failedTaskName Should be set if a task failed to load. The name will be shown on screen.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ errorMessage }) => {
  return (
    <div className={`${styles.loader} ${styles.middle} text-light overflow-hidden`}>
      <div className='mb-3 text-light'>
        <span className={`d-block`}>
          <LoadingAnimation error={!!errorMessage} />
        </span>
      </div>
      <ShowIf condition={!!errorMessage}>
        <Alert variant={'danger'}>{errorMessage}</Alert>
      </ShowIf>
    </div>
  )
}
