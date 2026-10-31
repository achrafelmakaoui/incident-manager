const SESSION_KEY = 'incident_session'
const LOGOUT_MESSAGE_KEY = 'logout_message'

export function saveSession({ token, refreshToken, role, fullName }) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, refreshToken, role, fullName }))
}

export function updateSession(changes) {
    const current = getSession()
    if (current) saveSession({ ...current, ...changes })
}

export function getSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY))
    } catch {
        return null
    }
}

export function getAccessToken() {
    return getSession()?.token ?? null
}

export function getRefreshToken() {
    return getSession()?.refreshToken ?? null
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY)
}

export function setLogoutMessage(message) {
    sessionStorage.setItem(LOGOUT_MESSAGE_KEY, message)
}

export function popLogoutMessage() {
    const message = sessionStorage.getItem(LOGOUT_MESSAGE_KEY)
    sessionStorage.removeItem(LOGOUT_MESSAGE_KEY)
    return message
}