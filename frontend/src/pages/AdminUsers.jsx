import { useEffect, useState } from 'react'
import { disableUser, enableUser, getUsers } from '../services/adminService'
import { getProfile } from '../services/profileService'
import { ROLE_LABELS, formatDate } from '../utils/labels'

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [currentUserId, setCurrentUserId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busyId, setBusyId] = useState(null)

    useEffect(() => {
        let ignore = false
        Promise.all([getUsers(), getProfile()])
            .then(([list, me]) => {
                if (ignore) return
                setUsers(list)
                setCurrentUserId(me.id)
            })
            .catch((err) => { if (!ignore) setError(err.response?.data?.message || 'Erreur de chargement') })
            .finally(() => { if (!ignore) setLoading(false) })
        return () => { ignore = true }
    }, [])

    async function toggle(user) {
        setBusyId(user.id)
        setError('')
        try {
            const updated = user.enabled ? await disableUser(user.id) : await enableUser(user.id)
            setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)))
        } catch (err) {
            setError(err.response?.data?.message || 'Action impossible')
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div className="container">
            <div className="page-header">
                <h1>Utilisateurs</h1>
                <span className="muted">{users.length} utilisateur(s)</span>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {loading && <p className="loading">Chargement...</p>}

            {!loading && (
                <div className="card table-wrapper">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Statut</th>
                            <th>Inscrit le</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((u) => {
                            const isMe = u.id === currentUserId
                            return (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.fullName} {isMe && <span className="muted">(vous)</span>}</td>
                                    <td>{u.email}</td>
                                    <td><span className={`badge badge-${u.role}`}>{ROLE_LABELS[u.role]}</span></td>
                                    <td>
                      <span className={`badge ${u.enabled ? 'badge-enabled' : 'badge-disabled'}`}>
                        {u.enabled ? 'Actif' : 'Désactivé'}
                      </span>
                                    </td>
                                    <td>{formatDate(u.createdAt)}</td>
                                    <td>
                                        <button
                                            className={`btn ${u.enabled ? 'btn-danger' : 'btn-primary'}`}
                                            disabled={isMe || busyId === u.id}
                                            title={isMe ? 'Vous ne pouvez pas désactiver votre propre compte' : ''}
                                            onClick={() => toggle(u)}>
                                            {busyId === u.id ? '...' : u.enabled ? 'Désactiver' : 'Activer'}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}