import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { exchangeAuthorizationCode, resolveAccountsUrl } from './pkce'

import { useAuth } from './AuthContext'
import { API_ORIGIN } from '../api/client'

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshSession } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const isExecutingRef = useRef(false)

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state') || ''
    const errorParam = searchParams.get('error')
    const errorDesc = searchParams.get('error_description')

    if (errorParam) {
      setError(errorDesc || errorParam || 'Authentication failed at identity provider.')
      return
    }

    if (!code) {
      setError('Authorization code missing from identity callback.')
      return
    }

    if (isExecutingRef.current) return
    isExecutingRef.current = true

    const config = {
      clientId: 'skiltrix',
      accountsPortalUrl: resolveAccountsUrl(import.meta.env.VITE_ACCOUNTS_URL),
      apiBaseUrl: API_ORIGIN,
      redirectUri: `${window.location.origin}/auth/callback`,
    }

    exchangeAuthorizationCode(config, code, state)
      .then(async (result) => {
        localStorage.setItem('skiltrix_access_token', result.accessToken)
        localStorage.setItem('user_id', result.user.user_id)
        await refreshSession()
        navigate(result.returnTo || '/', { replace: true })
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to complete authorization.')
      })
  }, [searchParams, navigate, refreshSession])

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '440px', textAlign: 'center', background: '#1e293b', color: '#f8fafc', padding: '2rem', borderRadius: '1rem', border: '1px solid #334155' }}>
          <AlertTriangle style={{ width: '2.5rem', height: '2.5rem', color: '#ef4444', margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Authentication Error</h2>

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={() => window.location.assign('/login')}
            style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Try Signing In Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#64748b', marginTop: '1rem', fontSize: '0.9rem' }}>Verifying single sign-on credentials…</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
