/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum ProviderType {
  LOCAL = 'local',
  LDAP = 'ldap',
  SAML = 'saml',
  OPENIDCONNECT = 'openid-connect',
  GITLAB = 'gitlab',
  GITHUB = 'github',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  DROPBOX = 'dropbox',
  GOOGLE = 'google',
}
