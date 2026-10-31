import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { popLogoutMessage } from '../services/tokenStorage'
import './Auth.css'

export default function Login() {
    const { user, login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [info] = useState(() => popLogoutMessage())

    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(email, password)
            const from = location.state?.from?.pathname || '/dashboard'
            navigate(from, { replace: true })
        } catch (err) {
            setError(err.response?.data?.message || 'Impossible de contacter le serveur')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <form className="card auth-card" onSubmit={handleSubmit}>
                <h1>Connexion</h1>
                <p className="auth-subtitle">Gestion des incidents</p>

                {info && <div className="alert alert-info">{info}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" className="input" required autoComplete="email"
                           value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Mot de passe</label>
                    <input id="password" type="password" className="input" required autoComplete="current-password"
                           value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                </button>

                <p className="auth-footer">
                    Pas encore de compte ? <Link to="/register">Créer un compte</Link>
                </p>
            </form>
        </div>
    )
}