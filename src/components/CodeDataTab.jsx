/**
 * Code Data Tab Component
 * Displays NAMASTE and ICD-11 medical codes in a searchable table
 */

import { useState, useEffect } from 'react';
import { Search, Download, FileText, Database } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const CodeDataTab = () => {
    const [activeCodeType, setActiveCodeType] = useState('namaste'); // 'namaste' or 'icd11'
    const [codes, setCodes] = useState([]);
    const [filteredCodes, setFilteredCodes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    useEffect(() => {
        loadCodes();
    }, [activeCodeType]);

    useEffect(() => {
        filterCodes();
    }, [searchTerm, codes]);

    const loadCodes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/ai-service/data/${activeCodeType === 'namaste' ? 'namaste_codes.json' : 'icd11_codes.json'}`);
            const data = await response.json();
            setCodes(data);
            setFilteredCodes(data);
        } catch (error) {
            console.error('Error loading codes:', error);
            setCodes([]);
            setFilteredCodes([]);
        } finally {
            setLoading(false);
        }
    };

    const filterCodes = () => {
        if (!searchTerm.trim()) {
            setFilteredCodes(codes);
            setCurrentPage(1);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = codes.filter(code =>
            code.code?.toLowerCase().includes(term) ||
            code.name?.toLowerCase().includes(term) ||
            code.name_english?.toLowerCase().includes(term) ||
            code.description?.toLowerCase().includes(term) ||
            code.category?.toLowerCase().includes(term)
        );
        setFilteredCodes(filtered);
        setCurrentPage(1);
    };

    const exportToCSV = () => {
        const headers = activeCodeType === 'namaste'
            ? ['Code', 'Name', 'English Name', 'Description', 'Category', 'System']
            : ['Code', 'Title', 'Definition', 'Parent', 'Chapter'];

        const rows = filteredCodes.map(code => {
            if (activeCodeType === 'namaste') {
                return [
                    code.code || '',
                    code.name || '',
                    code.name_english || '',
                    (code.description || '').replace(/"/g, '""'),
                    code.category || '',
                    code.system || ''
                ];
            } else {
                return [
                    code.code || '',
                    (code.title || '').replace(/"/g, '""'),
                    (code.definition || '').replace(/"/g, '""'),
                    code.parent || '',
                    code.chapter || ''
                ];
            }
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${activeCodeType}_codes_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Pagination
    const totalPages = Math.ceil(filteredCodes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCodes = filteredCodes.slice(startIndex, endIndex);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-neutral-900">Medical Code Database</h2>
                    <p className="text-neutral-600 mt-1">
                        Browse and search {activeCodeType === 'namaste' ? 'NAMASTE (AYUSH)' : 'ICD-11'} medical codes
                    </p>
                </div>
                <Button variant="outline" icon={Download} onClick={exportToCSV}>
                    Export to CSV
                </Button>
            </div>

            {/* Code Type Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveCodeType('namaste')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${activeCodeType === 'namaste'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Database size={18} />
                        NAMASTE Codes
                    </div>
                </button>
                <button
                    onClick={() => setActiveCodeType('icd11')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${activeCodeType === 'icd11'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FileText size={18} />
                        ICD-11 Codes
                    </div>
                </button>
            </div>

            {/* Search Bar */}
            <Card>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by code, name, description, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <div className="mt-2 text-sm text-neutral-600">
                    Showing {filteredCodes.length} of {codes.length} codes
                </div>
            </Card>

            {/* Data Table */}
            <Card>
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-neutral-600">Loading codes...</p>
                    </div>
                ) : filteredCodes.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="mx-auto text-neutral-400" size={48} />
                        <p className="mt-4 text-neutral-600">No codes found matching your search</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                            Code
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                            {activeCodeType === 'namaste' ? 'Name' : 'Title'}
                                        </th>
                                        {activeCodeType === 'namaste' && (
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                                English Name
                                            </th>
                                        )}
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                            {activeCodeType === 'namaste' ? 'Description' : 'Definition'}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                            {activeCodeType === 'namaste' ? 'Category' : 'Chapter'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                    {currentCodes.map((code, index) => (
                                        <tr key={index} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-primary-600">
                                                {code.code}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-neutral-900">
                                                {activeCodeType === 'namaste' ? code.name : code.title}
                                            </td>
                                            {activeCodeType === 'namaste' && (
                                                <td className="px-4 py-3 text-sm text-neutral-700">
                                                    {code.name_english || '-'}
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-sm text-neutral-700 max-w-md truncate">
                                                {activeCodeType === 'namaste'
                                                    ? (code.description || code.short_definition || '-')
                                                    : (code.definition || '-')
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-sm text-neutral-600">
                                                {activeCodeType === 'namaste' ? code.category : code.chapter}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
                                <div className="text-sm text-neutral-600">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};

export default CodeDataTab;
