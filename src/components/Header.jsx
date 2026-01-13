/**
 * Header Component
 * Top navigation bar with user menu and notifications
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, X } from 'lucide-react';
import { logoutUser } from '../store/slices/authSlice';
import { getInitials, formatDate } from '../utils/helpers';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('namoarogya_token');
            const response = await axios.get(`${API_URL}/dashboard/recent-patients?limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const recentPatients = response.data.data.patients;
                const notifs = recentPatients.map(patient => ({
                    id: patient._id,
                    title: `New patient: ${patient.name}`,
                    message: `Age: ${patient.age}, Status: ${patient.status}`,
                    time: patient.created_at,
                    type: 'patient'
                }));
                setNotifications(notifs);
                setUnreadCount(notifs.length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            setUnreadCount(0);
        }
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
                    <div className="relative">
                        <button
                            onClick={toggleNotifications}
                            className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                                    <h3 className="font-semibold text-neutral-900">Notifications</h3>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="p-1 hover:bg-neutral-100 rounded"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className="p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    navigate('/patients');
                                                    setShowNotifications(false);
                                                }}
                                            >
                                                <p className="font-medium text-neutral-900 text-sm">{notif.title}</p>
                                                <p className="text-xs text-neutral-600 mt-1">{notif.message}</p>
                                                <p className="text-xs text-neutral-400 mt-1">
                                                    {formatDate(notif.time)}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-neutral-500">
                                            <Bell className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                                            <p>No new notifications</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 border-t border-neutral-200 text-center">
                                    <button
                                        onClick={() => {
                                            navigate('/patients');
                                            setShowNotifications(false);
                                        }}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        View all patients
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

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
