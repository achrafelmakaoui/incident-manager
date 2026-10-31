import axios from 'axios'
import api from './api'
import { saveSession, clearSession, getSession, getRefreshToken } from './tokenStorage'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    saveSession(data)
    return data
}

export async function register(fullName, email, password) {
    const { data } = await api.post('/auth/register', { fullName, email, password })
    saveSession(data)
    return data
}

export async function logout() {
    const refreshToken = getRefreshToken()
    clearSession()
    if (refreshToken) {
        try {
            await axios.post(`${API_URL}/auth/logout`, { refreshToken })
        } catch {

        }
    }
}

export function getCurrentUser() {
    const session = getSession()
    return session ? { role: session.role, fullName: session.fullName } : null
}

export function isAuthenticated() {
    return !!getSession()?.token
}