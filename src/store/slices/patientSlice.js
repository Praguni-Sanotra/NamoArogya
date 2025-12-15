/**
 * Patient Redux Slice
 * Manages patient data state and CRUD operations
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as patientService from '../../services/patientService';

// Initial state
const initialState = {
    patients: [],
    selectedPatient: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
    filters: {
        search: '',
        status: '',
    },
};

/**
 * Async thunk to fetch patients
 */
export const fetchPatients = createAsyncThunk(
    'patients/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await patientService.getPatients(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch patients');
        }
    }
);

/**
 * Async thunk to fetch patient by ID
 */
export const fetchPatientById = createAsyncThunk(
    'patients/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await patientService.getPatientById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch patient');
        }
    }
);

/**
 * Async thunk to create patient
 */
export const createPatient = createAsyncThunk(
    'patients/create',
    async (patientData, { rejectWithValue }) => {
        try {
            const response = await patientService.createPatient(patientData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create patient');
        }
    }
);

/**
 * Async thunk to update patient
 */
export const updatePatient = createAsyncThunk(
    'patients/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await patientService.updatePatient(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update patient');
        }
    }
);

/**
 * Async thunk to delete patient
 */
export const deletePatient = createAsyncThunk(
    'patients/delete',
    async (id, { rejectWithValue }) => {
        try {
            await patientService.deletePatient(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete patient');
        }
    }
);

// Create slice
const patientSlice = createSlice({
    name: 'patients',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Set selected patient
        setSelectedPatient: (state, action) => {
            state.selectedPatient = action.payload;
        },
        // Clear selected patient
        clearSelectedPatient: (state) => {
            state.selectedPatient = null;
        },
        // Set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        // Set pagination
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        // Fetch patients
        builder
            .addCase(fetchPatients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPatients.fulfilled, (state, action) => {
                state.loading = false;
                state.patients = action.payload.data || action.payload;
                state.pagination = {
                    ...state.pagination,
                    total: action.payload.total || 0,
                    totalPages: action.payload.totalPages || 1,
                };
            })
            .addCase(fetchPatients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch patient by ID
        builder
            .addCase(fetchPatientById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPatientById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedPatient = action.payload;
            })
            .addCase(fetchPatientById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Create patient
        builder
            .addCase(createPatient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPatient.fulfilled, (state, action) => {
                state.loading = false;
                state.patients.unshift(action.payload);
            })
            .addCase(createPatient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update patient
        builder
            .addCase(updatePatient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePatient.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.patients.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.patients[index] = action.payload;
                }
                if (state.selectedPatient?.id === action.payload.id) {
                    state.selectedPatient = action.payload;
                }
            })
            .addCase(updatePatient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Delete patient
        builder
            .addCase(deletePatient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePatient.fulfilled, (state, action) => {
                state.loading = false;
                state.patients = state.patients.filter(p => p.id !== action.payload);
                if (state.selectedPatient?.id === action.payload) {
                    state.selectedPatient = null;
                }
            })
            .addCase(deletePatient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    setSelectedPatient,
    clearSelectedPatient,
    setFilters,
    setPagination,
} = patientSlice.actions;

export default patientSlice.reducer;
