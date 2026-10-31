import api from './api'

export async function createIncident(incident) {
    const { data } = await api.post('/api/incidents', incident)
    return data
}

export async function getMyIncidents() {
    const { data } = await api.get('/api/incidents/my')
    return data
}

export async function getAssignedIncidents() {
    const { data } = await api.get('/api/incidents/assigned')
    return data
}

export async function getAllIncidents() {
    const { data } = await api.get('/api/incidents')
    return data
}

export async function getIncidentDetails(id) {
    const { data } = await api.get(`/api/incidents/${id}`)
    return data      // { incident, history, comments }
}

export async function updateIncidentStatus(id, status) {
    const { data } = await api.put(`/api/incidents/${id}/status`, { status })
    return data
}

export async function assignIncident(id, technicianId) {
    const { data } = await api.put(`/api/incidents/${id}/assign/${technicianId}`)
    return data
}

export async function addComment(id, content) {
    const { data } = await api.post(`/api/incidents/${id}/comments`, { content })
    return data
}