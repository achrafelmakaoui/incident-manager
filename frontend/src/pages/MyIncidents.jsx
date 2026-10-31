import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import IncidentTable from '../components/IncidentTable'
import { getMyIncidents } from '../services/incidentService'

export default function MyIncidents() {
    const [incidents, setIncidents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let ignore = false

        getMyIncidents()
            .then((data) => { if (!ignore) setIncidents(data) })
            .catch((err) => { if (!ignore) setError(err.response?.data?.message || 'Erreur de chargement') })
            .finally(() => { if (!ignore) setLoading(false) })

        return () => { ignore = true }
    }, [])

    return (
        <div className="container">
            <div className="page-header">
                <h1>Mes incidents</h1>
                <Link to="/incidents/new" className="btn btn-primary">+ Déclarer un incident</Link>
            </div>

            {loading && <p className="loading">Chargement...</p>}
            {error && <div className="alert alert-error">{error}</div>}
            {!loading && !error && <IncidentTable incidents={incidents} />}
        </div>
    )
}