import { Link } from 'react-router-dom'
import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS, formatDate } from '../utils/labels'

export default function IncidentTable({ incidents, showCreator = false, showAssignee = false }) {
    if (incidents.length === 0) {
        return <div className="card empty-state">Aucun incident pour le moment.</div>
    }

    return (
        <div className="card table-wrapper">
            <table className="table">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Titre</th>
                    <th>Catégorie</th>
                    <th>Priorité</th>
                    <th>Statut</th>
                    {showCreator && <th>Déclaré par</th>}
                    {showAssignee && <th>Technicien</th>}
                    <th>Créé le</th>
                </tr>
                </thead>
                <tbody>
                {incidents.map((incident) => (
                    <tr key={incident.id}>
                        <td>{incident.id}</td>
                        <td>
                            <Link to={`/incidents/${incident.id}`} className="table-link">{incident.title}</Link>
                        </td>
                        <td>{CATEGORY_LABELS[incident.category]}</td>
                        <td>
                            <span className={`badge badge-${incident.priority}`}>{PRIORITY_LABELS[incident.priority]}</span>
                        </td>
                        <td>
                            <span className={`badge badge-${incident.status}`}>{STATUS_LABELS[incident.status]}</span>
                        </td>
                        {showCreator && <td>{incident.createdBy?.fullName}</td>}
                        {showAssignee && <td>{incident.assignedTo?.fullName ?? <em className="muted">Non affecté</em>}</td>}
                        <td>{formatDate(incident.createdAt)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}