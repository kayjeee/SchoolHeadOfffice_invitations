import React, { useState } from 'react';
import { FiDollarSign, FiCreditCard, FiShoppingCart, FiTrendingUp, FiInfo, FiPlus } from 'react-icons/fi';

const CreditSystem = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Mock data for credit system
  const creditBalance = 150;
  const monthlyUsage = 45;
  const lastPurchase = '2024-01-10';

  const creditPackages = [
    {
      id: 1,
      name: 'Starter Pack',
      credits: 100,
      price: 29.99,
      pricePerCredit: 0.30,
      popular: false,
      description: 'Perfect for small schools'
    },
    {
      id: 2,
      name: 'Professional Pack',
      credits: 500,
      price: 99.99,
      pricePerCredit: 0.20,
      popular: true,
      description: 'Most popular choice'
    },
    {
      id: 3,
      name: 'Enterprise Pack',
      credits: 1000,
      price: 149.99,
      pricePerCredit: 0.15,
      popular: false,
      description: 'Best value for large schools'
    }
  ];

  const usageHistory = [
    { date: '2024-01-16', description: 'Welcome emails sent', credits: 12, type: 'usage' },
    { date: '2024-01-15', description: 'Grade assignment notifications', credits: 8, type: 'usage' },
    { date: '2024-01-10', description: 'Professional Pack purchased', credits: 500, type: 'purchase' },
    { date: '2024-01-08', description: 'Parent portal invitations', credits: 25, type: 'usage' },
    { date: '2024-01-05', description: 'Bulk invitation campaign', credits: 35, type: 'usage' }
  ];

  const handlePurchaseCredits = (packageData) => {
    setSelectedPackage(packageData);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Purchasing credits:', selectedPackage);
      alert(`Successfully purchased ${selectedPackage.credits} credits!`);
      
      setShowPurchaseModal(false);
      setSelectedPackage(null);
    } catch (error) {
      console.error('Error purchasing credits:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  const getCreditStatusColor = () => {
    if (creditBalance > 100) return 'text-green-600';
    if (creditBalance > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCreditStatusBg = () => {
    if (creditBalance > 100) return 'bg-green-50 border-green-200';
    if (creditBalance > 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Credit System
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage your invitation credits and usage
            </p>
          </div>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Buy Credits
          </button>
        </div>

        {/* Credit Balance Overview */}
        <div className={`rounded-lg border p-4 mb-6 ${getCreditStatusBg()}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <FiDollarSign className={`h-6 w-6 mr-2 ${getCreditStatusColor()}`} />
                <h4 className="text-lg font-semibold text-gray-900">Current Balance</h4>
              </div>
              <p className={`text-3xl font-bold ${getCreditStatusColor()}`}>
                {creditBalance} credits
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Last purchase: {formatDate(lastPurchase)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">This month's usage</div>
              <div className="text-xl font-semibold text-gray-900">{monthlyUsage} credits</div>
              <div className="text-sm text-gray-500">
                Estimated {Math.ceil(monthlyUsage * 12 / 12)} credits/month
              </div>
            </div>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Available Credit Packages</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  pkg.popular ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h5 className="text-lg font-medium text-gray-900">{pkg.name}</h5>
                  <p className="text-sm text-gray-500 mb-2">{pkg.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">R{pkg.price}</span>
                    <div className="text-sm text-gray-500">
                      {pkg.credits} credits (R{pkg.pricePerCredit.toFixed(2)} per credit)
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchaseCredits(pkg)}
                    className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                      pkg.popular
                        ? 'text-white bg-blue-600 hover:bg-blue-700'
                        : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <FiShoppingCart className="mr-2 h-4 w-4" />
                    Purchase
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                How Credits Work
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>1 credit = 1 email invitation sent</li>
                  <li>Credits never expire</li>
                  <li>Bulk uploads use 1 credit per recipient</li>
                  <li>Failed deliveries are automatically refunded</li>
                  <li>View detailed usage in your account dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Usage History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Recent Activity</h4>
            <button className="text-sm text-blue-600 hover:text-blue-900">
              View All History
            </button>
          </div>
          
          <div className="space-y-3">
            {usageHistory.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mr-3 ${
                    item.type === 'purchase' ? 'bg-green-400' : 'bg-blue-400'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  item.type === 'purchase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.type === 'purchase' ? '+' : '-'}{item.credits} credits
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Credit Warning */}
        {creditBalance < 50 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiTrendingUp className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Low Credit Balance
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You have {creditBalance} credits remaining. Consider purchasing more credits to avoid interruption in your invitation campaigns.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200"
                  >
                    Purchase Credits Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPurchaseModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Purchase Credits
                  </h3>
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {selectedPackage ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{selectedPackage.name}</h4>
                      <p className="text-sm text-gray-600">{selectedPackage.description}</p>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-gray-900">R{selectedPackage.price}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          for {selectedPackage.credits} credits
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-800">
                        After purchase, you'll have <strong>{creditBalance + selectedPackage.credits}</strong> total credits.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {creditPackages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className="text-left border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">{pkg.name}</h4>
                            <p className="text-sm text-gray-600">{pkg.credits} credits</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">R{pkg.price}</div>
                            <div className="text-xs text-gray-500">R{pkg.pricePerCredit.toFixed(2)}/credit</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedPackage ? (
                  <>
                    <button
                      onClick={handleConfirmPurchase}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      <FiCreditCard className="mr-2 h-4 w-4" />
                      Complete Purchase
                    </button>
                    <button
                      onClick={() => setSelectedPackage(null)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Back
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditSystem;

