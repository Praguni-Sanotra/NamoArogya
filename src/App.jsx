import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientRecords from './pages/PatientRecords';
import DualCoding from './pages/DualCoding';
import Analytics from './pages/Analytics';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

function App() {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<AuthLayout />}>
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
                />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<DoctorDashboard />} />
                    <Route path="/patients" element={<PatientRecords />} />
                    <Route path="/dual-coding" element={<DualCoding />} />
                    <Route path="/analytics" element={<Analytics />} />
                </Route>
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
