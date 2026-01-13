/**
 * Sidebar Navigation Component
 * Role-based navigation menu with icons
 */

import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    LayoutDashboard,
    Users,
    FileText,
    BarChart3,
    Activity
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useSelector((state) => state.auth);

    // Navigation items based on role
    const navItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: LayoutDashboard,
            roles: ['doctor', 'admin'],
        },
        {
            name: 'Patient Records',
            path: '/patients',
            icon: Users,
            roles: ['doctor', 'admin'],
        },
        {
            name: 'Dual Coding',
            path: '/dual-coding',
            icon: FileText,
            roles: ['doctor'], // Only available for doctors, not admins
        },
        {
            name: 'Medical Code Database',
            path: '/analytics',
            icon: BarChart3,
            roles: ['doctor', 'admin'],
        },
    ];

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter(item =>
        item.roles.includes(user?.role || 'doctor')
    );

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-neutral-200 z-40 hidden lg:block">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-neutral-200">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-display font-bold text-neutral-900">
                        NAMOAROGYA
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
                {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-primary-50 text-primary-600 font-medium'
                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Role Badge */}
            <div className="absolute bottom-6 left-4 right-4">
                <div className="bg-neutral-100 rounded-lg p-4">
                    <p className="text-xs text-neutral-500 mb-1">Logged in as</p>
                    <p className="text-sm font-medium text-neutral-900 capitalize">
                        {user?.role || 'Doctor'}
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
