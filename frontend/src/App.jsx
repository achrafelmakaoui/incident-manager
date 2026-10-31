import { useState } from 'react'
import api from './services/api'
import { login, logout } from './services/authService'

export default function App() {
  const [result, setResult] = useState(null)

  async function run(action) {
    try {
      setResult(await action())
    } catch (e) {
      setResult(e.response?.data ?? e.message)
    }
  }

  return (
      <div className="container">
        <h1>Test API</h1>
        <div className="row">
          <button className="btn btn-primary"
                  onClick={() => run(() => login('employee1@incidents.ma', 'Employee@123'))}>
            Login employee1
          </button>
          <button className="btn btn-secondary"
                  onClick={() => run(async () => (await api.get('/api/profile')).data)}>
            GET /api/profile
          </button>
          <button className="btn btn-danger"
                  onClick={() => run(async () => (await api.get('/api/admin/users')).data)}>
            GET /api/admin/users
          </button>
          <button className="btn btn-secondary"
                  onClick={() => run(async () => { await logout(); return 'Logged out' })}>
            Logout
          </button>
        </div>
        <pre className="card" style={{ marginTop: 16 }}>{JSON.stringify(result, null, 2)}</pre>
      </div>
  )
}