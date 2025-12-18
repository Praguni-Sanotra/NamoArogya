import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PatientRecords from './pages/PatientRecords';
import DualCoding from './pages/DualCoding';
import Analytics from './pages/Analytics';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Role-based dashboard component
const RoleBasedDashboard = () => {
    const { user } = useSelector((state) => state.auth);

    // Debug logging
    console.log('=== ROLE DEBUG ===');
    console.log('Full user object:', JSON.stringify(user, null, 2));
    console.log('User role:', user?.role);
    console.log('Role type:', typeof user?.role);
    console.log('Is admin (strict)?', user?.role === 'admin');
    console.log('Is admin (loose)?', user?.role == 'admin');
    console.log('==================');

    // Render dashboard based on user role
    if (user?.role === 'admin') {
        console.log('✅ Rendering AdminDashboard');
        return <AdminDashboard />;
    }

    console.log('⚠️ Rendering DoctorDashboard (default)');
    return <DoctorDashboard />;
};

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
                <Route
                    path="/signup"
                    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
                />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<RoleBasedDashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
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
