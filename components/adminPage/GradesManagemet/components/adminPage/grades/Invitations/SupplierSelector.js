import React from 'react';
import { Settings } from 'lucide-react';

const SupplierSelector = ({ selectedSupplier, onSupplierChange, visible }) => {
  const suppliers = [
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'Premium global delivery',
      rate: 0.30,
      recommended: true
    },
    {
      id: 'winsms',
      name: 'WinSMS',
      description: 'Local South African provider',
      rate: 0.25
    },
    {
      id: 'bulksms',
      name: 'BulkSMS',
      description: 'Bulk messaging specialist',
      rate: 0.20
    }
  ];

  if (!visible) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Settings className="mr-2 text-blue-600 w-5 h-5" />
        SMS Supplier Selection
      </h3>
      
      <div className="space-y-3">
        {suppliers.map((supplier) => (
          <div 
            key={supplier.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onSupplierChange(supplier.id)}
          >
            <div className="flex items-center">
              <input 
                type="radio" 
                name="smsSupplier" 
                id={supplier.id}
                value={supplier.id}
                checked={selectedSupplier === supplier.id}
                onChange={() => onSupplierChange(supplier.id)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-600" 
              />
              <label htmlFor={supplier.id} className="ml-3 cursor-pointer">
                <div className="font-medium text-gray-900">{supplier.name}</div>
                <div className="text-sm text-gray-500">{supplier.description}</div>
              </label>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">R{supplier.rate.toFixed(2)} per SMS</div>
              {supplier.recommended && (
                <div className="text-xs text-gray-500">Recommended</div>
              )}
              {supplier.rate === 0.25 && (
                <div className="text-xs text-gray-500">Cost effective</div>
              )}
              {supplier.rate === 0.20 && (
                <div className="text-xs text-gray-500">Budget friendly</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplierSelector;