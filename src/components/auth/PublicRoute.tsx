import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../../store/auth.store'

export const PublicRoute = () => {
  const accessToken = useAuthStore((s) => s.accessToken)

  if (accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
