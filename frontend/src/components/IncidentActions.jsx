import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addComment, assignIncident, updateIncidentStatus } from '../services/incidentService'
import { getTechnicians } from '../services/adminService'
import { STATUS_LABELS } from '../utils/labels'
import './IncidentActions.css'

/**
 * Copy of the backend's ALLOWED_TRANSITIONS, used ONLY to show sensible choices.
 * The backend remains the authority: a forbidden transition still gets a 400.
 */
const NEXT_STATUSES = {
    OPEN: ['IN_PROGRESS'],
    ASSIGNED: ['IN_PROGRESS'],
    IN_PROGRESS: ['RESOLVED'],
    RESOLVED: ['IN_PROGRESS', 'CLOSED'],
    CLOSED: [],
}

export default function IncidentActions({ incident, onChange }) {
    const { user } = useAuth()
    const isAdmin = user.role === 'ADMIN'
    const isClosed = incident.status === 'CLOSED'

    const [technicians, setTechnicians] = useState([])
    const [technicianId, setTechnicianId] = useState('')
    const [comment, setComment] = useState('')
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState(null)

    useEffect(() => {
        if (!isAdmin) return
        let ignore = false
        getTechnicians()
            .then((data) => { if (!ignore) setTechnicians(data) })
            .catch(() => { if (!ignore) setMessage({ type: 'error', text: 'Impossible de charger les techniciens' }) })
        return () => { ignore = true }
    }, [isAdmin])

    async function run(action, successText) {
        setBusy(true)
        setMessage(null)
        try {
            await action()
            setMessage({ type: 'success', text: successText })
            onChange()
            return true
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Action impossible' })
            return false
        } finally {
            setBusy(false)
        }
    }

    function handleStatus(status) {
        run(() => updateIncidentStatus(incident.id, status), `Statut mis à jour : ${STATUS_LABELS[status]}`)
    }

    async function handleAssign(e) {
        e.preventDefault()
        if (!technicianId) return
        const ok = await run(() => assignIncident(incident.id, technicianId), 'Technicien affecté')
        if (ok) setTechnicianId('')
    }

    async function handleComment(e) {
        e.preventDefault()
        if (!comment.trim()) return
        const ok = await run(() => addComment(incident.id, comment.trim()), 'Note ajoutée')
        if (ok) setComment('')
    }

    if (isClosed) {
        return (
            <section className="card">
                <h2>Actions</h2>
                <p className="muted">Cet incident est clôturé. Aucune action n'est plus possible.</p>
            </section>
        )
    }

    const nextStatuses = NEXT_STATUSES[incident.status] ?? []
    const needsTechnician = !incident.assignedTo

    return (
        <section className="card actions">
            <h2>Actions</h2>

            {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            {/* Status */}
            <div className="action-block">
                <h3>Changer le statut</h3>
                {needsTechnician ? (
                    <p className="muted">Un technicien doit d'abord être affecté.</p>
                ) : (
                    <div className="row">
                        {nextStatuses.map((status) => (
                            <button key={status} className="btn btn-secondary" disabled={busy}
                                    onClick={() => handleStatus(status)}>
                                → {STATUS_LABELS[status]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Assignment: admin only */}
            {isAdmin && (
                <form className="action-block" onSubmit={handleAssign}>
                    <h3>{incident.assignedTo ? 'Réaffecter' : 'Affecter un technicien'}</h3>
                    <div className="row">
                        <select className="select action-select" value={technicianId}
                                onChange={(e) => setTechnicianId(e.target.value)}>
                            <option value="">— Choisir un technicien —</option>
                            {technicians
                                .filter((t) => t.id !== incident.assignedTo?.id)
                                .map((t) => (
                                    <option key={t.id} value={t.id}>{t.fullName}</option>
                                ))}
                        </select>
                        <button type="submit" className="btn btn-primary" disabled={busy || !technicianId}>
                            Affecter
                        </button>
                    </div>
                </form>
            )}

            {/* Treatment note */}
            <form className="action-block" onSubmit={handleComment}>
                <h3>Ajouter une note de traitement</h3>
                <textarea className="textarea" maxLength={2000} value={comment}
                          placeholder="Ex. : Le poste a été isolé du réseau."
                          onChange={(e) => setComment(e.target.value)} />
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={busy || !comment.trim()}>
                        Ajouter la note
                    </button>
                </div>
            </form>
        </section>
    )
}