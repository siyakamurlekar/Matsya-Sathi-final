import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import DashboardPage from '../pages/Fisherman/DashboardPage'
import FamilyDashboardPage from '../pages/Family/FamilyDashboardPage'
import { useAuthStore } from '../store/authStore'

import SplashPage from '../pages/Splash/SplashPage'
import LanguagePage from '../pages/Language/LanguagePage'
import RolePage from '../pages/Role/RolePage'
import LoginPage from '../pages/Auth/LoginPage'
import RegisterPage from '../pages/Auth/RegisterPage'
import SeaConditionsPage from '../pages/Fisherman/SeaConditionsPage'
import TripPage from '../pages/Trip/TripPage'
import FamilyTrackingPage from '../pages/Trip/FamilyTrackingPage'
import SOSPage from '../pages/Trip/SOSPage'
import SchemesPage from '../pages/Schemes/SchemesPage'
import NotificationsPage from '../pages/Updates/NotificationsPage'
import ProfilePage from '../pages/Updates/ProfilePage'
import JettyDashboardPage from '../pages/Jetty/JettyDashboardPage'

export default function AppRoutes() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div onClick={() => navigate('/language')}>
            <SplashPage />
          </div>
        }
      />

      <Route
        path="/language"
        element={
          <LanguagePage onContinue={() => navigate('/role')} />
        }
      />

      <Route path="/role" element={<RolePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
  path="/fisherman"
  element={
    user?.role === 'fisherman'
      ? <DashboardPage />
      : <Navigate to="/login" replace />
  }
/>

<Route
  path="/family"
  element={
    user?.role === 'family'
      ? <FamilyDashboardPage />
      : <Navigate to="/login" replace />
  }
/>
      <Route path="/jetty" element={user?.role === 'jetty' ? <JettyDashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/fisherman/sea" element={user?.role === 'fisherman' || user?.role === 'jetty' ? <SeaConditionsPage /> : <Navigate to="/login" replace />} />
      <Route path="/jetty/sea" element={user?.role === 'jetty' ? <SeaConditionsPage /> : <Navigate to="/login" replace />} />
      <Route path="/fisherman/trip" element={user?.role === 'fisherman' ? <TripPage /> : <Navigate to="/login" replace />} />
      <Route path="/family/tracking" element={user?.role === 'family' ? <FamilyTrackingPage /> : <Navigate to="/login" replace />} />
      <Route path="/fisherman/schemes" element={user?.role === 'fisherman' || user?.role === 'jetty' ? <SchemesPage /> : <Navigate to="/login" replace />} />
      <Route path="/jetty/schemes" element={user?.role === 'jetty' ? <SchemesPage /> : <Navigate to="/login" replace />} />
      <Route path="/sos" element={user?.role === 'fisherman' ? <SOSPage /> : <Navigate to="/login" replace />} />
      <Route
        path="/notifications"
        element={
          user
            ? <Navigate
                to={user.role === 'fisherman' ? '/fisherman/notifications' : user.role === 'family' ? '/family/notifications' : '/jetty/notifications'}
                replace
              />
            : <Navigate to="/login" replace />
        }
      />
      <Route path="/fisherman/notifications" element={user?.role === 'fisherman' ? <NotificationsPage /> : <Navigate to="/login" replace />} />
      <Route path="/family/notifications" element={user?.role === 'family' ? <NotificationsPage /> : <Navigate to="/login" replace />} />
      <Route path="/jetty/notifications" element={user?.role === 'jetty' ? <NotificationsPage /> : <Navigate to="/login" replace />} />
      <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}