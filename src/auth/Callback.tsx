import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeAuthorizationCode } from './pkce'
import { useAuth } from './AuthContext'

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshSession } = useAuth()
  const [error, setError] = useState<string | null>(null)

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

    const config = {
      clientId: 'skiltrix',
      accountsPortalUrl: (import.meta.env.VITE_ACCOUNTS_URL || 'http://localhost:5174').replace(/\/+$/, ''),
      apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, ''),
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
          <div style={{ color: '#ef4444', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
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
