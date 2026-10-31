import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const EMPTY = { fullName: '', email: '', password: '', confirmPassword: '' }

export default function Register() {
    const { user, register } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState(EMPTY)
    const [fieldErrors, setFieldErrors] = useState({})
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    function validate() {
        const errors = {}
        if (!form.fullName.trim()) errors.fullName = 'Le nom complet est obligatoire'
        if (!form.email.trim()) errors.email = "L'email est obligatoire"
        if (form.password.length < 8) errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
        if (form.password !== form.confirmPassword) errors.confirmPassword = 'Les mots de passe ne correspondent pas'
        return errors
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        const errors = validate()
        setFieldErrors(errors)
        if (Object.keys(errors).length > 0) return

        setLoading(true)
        try {
            await register(form.fullName, form.email, form.password)
            navigate('/dashboard', { replace: true })
        } catch (err) {
            const data = err.response?.data
            setFieldErrors(data?.errors ?? {})
            setError(data?.message || 'Impossible de contacter le serveur')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <form className="card auth-card" onSubmit={handleSubmit} noValidate>
                <h1>Créer un compte</h1>
                <p className="auth-subtitle">Votre compte sera créé avec le rôle Employé</p>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                    <label htmlFor="fullName">Nom complet</label>
                    <input id="fullName" name="fullName" className="input"
                           value={form.fullName} onChange={handleChange} />
                    {fieldErrors.fullName && <span className="field-error">{fieldErrors.fullName}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" className="input" autoComplete="email"
                           value={form.email} onChange={handleChange} />
                    {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Mot de passe</label>
                    <input id="password" name="password" type="password" className="input" autoComplete="new-password"
                           value={form.password} onChange={handleChange} />
                    {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                    <input id="confirmPassword" name="confirmPassword" type="password" className="input"
                           autoComplete="new-password"
                           value={form.confirmPassword} onChange={handleChange} />
                    {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Création...' : 'Créer mon compte'}
                </button>

                <p className="auth-footer">
                    Déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </form>
        </div>
    )
}