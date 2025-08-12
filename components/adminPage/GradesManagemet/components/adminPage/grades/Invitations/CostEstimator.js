import React from 'react';
import { Calculator, MessageCircle, Smartphone, Mail, AlertTriangle } from 'lucide-react';

const CostEstimator = ({ channels, recipientCount, smsSupplier, onCostChange }) => {
  const supplierRates = {
    twilio: 0.30,
    winsms: 0.25,
    bulksms: 0.20
  };

  const currentSmsRate = supplierRates[smsSupplier] || 0.30;
  
  // Calculate costs
  const costs = {
    whatsapp: 0, // Always free
    sms: channels.sms ? recipientCount * currentSmsRate : 0,
    email: 0, // Always free
    total: 0
  };
  costs.total = costs.whatsapp + costs.sms + costs.email;

  // Notify parent component of cost changes
  React.useEffect(() => {
    if (onCostChange) {
      onCostChange(costs);
    }
  }, [channels.sms, recipientCount, smsSupplier]);

  const costLines = [
    {
      key: 'whatsapp',
      icon: MessageCircle,
      iconColor: 'text-green-500',
      label: 'WhatsApp:',
      cost: 'R0.00',
      details: `${recipientCount} messages`,
      visible: channels.whatsapp,
      costColor: 'text-green-600'
    },
    {
      key: 'sms',
      icon: Smartphone,
      iconColor: 'text-blue-500',
      label: `SMS (${smsSupplier}):`,
      cost: `R${costs.sms.toFixed(2)}`,
      details: `${recipientCount} × R${currentSmsRate.toFixed(2)}`,
      visible: channels.sms,
      costColor: 'text-yellow-600'
    },
    {
      key: 'email',
      icon: Mail,
      iconColor: 'text-purple-500',
      label: 'Email:',
      cost: 'R0.00',
      details: `${recipientCount} messages`,
      visible: channels.email,
      costColor: 'text-green-600'
    }
  ];

  const enabledChannels = Object.keys(channels).filter(ch => channels[ch]);
  const totalBreakdown = enabledChannels.join(' + ') + ' only';
  const showBudgetAlert = costs.total > 20; // Show alert if cost exceeds R20

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calculator className="mr-2 text-yellow-600 w-5 h-5" />
        Cost Estimation
      </h3>
      
      {/* Cost Breakdown */}
      <div className="space-y-4">
        {/* Recipients Count */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Recipients:</span>
          <span className="font-medium">{recipientCount} parents</span>
        </div>

        {/* Individual Cost Lines */}
        {costLines.filter(line => line.visible).map(({ key, icon: Icon, iconColor, label, cost, details, costColor }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <Icon className={`w-4 h-4 ${iconColor} mr-2`} />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
            <div className="text-right">
              <div className={`font-medium ${costColor}`}>{cost}</div>
              <div className="text-xs text-gray-500">{details}</div>
            </div>
          </div>
        ))}

        {/* Total Cost */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total Cost:</span>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">R{costs.total.toFixed(2)}</div>
              <div className="text-xs text-gray-500">{totalBreakdown}</div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>WhatsApp rate:</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            {channels.sms && (
              <div className="flex justify-between">
                <span>SMS rate ({smsSupplier}):</span>
                <span className="text-yellow-600 font-medium">R{currentSmsRate.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Email rate:</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
          </div>
        </div>

        {/* Budget Alert */}
        {showBudgetAlert && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <div className="font-medium">Budget Alert</div>
                <div>This will cost more than your typical campaign. Consider using free channels only.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostEstimator;