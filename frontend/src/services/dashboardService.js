import api from './api'

export async function getEmployeeDashboard() {
    const { data } = await api.get('/api/dashboard/employee')
    return data
}

export async function getTechnicianDashboard() {
    const { data } = await api.get('/api/dashboard/technician')
    return data
}