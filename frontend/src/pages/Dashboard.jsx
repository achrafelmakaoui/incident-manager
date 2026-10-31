import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import IncidentTable from '../components/IncidentTable'
import { getEmployeeDashboard, getTechnicianDashboard } from '../services/dashboardService'
import { getStatistics } from '../services/adminService'
import './Dashboard.css'

export default function Dashboard() {
    const { user } = useAuth()

    return (
        <div className="container">
            <div className="page-header">
                <h1>Bonjour, {user.fullName}</h1>
            </div>

            {user.role === 'EMPLOYEE' && <EmployeeDashboard />}
            {user.role === 'TECHNICIAN' && <TechnicianDashboard />}
            {user.role === 'ADMIN' && <AdminDashboard />}
        </div>
    )
}

function useDashboardData(fetchFn) {
    const [data, setData] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        let ignore = false
        fetchFn()
            .then((result) => { if (!ignore) setData(result) })
            .catch((err) => { if (!ignore) setError(err.response?.data?.message || 'Erreur de chargement') })
        return () => { ignore = true }
    }, [fetchFn])

    return { data, error }
}

function StatCard({ label, value, tone = 'default' }) {
    return (
        <div className={`card stat-card stat-${tone}`}>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
        </div>
    )
}

function DashboardState({ data, error }) {
    if (error) return <div className="alert alert-error">{error}</div>
    if (!data) return <p className="loading">Chargement...</p>
    return null
}

function EmployeeDashboard() {
    const { data, error } = useDashboardData(getEmployeeDashboard)
    if (!data) return <DashboardState data={data} error={error} />

    return (
        <>
            <div className="stats-grid">
                <StatCard label="Total de mes incidents" value={data.totalIncidents} />
                <StatCard label="Ouverts" value={data.openIncidents} tone="info" />
                <StatCard label="En cours" value={data.inProgressIncidents} tone="warning" />
                <StatCard label="Résolus ou clôturés" value={data.resolvedOrClosedIncidents} tone="success" />
            </div>

            <div className="page-header dashboard-section">
                <h2>Mes derniers incidents</h2>
                <Link to="/incidents/new" className="btn btn-primary">+ Déclarer un incident</Link>
            </div>
            <IncidentTable incidents={data.latestIncidents} showAssignee />
        </>
    )
}


function TechnicianDashboard() {
    const { data, error } = useDashboardData(getTechnicianDashboard)
    if (!data) return <DashboardState data={data} error={error} />

    return (
        <>
            <div className="stats-grid">
                <StatCard label="Incidents affectés" value={data.assignedIncidents} />
                <StatCard label="Critiques" value={data.criticalIncidents} tone="danger" />
                <StatCard label="En cours" value={data.inProgressIncidents} tone="warning" />
                <StatCard label="Résolus" value={data.resolvedIncidents} tone="success" />
            </div>
            <Link to="/incidents/assigned" className="btn btn-primary dashboard-section">
                Voir mes incidents affectés
            </Link>
        </>
    )
}


function AdminDashboard() {
    const { data, error } = useDashboardData(getStatistics)
    if (!data) return <DashboardState data={data} error={error} />

    const byStatus = [
        { key: 'OPEN', label: 'Ouverts', value: data.openIncidents },
        { key: 'ASSIGNED', label: 'Affectés', value: data.assignedIncidents },
        { key: 'IN_PROGRESS', label: 'En cours', value: data.inProgressIncidents },
        { key: 'RESOLVED', label: 'Résolus', value: data.resolvedIncidents },
        { key: 'CLOSED', label: 'Clôturés', value: data.closedIncidents },
    ]
    const max = Math.max(1, ...byStatus.map((s) => s.value))

    return (
        <>
            <h2 className="dashboard-subtitle">Utilisateurs</h2>
            <div className="stats-grid">
                <StatCard label="Total utilisateurs" value={data.totalUsers} />
                <StatCard label="Employés" value={data.employees} />
                <StatCard label="Techniciens" value={data.technicians} />
            </div>

            <h2 className="dashboard-subtitle">Incidents</h2>
            <div className="stats-grid">
                <StatCard label="Total incidents" value={data.totalIncidents} />
                <StatCard label="Ouverts" value={data.openIncidents} tone="info" />
                <StatCard label="En cours" value={data.inProgressIncidents} tone="warning" />
                <StatCard label="Clôturés" value={data.closedIncidents} tone="success" />
            </div>

            <div className="card dashboard-section">
                <h2>Répartition par statut</h2>
                <ul className="bars">
                    {byStatus.map((s) => (
                        <li key={s.key} className="bar-row">
                            <span className="bar-label">{s.label}</span>
                            <div className="bar-track">
                                <div className={`bar-fill badge-${s.key}`} style={{ width: `${(s.value / max) * 100}%` }} />
                            </div>
                            <span className="bar-value">{s.value}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}