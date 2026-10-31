import api from './api'

export async function getProfile() {
    const { data } = await api.get('/api/profile')
    return data
}

export async function updateProfile(fullName, email) {
    const { data } = await api.put('/api/profile', { fullName, email })
    return data
}

export async function changePassword(oldPassword, newPassword, confirmPassword) {
    await api.put('/api/profile/password', { oldPassword, newPassword, confirmPassword })   // 204, no body
}