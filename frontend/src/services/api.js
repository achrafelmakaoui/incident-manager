import axios from 'axios'
import {
    getAccessToken,
    getRefreshToken,
    saveSession,
    clearSession,
    setLogoutMessage,
} from './tokenStorage'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
})

// REQUEST interceptor: attach the JWT to every request
api.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// RESPONSE interceptor: on 401, try to refresh once
let refreshPromise = null

async function refreshAccessToken() {
    const refreshToken = getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token')

    const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
    saveSession(data)
    return data.token
}

function forceLogout(message) {
    clearSession()
    setLogoutMessage(message || 'Votre session a expiré. Veuillez vous reconnecter.')
    if (window.location.pathname !== '/login') {
        window.location.href = '/login'
    }
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config
        const status = error.response?.status
        const isAuthCall = original?.url?.startsWith('/auth/')

        if (status === 401 && !isAuthCall && !original._retry) {
            original._retry = true

            try {
                refreshPromise ??= refreshAccessToken().finally(() => {
                    refreshPromise = null
                })
                const newToken = await refreshPromise

                original.headers.Authorization = `Bearer ${newToken}`
                return api(original)
            } catch (refreshError) {
                forceLogout(refreshError.response?.data?.message)
            }
        }

        return Promise.reject(error)
    }
)

export default api