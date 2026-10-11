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

export function resolveApiOrigin(urlStr?: string): string {
  const fallback = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'http://localhost:8000'
  const raw = (urlStr || fallback).trim()
  try {
    const parsed = new URL(raw)
    const frontendHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    if (['localhost', '127.0.0.1'].includes(frontendHost) && ['localhost', '127.0.0.1'].includes(parsed.hostname)) {
      parsed.hostname = frontendHost
    }
    return parsed.origin
  } catch {
    return raw.replace(/\/+$/, '')
  }
}

export function resolveAccountsUrl(urlStr?: string): string {
  const fallback = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5174`
    : 'http://localhost:5174'
  const raw = (urlStr || fallback).trim()
  try {
    const parsed = new URL(raw)
    const frontendHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    if (['localhost', '127.0.0.1'].includes(frontendHost) && ['localhost', '127.0.0.1'].includes(parsed.hostname)) {
      parsed.hostname = frontendHost
    }
    return parsed.toString().replace(/\/+$/, '')
  } catch {
    return raw.replace(/\/+$/, '')
  }
}

export async function initiateLogin(config: ClientAuthConfig, returnTo?: string): Promise<void> {
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  const state = generateRandomString(32)

  sessionStorage.setItem('sso_code_verifier', verifier)
  sessionStorage.setItem('sso_state', state)
  sessionStorage.setItem('sso_return_to', returnTo || window.location.pathname + window.location.search)

  const accountsUrl = resolveAccountsUrl(config.accountsPortalUrl)
  const authUrl = new URL(`${accountsUrl}/login`)
  authUrl.searchParams.set('client_id', config.clientId)
  authUrl.searchParams.set('redirect_uri', config.redirectUri)
  authUrl.searchParams.set('code_challenge', challenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('state', state)

  window.location.assign(authUrl.toString())
}

const inFlightExchanges = new Map<string, Promise<{ user: AuthUser; accessToken: string; returnTo: string }>>()

export async function exchangeAuthorizationCode(
  config: ClientAuthConfig,
  code: string,
  state: string
): Promise<{ user: AuthUser; accessToken: string; returnTo: string }> {
  if (inFlightExchanges.has(code)) {
    return inFlightExchanges.get(code)!
  }

  const exchangePromise = (async () => {
    const savedState = sessionStorage.getItem('sso_state')
    const codeVerifier = sessionStorage.getItem('sso_code_verifier')
    const returnTo = sessionStorage.getItem('sso_return_to') || '/'

    if (!codeVerifier) {
      throw new Error('Authentication session expired or code verifier missing. Please try signing in again.')
    }

    if (savedState && state && savedState !== state) {
      throw new Error('State validation failed. Potential CSRF security violation.')
    }

    const apiOrigin = resolveApiOrigin(config.apiBaseUrl)
    const tokenUrl = `${apiOrigin}/api/accounts/oauth/token/`

    const response = await fetch(tokenUrl, {
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
      const errorMsg =
        data?.message ||
        data?.error ||
        (response.status === 404
          ? `OAuth token endpoint not found at ${tokenUrl}`
          : `Token exchange failed (HTTP ${response.status}).`)
      throw new Error(errorMsg)
    }

    // Cleanup session storage on success
    sessionStorage.removeItem('sso_code_verifier')
    sessionStorage.removeItem('sso_state')
    sessionStorage.removeItem('sso_return_to')

    return {
      user: data.user,
      accessToken: data.access_token,
      returnTo,
    }
  })()

  inFlightExchanges.set(code, exchangePromise)
  try {
    return await exchangePromise
  } finally {
    inFlightExchanges.delete(code)
  }
}
