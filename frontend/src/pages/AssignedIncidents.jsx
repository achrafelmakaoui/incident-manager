import { useEffect, useState } from 'react'
import IncidentTable from '../components/IncidentTable'
import { getAssignedIncidents } from '../services/incidentService'

export default function AssignedIncidents() {
    const [incidents, setIncidents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let ignore = false
        getAssignedIncidents()
            .then((data) => { if (!ignore) setIncidents(data) })
            .catch((err) => { if (!ignore) setError(err.response?.data?.message || 'Erreur de chargement') })
            .finally(() => { if (!ignore) setLoading(false) })
        return () => { ignore = true }
    }, [])

    return (
        <div className="container">
            <div className="page-header">
                <h1>Incidents affectés</h1>
            </div>

            {loading && <p className="loading">Chargement...</p>}
            {error && <div className="alert alert-error">{error}</div>}
            {!loading && !error && <IncidentTable incidents={incidents} showCreator />}
        </div>
    )
}