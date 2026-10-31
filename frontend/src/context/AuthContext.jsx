import { createContext, useContext, useState } from 'react'
import * as authService from '../services/authService'
import { updateSession } from '../services/tokenStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => authService.getCurrentUser())

    async function login(email, password) {
        const data = await authService.login(email, password)
        setUser({ role: data.role, fullName: data.fullName })
        return data
    }

    async function register(fullName, email, password) {
        const data = await authService.register(fullName, email, password)
        setUser({ role: data.role, fullName: data.fullName })
        return data
    }

    async function logout() {
        await authService.logout()
        setUser(null)
    }

    function updateUser(changes) {
        updateSession(changes)
        setUser(authService.getCurrentUser())
    }

    const value = { user, login, register, logout, updateUser }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used inside <AuthProvider>')
    }
    return context
}