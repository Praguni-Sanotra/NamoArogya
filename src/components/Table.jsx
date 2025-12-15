/**
 * Reusable Table Component
 * For displaying data in tabular format
 */

const Table = ({ columns, data, loading = false, emptyMessage = 'No data available' }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-neutral-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} className={column.headerClassName || ''}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} className={column.cellClassName || ''}>
                                    {column.render
                                        ? column.render(row, rowIndex)
                                        : row[column.accessor]
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
