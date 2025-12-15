/**
 * Authentication Layout
 * Layout for login and authentication pages
 */

import { Outlet } from 'react-router-dom';
import { Activity } from 'lucide-react';

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-medical">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
                        NAMOAROGYA
                    </h1>
                    <p className="text-neutral-600">
                        Healthcare Platform - AYUSH & ICD-11 Integration
                    </p>
                </div>

                {/* Auth Content */}
                <div className="bg-white rounded-2xl shadow-card-hover p-8">
                    <Outlet />
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-neutral-500">
                    <p>© 2024 NAMOAROGYA. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
