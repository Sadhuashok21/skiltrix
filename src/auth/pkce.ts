import type { AuthUser, ClientAuthConfig } from './types'

function generateRandomString(length: number = 64): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const randomValues = new Uint8Array(length)
  window.crypto.getRandomValues(randomValues)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length]
  }
  return result
}

export function generateCodeVerifier(): string {
  return generateRandomString(64)
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(digest)

  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function initiateLogin(config: ClientAuthConfig, returnTo?: string): Promise<void> {
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  const state = generateRandomString(32)

  sessionStorage.setItem('sso_code_verifier', verifier)
  sessionStorage.setItem('sso_state', state)
  sessionStorage.setItem('sso_return_to', returnTo || window.location.pathname + window.location.search)

  const authUrl = new URL(`${config.accountsPortalUrl}/login`)
  authUrl.searchParams.set('client_id', config.clientId)
  authUrl.searchParams.set('redirect_uri', config.redirectUri)
  authUrl.searchParams.set('code_challenge', challenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('state', state)

  window.location.assign(authUrl.toString())
}

export async function exchangeAuthorizationCode(
  config: ClientAuthConfig,
  code: string,
  state: string
): Promise<{ user: AuthUser; accessToken: string; returnTo: string }> {
  const savedState = sessionStorage.getItem('sso_state')
  const codeVerifier = sessionStorage.getItem('sso_code_verifier')
  const returnTo = sessionStorage.getItem('sso_return_to') || '/'

  if (!codeVerifier) {
    throw new Error('Authentication session expired or code verifier missing. Please try signing in again.')
  }

  if (savedState && state && savedState !== state) {
    throw new Error('State validation failed. Potential CSRF security violation.')
  }

  const response = await fetch(`${config.apiBaseUrl}/api/accounts/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      code,
      code_verifier: codeVerifier,
      redirect_uri: config.redirectUri,
    }),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.status || !data.access_token) {
    throw new Error(data?.message || 'Token exchange failed.')
  }

  // Cleanup session storage
  sessionStorage.removeItem('sso_code_verifier')
  sessionStorage.removeItem('sso_state')
  sessionStorage.removeItem('sso_return_to')

  return {
    user: data.user,
    accessToken: data.access_token,
    returnTo,
  }
}
