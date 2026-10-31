import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import MyIncidents from './pages/MyIncidents'
import NewIncident from './pages/NewIncident'
import IncidentDetails from './pages/IncidentDetails'
import AssignedIncidents from './pages/AssignedIncidents'
import AdminUsers from './pages/AdminUsers'
import AdminIncidents from './pages/AdminIncidents'

function AppLayout() {
  return (
      <>
        <Navbar />
        <main>
          <Outlet />
        </main>
      </>
  )
}

export default function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/incidents/:id" element={<IncidentDetails />} />

            <Route element={<RoleRoute roles={['EMPLOYEE']} />}>
              <Route path="/incidents/my" element={<MyIncidents />} />
              <Route path="/incidents/new" element={<NewIncident />} />
            </Route>

            <Route element={<RoleRoute roles={['TECHNICIAN']} />}>
              <Route path="/incidents/assigned" element={<AssignedIncidents />} />
            </Route>

            <Route element={<RoleRoute roles={['ADMIN']} />}>
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/incidents" element={<AdminIncidents />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
  )
}