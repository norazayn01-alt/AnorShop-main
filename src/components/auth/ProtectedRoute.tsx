import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthStore } from '../../store/auth.store'

export const ProtectedRoute = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to={'/login'} state={{ from: location }} replace />
  }

  return <Outlet />
}
