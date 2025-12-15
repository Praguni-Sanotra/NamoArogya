/**
 * Header Component
 * Top navigation bar with user menu and notifications
 */

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User } from 'lucide-react';
import { logoutUser } from '../store/slices/authSlice';
import { getInitials } from '../utils/helpers';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-30">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Page Title - Can be dynamic based on route */}
                <div>
                    <h2 className="text-lg font-semibold text-neutral-900">
                        Welcome back, {user?.name || 'Doctor'}
                    </h2>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
                    </button>

                    {/* User Menu */}
                    <div className="flex items-center space-x-3 pl-4 border-l border-neutral-200">
                        {/* User Avatar */}
                        <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
                            {getInitials(user?.name || 'Doctor')}
                        </div>

                        {/* User Info */}
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-neutral-900">
                                {user?.name || 'Dr. User'}
                            </p>
                            <p className="text-xs text-neutral-500 capitalize">
                                {user?.role || 'Doctor'}
                            </p>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="p-2 text-neutral-600 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
