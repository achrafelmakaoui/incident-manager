import { useEffect, useMemo, useState } from 'react'
import IncidentTable from '../components/IncidentTable'
import { getAllIncidents } from '../services/incidentService'
import { PRIORITY_LABELS, STATUS_LABELS } from '../utils/labels'

export default function AdminIncidents() {
    const [incidents, setIncidents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [statusFilter, setStatusFilter] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('')
    const [unassignedOnly, setUnassignedOnly] = useState(false)

    useEffect(() => {
        let ignore = false
        getAllIncidents()
            .then((data) => { if (!ignore) setIncidents(data) })
            .catch((err) => { if (!ignore) setError(err.response?.data?.message || 'Erreur de chargement') })
            .finally(() => { if (!ignore) setLoading(false) })
        return () => { ignore = true }
    }, [])

    const filtered = useMemo(() => incidents.filter((i) =>
        (!statusFilter || i.status === statusFilter) &&
        (!priorityFilter || i.priority === priorityFilter) &&
        (!unassignedOnly || !i.assignedTo)
    ), [incidents, statusFilter, priorityFilter, unassignedOnly])

    return (
        <div className="container">
            <div className="page-header">
                <h1>Tous les incidents</h1>
                <span className="muted">{filtered.length} / {incidents.length} incident(s)</span>
            </div>

            <div className="card row" style={{ marginBottom: 16 }}>
                <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Tous les statuts</option>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                <select className="select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                    <option value="">Toutes les priorités</option>
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                <label className="row" style={{ gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={unassignedOnly} onChange={(e) => setUnassignedOnly(e.target.checked)} />
                    Non affectés uniquement
                </label>
            </div>

            {loading && <p className="loading">Chargement...</p>}
            {error && <div className="alert alert-error">{error}</div>}
            {!loading && !error && <IncidentTable incidents={filtered} showCreator showAssignee />}
        </div>
    )
}