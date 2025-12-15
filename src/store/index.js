/**
 * Redux Store Configuration
 * Combines all slices and configures the store
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import patientReducer from './slices/patientSlice';
import diagnosisReducer from './slices/diagnosisSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        patients: patientReducer,
        diagnosis: diagnosisReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for serializable check
                ignoredActions: ['auth/login/fulfilled', 'auth/logout/fulfilled'],
            },
        }),
    devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});

export default store;
