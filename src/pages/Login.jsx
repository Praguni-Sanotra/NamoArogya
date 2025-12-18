/**
 * Login Page
 * Authentication page with email, password, and role selection
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserCircle } from 'lucide-react';
import { loginUser, clearError } from '../store/slices/authSlice';
import Input from '../components/Input';
import Button from '../components/Button';
import { isValidEmail } from '../utils/helpers';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'doctor',
    });

    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Clear global error
        if (error) {
            dispatch(clearError());
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
            errors.email = 'Invalid email format';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const result = await dispatch(loginUser(formData)).unwrap();

            // Navigate to dashboard on success
            navigate('/dashboard');
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Sign In
            </h2>
            <p className="text-neutral-600 mb-6">
                Enter your credentials to access your account
            </p>

            {/* Global Error */}
            {error && (
                <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg text-accent-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="doctor@example.com"
                    error={formErrors.email}
                    icon={Mail}
                    required
                />

                {/* Password Input */}
                <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    error={formErrors.password}
                    icon={Lock}
                    required
                />

                {/* Role Selection */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Role <span className="text-accent-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
                            className={`p-3 border-2 rounded-lg transition-all ${formData.role === 'doctor'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-neutral-200 hover:border-neutral-300'
                                }`}
                        >
                            <UserCircle className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-sm font-medium">Doctor</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                            className={`p-3 border-2 rounded-lg transition-all ${formData.role === 'admin'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-neutral-200 hover:border-neutral-300'
                                }`}
                        >
                            <UserCircle className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-sm font-medium">Admin</span>
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={loading}
                >
                    Sign In
                </Button>
            </form>

            {/* Signup Link */}
            <p className="mt-6 text-center text-sm text-neutral-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                    Sign up
                </Link>
            </p>
        </div>
    );
};

export default Login;
