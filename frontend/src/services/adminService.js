import api from './api'

export async function getTechnicians() {
    const { data } = await api.get('/api/admin/technicians')
    return data        // [{ id, fullName, email }]
}

export async function getUsers() {
    const { data } = await api.get('/api/admin/users')
    return data
}

export async function enableUser(id) {
    const { data } = await api.put(`/api/admin/users/${id}/enable`)
    return data
}

export async function disableUser(id) {
    const { data } = await api.put(`/api/admin/users/${id}/disable`)
    return data
}

export async function getStatistics() {
    const { data } = await api.get('/api/admin/statistics')
    return data
}