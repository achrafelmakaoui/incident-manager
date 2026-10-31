import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const LINKS = {
    EMPLOYEE: [
        { to: '/dashboard', label: 'Tableau de bord' },
        { to: '/incidents/my', label: 'Mes incidents' },
        { to: '/incidents/new', label: 'Déclarer un incident' },
    ],
    TECHNICIAN: [
        { to: '/dashboard', label: 'Tableau de bord' },
        { to: '/incidents/assigned', label: 'Incidents affectés' },
    ],
    ADMIN: [
        { to: '/dashboard', label: 'Tableau de bord' },
        { to: '/admin/incidents', label: 'Tous les incidents' },
        { to: '/admin/users', label: 'Utilisateurs' },
    ],
}

const ROLE_LABELS = { EMPLOYEE: 'Employé', TECHNICIAN: 'Technicien', ADMIN: 'Administrateur' }

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    async function handleLogout() {
        await logout()
        navigate('/login', { replace: true })
    }

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <span className="navbar-brand">Incident Manager</span>

                <nav className="navbar-links">
                    {(LINKS[user.role] ?? []).map((link) => (
                        <NavLink key={link.to} to={link.to} end className="navbar-link">
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="navbar-user">
                    <NavLink to="/profile" className="navbar-link">
                        {user.fullName} <span className="navbar-role">{ROLE_LABELS[user.role]}</span>
                    </NavLink>
                    <button className="btn btn-secondary" onClick={handleLogout}>Déconnexion</button>
                </div>
            </div>
        </header>
    )
}