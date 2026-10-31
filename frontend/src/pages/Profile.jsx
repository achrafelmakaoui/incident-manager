import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { changePassword, getProfile, updateProfile } from '../services/profileService'
import { setLogoutMessage } from '../services/tokenStorage'
import { ROLE_LABELS, formatDate } from '../utils/labels'

const EMPTY_PASSWORDS = { oldPassword: '', newPassword: '', confirmPassword: '' }

export default function Profile() {
    const { updateUser, logout } = useAuth()
    const navigate = useNavigate()

    const [profile, setProfile] = useState(null)
    const [loadError, setLoadError] = useState('')

    const [info, setInfo] = useState({ fullName: '', email: '' })
    const [infoErrors, setInfoErrors] = useState({})
    const [infoMessage, setInfoMessage] = useState(null)
    const [savingInfo, setSavingInfo] = useState(false)

    const [passwords, setPasswords] = useState(EMPTY_PASSWORDS)
    const [pwdErrors, setPwdErrors] = useState({})
    const [pwdMessage, setPwdMessage] = useState(null)
    const [savingPwd, setSavingPwd] = useState(false)

    useEffect(() => {
        let ignore = false
        getProfile()
            .then((data) => {
                if (ignore) return
                setProfile(data)
                setInfo({ fullName: data.fullName, email: data.email })
            })
            .catch((err) => { if (!ignore) setLoadError(err.response?.data?.message || 'Erreur de chargement') })
        return () => { ignore = true }
    }, [])

    async function handleInfoSubmit(e) {
        e.preventDefault()
        setInfoMessage(null)
        setInfoErrors({})
        setSavingInfo(true)
        try {
            const { user, token } = await updateProfile(info.fullName, info.email)
            setProfile(user)
            updateUser({ token, fullName: user.fullName })
            setInfoMessage({ type: 'success', text: 'Profil mis à jour' })
        } catch (err) {
            const data = err.response?.data
            setInfoErrors(data?.errors ?? {})
            setInfoMessage({ type: 'error', text: data?.message || 'Mise à jour impossible' })
        } finally {
            setSavingInfo(false)
        }
    }

    async function handlePasswordSubmit(e) {
        e.preventDefault()
        setPwdMessage(null)

        const errors = {}
        if (!passwords.oldPassword) errors.oldPassword = "L'ancien mot de passe est obligatoire"
        if (passwords.newPassword.length < 8) errors.newPassword = 'Au moins 8 caractères'
        if (passwords.newPassword !== passwords.confirmPassword) errors.confirmPassword = 'Les mots de passe ne correspondent pas'
        setPwdErrors(errors)
        if (Object.keys(errors).length > 0) return

        setSavingPwd(true)
        try {
            await changePassword(passwords.oldPassword, passwords.newPassword, passwords.confirmPassword)
            await logout()
            setLogoutMessage('Mot de passe modifié. Veuillez vous reconnecter avec votre nouveau mot de passe.')
            navigate('/login', { replace: true })
        } catch (err) {
            const data = err.response?.data
            setPwdErrors(data?.errors ?? {})
            setPwdMessage({ type: 'error', text: data?.message || 'Modification impossible' })
            setSavingPwd(false)
        }
    }

    if (loadError) return <div className="container"><div className="alert alert-error">{loadError}</div></div>
    if (!profile) return <div className="container"><p className="loading">Chargement...</p></div>

    return (
        <div className="container">
            <div className="page-header">
                <h1>Mon profil</h1>
                <span className={`badge badge-${profile.role}`}>{ROLE_LABELS[profile.role]}</span>
            </div>

            <div className="row" style={{ alignItems: 'stretch' }}>
                <form className="card" style={{ flex: 1, minWidth: 300 }} onSubmit={handleInfoSubmit} noValidate>
                    <h2>Informations</h2>
                    {infoMessage && <div className={`alert alert-${infoMessage.type}`}>{infoMessage.text}</div>}

                    <div className="form-group">
                        <label htmlFor="fullName">Nom complet</label>
                        <input id="fullName" className="input" value={info.fullName}
                               onChange={(e) => setInfo({ ...info, fullName: e.target.value })} />
                        {infoErrors.fullName && <span className="field-error">{infoErrors.fullName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" className="input" value={info.email}
                               onChange={(e) => setInfo({ ...info, email: e.target.value })} />
                        {infoErrors.email && <span className="field-error">{infoErrors.email}</span>}
                    </div>

                    <p className="muted">Membre depuis le {formatDate(profile.createdAt)}</p>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={savingInfo}>
                            {savingInfo ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>

                <form className="card" style={{ flex: 1, minWidth: 300 }} onSubmit={handlePasswordSubmit} noValidate>
                    <h2>Changer le mot de passe</h2>
                    {pwdMessage && <div className={`alert alert-${pwdMessage.type}`}>{pwdMessage.text}</div>}

                    {[
                        ['oldPassword', 'Ancien mot de passe', 'current-password'],
                        ['newPassword', 'Nouveau mot de passe', 'new-password'],
                        ['confirmPassword', 'Confirmer le nouveau mot de passe', 'new-password'],
                    ].map(([name, label, autoComplete]) => (
                        <div className="form-group" key={name}>
                            <label htmlFor={name}>{label}</label>
                            <input id={name} type="password" className="input" autoComplete={autoComplete}
                                   value={passwords[name]}
                                   onChange={(e) => setPasswords({ ...passwords, [name]: e.target.value })} />
                            {pwdErrors[name] && <span className="field-error">{pwdErrors[name]}</span>}
                        </div>
                    ))}

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={savingPwd}>
                            {savingPwd ? 'Modification...' : 'Changer le mot de passe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}