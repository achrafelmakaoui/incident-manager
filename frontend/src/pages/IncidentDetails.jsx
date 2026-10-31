import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getIncidentDetails } from '../services/incidentService'
import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS, formatDate } from '../utils/labels'
import './IncidentDetails.css'
import IncidentActions from '../components/IncidentActions'
import { useAuth } from '../context/AuthContext'

export default function IncidentDetails() {
    const { id } = useParams()
    const [details, setDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { user } = useAuth()
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let ignore = false
        setError('')

        getIncidentDetails(id)
            .then((data) => { if (!ignore) setDetails(data) })
            .catch((err) => { if (!ignore) setError(err.response?.data?.message || 'Erreur de chargement') })
            .finally(() => { if (!ignore) setLoading(false) })

        return () => { ignore = true }
    }, [id, reloadKey])

    if (loading) return <div className="container"><p className="loading">Chargement...</p></div>

    if (error) {
        return (
            <div className="container">
                <div className="alert alert-error">{error}</div>
                <Link to="/dashboard" className="btn btn-secondary">Retour au tableau de bord</Link>
            </div>
        )
    }

    const { incident, history, comments } = details

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <p className="muted details-id">Incident #{incident.id}</p>
                    <h1>{incident.title}</h1>
                </div>
                <span className={`badge badge-${incident.status} details-status`}>
          {STATUS_LABELS[incident.status]}
        </span>
            </div>

            <div className="details-grid">
                {/* Left column: description and notes */}
                <div className="details-main">
                    <section className="card">
                        <h2>Description</h2>
                        <p className="details-description">{incident.description}</p>
                    </section>

                    <section className="card">
                        <h2>Notes de traitement</h2>
                        {comments.length === 0 ? (
                            <p className="muted">Aucune note pour le moment.</p>
                        ) : (
                            <ul className="comments">
                                {comments.map((c) => (
                                    <li key={c.id} className="comment">
                                        <div className="comment-meta">
                                            <strong>{c.authorName}</strong>
                                            <span className="muted">{formatDate(c.createdAt)}</span>
                                        </div>
                                        <p>{c.content}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                {(user.role === 'TECHNICIAN' || user.role === 'ADMIN') && (
                    <IncidentActions incident={incident} onChange={() => setReloadKey((k) => k + 1)} />
                )}

                {/* Right column: information and history */}
                <aside className="details-side">
                    <section className="card">
                        <h2>Informations</h2>
                        <dl className="info-list">
                            <dt>Catégorie</dt>
                            <dd>{CATEGORY_LABELS[incident.category]}</dd>

                            <dt>Priorité</dt>
                            <dd><span className={`badge badge-${incident.priority}`}>{PRIORITY_LABELS[incident.priority]}</span></dd>

                            <dt>Déclaré par</dt>
                            <dd>{incident.createdBy?.fullName}</dd>

                            <dt>Technicien</dt>
                            <dd>{incident.assignedTo?.fullName ?? <em className="muted">Non affecté</em>}</dd>

                            <dt>Créé le</dt>
                            <dd>{formatDate(incident.createdAt)}</dd>

                            <dt>Mis à jour le</dt>
                            <dd>{formatDate(incident.updatedAt)}</dd>
                        </dl>
                    </section>

                    <section className="card">
                        <h2>Historique</h2>
                        <ol className="timeline">
                            {history.map((h) => (
                                <li key={h.id}>
                                    <span className="timeline-date">{formatDate(h.createdAt)}</span>
                                    <span className="timeline-action">{h.action}</span>
                                    <span className="muted timeline-by">par {h.performedBy}</span>
                                </li>
                            ))}
                        </ol>
                    </section>
                </aside>
            </div>
        </div>
    )
}