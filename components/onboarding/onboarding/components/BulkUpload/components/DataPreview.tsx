import React from 'react';

interface DataPreviewProps {
  preview: any[];
}

export const DataPreview: React.FC<DataPreviewProps> = ({ preview }) => {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-800 mb-2">Preview (First 3 valid rows)</h4>
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telegram</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {preview.length > 0 ? (
              preview.map((row, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {row.firstName} {row.lastName}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{row.phone || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{row.whatsapp || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{row.telegram || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{row.parentName || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-3 py-2 text-sm text-gray-500 text-center">
                  No valid learners found to preview.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};