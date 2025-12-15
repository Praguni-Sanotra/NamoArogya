/**
 * Dual Coding Page
 * Interface for mapping NAMASTE codes to ICD-11 codes
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, ArrowRight, Save } from 'lucide-react';
import { searchNAMASTE, searchICD11, setSelectedNAMASTECode, setSelectedICD11Code } from '../store/slices/diagnosisSlice';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { debounce } from '../utils/helpers';

const DualCoding = () => {
    const dispatch = useDispatch();
    const {
        namasteCodes,
        icd11Codes,
        selectedNAMASTECode,
        selectedICD11Code,
        namasteLoading,
        icd11Loading,
    } = useSelector((state) => state.diagnosis);

    const [namasteQuery, setNamasteQuery] = useState('');
    const [icd11Query, setIcd11Query] = useState('');

    // Debounced search handlers
    const handleNAMASTESearch = debounce((query) => {
        if (query.length >= 2) {
            dispatch(searchNAMASTE(query));
        }
    }, 500);

    const handleICD11Search = debounce((query) => {
        if (query.length >= 2) {
            dispatch(searchICD11(query));
        }
    }, 500);

    const handleSaveMapping = () => {
        if (!selectedNAMASTECode || !selectedICD11Code) {
            alert('Please select both NAMASTE and ICD-11 codes');
            return;
        }

        // TODO: Save mapping via API
        alert(`Mapping saved:\nNAMASTE: ${selectedNAMASTECode.code}\nICD-11: ${selectedICD11Code.code}`);
    };

    // Mock data for demonstration
    const mockNAMASTECodes = namasteCodes.length > 0 ? namasteCodes : [
        { code: 'NAM-001', description: 'Vata Dosha Imbalance', category: 'Ayurveda' },
        { code: 'NAM-002', description: 'Pitta Dosha Imbalance', category: 'Ayurveda' },
        { code: 'NAM-003', description: 'Kapha Dosha Imbalance', category: 'Ayurveda' },
    ];

    const mockICD11Codes = icd11Codes.length > 0 ? icd11Codes : [
        { code: 'ICD-A01', description: 'Typhoid fever', category: 'Infectious diseases' },
        { code: 'ICD-B02', description: 'Zoster [herpes zoster]', category: 'Infectious diseases' },
        { code: 'ICD-C03', description: 'Malignant neoplasm', category: 'Neoplasms' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Dual Coding</h1>
                <p className="text-neutral-600 mt-1">
                    Map NAMASTE (AYUSH) codes to ICD-11 international standards
                </p>
            </div>

            {/* Dual Coding Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* NAMASTE Code Search */}
                <Card title="NAMASTE (AYUSH) Codes" subtitle="Search and select AYUSH medical codes">
                    <div className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Search NAMASTE codes..."
                            value={namasteQuery}
                            onChange={(e) => {
                                setNamasteQuery(e.target.value);
                                handleNAMASTESearch(e.target.value);
                            }}
                            icon={Search}
                        />

                        {/* Search Results */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {namasteLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="spinner"></div>
                                </div>
                            ) : mockNAMASTECodes.length > 0 ? (
                                mockNAMASTECodes.map((code) => (
                                    <button
                                        key={code.code}
                                        onClick={() => dispatch(setSelectedNAMASTECode(code))}
                                        className={`w-full text-left p-4 border-2 rounded-lg transition-all ${selectedNAMASTECode?.code === code.code
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-neutral-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-mono text-sm text-primary-600 font-medium">
                                                    {code.code}
                                                </p>
                                                <p className="text-neutral-900 mt-1">{code.description}</p>
                                                <p className="text-xs text-neutral-500 mt-1">{code.category}</p>
                                            </div>
                                            {selectedNAMASTECode?.code === code.code && (
                                                <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-neutral-500 py-8">
                                    Search for NAMASTE codes
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* ICD-11 Code Search */}
                <Card title="ICD-11 Codes" subtitle="Search and select ICD-11 international codes">
                    <div className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Search ICD-11 codes..."
                            value={icd11Query}
                            onChange={(e) => {
                                setIcd11Query(e.target.value);
                                handleICD11Search(e.target.value);
                            }}
                            icon={Search}
                        />

                        {/* Search Results */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {icd11Loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="spinner"></div>
                                </div>
                            ) : mockICD11Codes.length > 0 ? (
                                mockICD11Codes.map((code) => (
                                    <button
                                        key={code.code}
                                        onClick={() => dispatch(setSelectedICD11Code(code))}
                                        className={`w-full text-left p-4 border-2 rounded-lg transition-all ${selectedICD11Code?.code === code.code
                                                ? 'border-secondary-500 bg-secondary-50'
                                                : 'border-neutral-200 hover:border-secondary-300'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-mono text-sm text-secondary-600 font-medium">
                                                    {code.code}
                                                </p>
                                                <p className="text-neutral-900 mt-1">{code.description}</p>
                                                <p className="text-xs text-neutral-500 mt-1">{code.category}</p>
                                            </div>
                                            {selectedICD11Code?.code === code.code && (
                                                <div className="w-5 h-5 bg-secondary-500 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-neutral-500 py-8">
                                    Search for ICD-11 codes
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Selected Mapping Preview */}
            {(selectedNAMASTECode || selectedICD11Code) && (
                <Card title="Selected Mapping" hover>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            {selectedNAMASTECode ? (
                                <div className="p-4 bg-primary-50 rounded-lg">
                                    <p className="text-xs text-primary-600 font-medium mb-1">NAMASTE</p>
                                    <p className="font-mono text-sm font-medium">{selectedNAMASTECode.code}</p>
                                    <p className="text-sm text-neutral-700 mt-1">{selectedNAMASTECode.description}</p>
                                </div>
                            ) : (
                                <div className="p-4 border-2 border-dashed border-neutral-300 rounded-lg text-center text-neutral-500">
                                    Select NAMASTE code
                                </div>
                            )}
                        </div>

                        <div className="px-6">
                            <ArrowRight className="w-8 h-8 text-neutral-400" />
                        </div>

                        <div className="flex-1">
                            {selectedICD11Code ? (
                                <div className="p-4 bg-secondary-50 rounded-lg">
                                    <p className="text-xs text-secondary-600 font-medium mb-1">ICD-11</p>
                                    <p className="font-mono text-sm font-medium">{selectedICD11Code.code}</p>
                                    <p className="text-sm text-neutral-700 mt-1">{selectedICD11Code.description}</p>
                                </div>
                            ) : (
                                <div className="p-4 border-2 border-dashed border-neutral-300 rounded-lg text-center text-neutral-500">
                                    Select ICD-11 code
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button
                            variant="primary"
                            icon={Save}
                            onClick={handleSaveMapping}
                            disabled={!selectedNAMASTECode || !selectedICD11Code}
                        >
                            Save Mapping
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default DualCoding;
