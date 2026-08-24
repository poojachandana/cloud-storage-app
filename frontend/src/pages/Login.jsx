import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Cloud, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'

const DEMO_ADMIN_EMAIL = 'admin@clouddrive.com'
const DEMO_ADMIN_PASSWORD = 'Admin@123'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/drive')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDemoAdminLogin() {
    setError('')
    setSubmitting(true)
    try {
      await login(DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD)
      navigate('/drive')
    } catch (err) {
      setError(
          err.response?.data?.message ||
          'Could not sign in as demo admin. Make sure the backend has started at least once (it auto-creates this account).'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-2 justify-center mb-6">
            <Cloud className="text-brand-600" size={28} />
            <span className="text-xl font-semibold">CloudDrive</span>
          </div>

          <h1 className="text-lg font-medium text-center mb-6">Sign in to your account</h1>

          <div className="mb-6 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
            <div className="flex items-center gap-1.5 text-brand-700 text-xs font-medium mb-2">
              <ShieldCheck size={14} />
              Demo admin account
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Auto-created the first time the backend starts. Full oversight of all users & files.
            </p>
            <div className="text-xs text-gray-600 font-mono bg-white rounded-lg px-2.5 py-1.5 mb-2 space-y-0.5">
              <div>{DEMO_ADMIN_EMAIL}</div>
              <div>{DEMO_ADMIN_PASSWORD}</div>
            </div>
            <button
                type="button"
                onClick={handleDemoAdminLogin}
                disabled={submitting}
                className="w-full text-xs font-medium text-brand-700 border border-brand-200 bg-white hover:bg-brand-50 disabled:opacity-60 rounded-lg py-1.5 transition"
            >
              Sign in as demo admin
            </button>
          </div>

          {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="••••••••"
              />
            </div>
            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
  )
}