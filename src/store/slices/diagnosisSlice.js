/**
 * Diagnosis Redux Slice
 * Manages diagnosis data, NAMASTE codes, ICD-11 codes, and dual coding
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as diagnosisService from '../../services/diagnosisService';

// Initial state
const initialState = {
    // NAMASTE codes
    namasteCodes: [],
    selectedNAMASTECode: null,
    namasteLoading: false,

    // ICD-11 codes
    icd11Codes: [],
    selectedICD11Code: null,
    icd11Loading: false,

    // Dual coding mappings
    dualCodingMappings: [],
    mappingLoading: false,

    // Patient diagnosis
    patientDiagnosis: [],
    diagnosisLoading: false,

    // Common
    error: null,
};

/**
 * Async thunk to search NAMASTE codes
 */
export const searchNAMASTE = createAsyncThunk(
    'diagnosis/searchNAMASTE',
    async (query, { rejectWithValue }) => {
        try {
            const response = await diagnosisService.searchNAMASTECodes(query);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to search NAMASTE codes');
        }
    }
);

/**
 * Async thunk to search ICD-11 codes
 */
export const searchICD11 = createAsyncThunk(
    'diagnosis/searchICD11',
    async (query, { rejectWithValue }) => {
        try {
            const response = await diagnosisService.searchICD11Codes(query);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to search ICD-11 codes');
        }
    }
);

/**
 * Async thunk to create dual coding
 */
export const createDualCoding = createAsyncThunk(
    'diagnosis/createDualCoding',
    async (mappingData, { rejectWithValue }) => {
        try {
            const response = await diagnosisService.createDualCoding(mappingData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create dual coding');
        }
    }
);

/**
 * Async thunk to fetch dual coding mappings
 */
export const fetchDualCodingMappings = createAsyncThunk(
    'diagnosis/fetchMappings',
    async (params, { rejectWithValue }) => {
        try {
            const response = await diagnosisService.getDualCodingMappings(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch mappings');
        }
    }
);

/**
 * Async thunk to fetch patient diagnosis
 */
export const fetchPatientDiagnosis = createAsyncThunk(
    'diagnosis/fetchPatientDiagnosis',
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await diagnosisService.getPatientDiagnosis(patientId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch patient diagnosis');
        }
    }
);

// Create slice
const diagnosisSlice = createSlice({
    name: 'diagnosis',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Set selected NAMASTE code
        setSelectedNAMASTECode: (state, action) => {
            state.selectedNAMASTECode = action.payload;
        },
        // Set selected ICD-11 code
        setSelectedICD11Code: (state, action) => {
            state.selectedICD11Code = action.payload;
        },
        // Clear selected codes
        clearSelectedCodes: (state) => {
            state.selectedNAMASTECode = null;
            state.selectedICD11Code = null;
        },
        // Clear search results
        clearSearchResults: (state) => {
            state.namasteCodes = [];
            state.icd11Codes = [];
        },
    },
    extraReducers: (builder) => {
        // Search NAMASTE
        builder
            .addCase(searchNAMASTE.pending, (state) => {
                state.namasteLoading = true;
                state.error = null;
            })
            .addCase(searchNAMASTE.fulfilled, (state, action) => {
                state.namasteLoading = false;
                state.namasteCodes = action.payload;
            })
            .addCase(searchNAMASTE.rejected, (state, action) => {
                state.namasteLoading = false;
                state.error = action.payload;
            });

        // Search ICD-11
        builder
            .addCase(searchICD11.pending, (state) => {
                state.icd11Loading = true;
                state.error = null;
            })
            .addCase(searchICD11.fulfilled, (state, action) => {
                state.icd11Loading = false;
                state.icd11Codes = action.payload;
            })
            .addCase(searchICD11.rejected, (state, action) => {
                state.icd11Loading = false;
                state.error = action.payload;
            });

        // Create dual coding
        builder
            .addCase(createDualCoding.pending, (state) => {
                state.mappingLoading = true;
                state.error = null;
            })
            .addCase(createDualCoding.fulfilled, (state, action) => {
                state.mappingLoading = false;
                state.dualCodingMappings.unshift(action.payload);
            })
            .addCase(createDualCoding.rejected, (state, action) => {
                state.mappingLoading = false;
                state.error = action.payload;
            });

        // Fetch dual coding mappings
        builder
            .addCase(fetchDualCodingMappings.pending, (state) => {
                state.mappingLoading = true;
                state.error = null;
            })
            .addCase(fetchDualCodingMappings.fulfilled, (state, action) => {
                state.mappingLoading = false;
                state.dualCodingMappings = action.payload;
            })
            .addCase(fetchDualCodingMappings.rejected, (state, action) => {
                state.mappingLoading = false;
                state.error = action.payload;
            });

        // Fetch patient diagnosis
        builder
            .addCase(fetchPatientDiagnosis.pending, (state) => {
                state.diagnosisLoading = true;
                state.error = null;
            })
            .addCase(fetchPatientDiagnosis.fulfilled, (state, action) => {
                state.diagnosisLoading = false;
                state.patientDiagnosis = action.payload;
            })
            .addCase(fetchPatientDiagnosis.rejected, (state, action) => {
                state.diagnosisLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    setSelectedNAMASTECode,
    setSelectedICD11Code,
    clearSelectedCodes,
    clearSearchResults,
} = diagnosisSlice.actions;

export default diagnosisSlice.reducer;
