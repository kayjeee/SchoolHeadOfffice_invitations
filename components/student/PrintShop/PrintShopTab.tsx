// components/student/PrintShop/PrintShopTab.tsx
import React, { useState } from 'react';

interface PrintBundle {
  id: string;
  title: string;
  description: string;
  grade: string;
  pages: number;
  price: number;
  isPopular?: boolean;
  category: 'worksheets' | 'past_papers' | 'notes' | 'revision';
}

const SAMPLE_BUNDLES: PrintBundle[] = [
  {
    id: 'bundle-1',
    title: 'Grade 10 Mathematics Term 1-4 Revision Pack',
    description: 'Comprehensive printed past exam papers, step-by-step memorandum, and key formula summaries.',
    grade: 'Grade 10',
    pages: 120,
    price: 45.00,
    isPopular: true,
    category: 'revision'
  },
  {
    id: 'bundle-2',
    title: 'Physical Sciences Physics & Chemistry Notes',
    description: 'Bound study guide with color diagrams, practice problem sets, and term summary sheets.',
    grade: 'Grade 10-12',
    pages: 85,
    price: 35.00,
    category: 'notes'
  },
  {
    id: 'bundle-3',
    title: 'Grade 10 Life Sciences Diagram & Worksheet Bundle',
    description: 'High-contrast black-and-white organelle and cellular process diagrams for active recall.',
    grade: 'Grade 10',
    pages: 60,
    price: 25.00,
    category: 'worksheets'
  },
  {
    id: 'bundle-4',
    title: 'English Home Language Literature & Poetry Companion',
    description: 'Annotated setworks, essay structures, and matric poetry guide booklets.',
    grade: 'Grade 10-12',
    pages: 75,
    price: 30.00,
    category: 'past_papers'
  }
];

interface PrintOrder {
  id: string;
  bundleTitle: string;
  pages: number;
  copies: number;
  totalPrice: number;
  fulfilmentOption: 'school_collection' | 'local_delivery';
  deliveryAddress?: string;
  status: 'submitted' | 'printing' | 'ready_for_collection' | 'completed';
  createdAt: string;
}

export default function PrintShopTab() {
  const [activeTab, setActiveTab] = useState<'bundles' | 'custom' | 'history'>('bundles');
  const [selectedBundle, setSelectedBundle] = useState<PrintBundle | null>(null);

  // Custom request form state
  const [documentTitle, setDocumentTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [pagesCount, setPagesCount] = useState(10);
  const [copiesCount, setCopiesCount] = useState(1);
  const [printType, setPrintType] = useState<'bw' | 'color'>('bw');
  const [fulfilmentOption, setFulfilmentOption] = useState<'school_collection' | 'local_delivery'>('school_collection');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [orders, setOrders] = useState<PrintOrder[]>([
    {
      id: 'ORD-9821',
      bundleTitle: 'Grade 10 Mathematics Term 1-4 Revision Pack',
      pages: 120,
      copies: 1,
      totalPrice: 45.00,
      fulfilmentOption: 'school_collection',
      status: 'ready_for_collection',
      createdAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString()
    }
  ]);
  const [isSuccess, setIsSuccess] = useState(false);

  // Price calculations
  const bwPricePerPage = 0.35; // R0.35 per BW page
  const colorPricePerPage = 1.50; // R1.50 per Color page
  const deliveryFee = fulfilmentOption === 'local_delivery' ? 20.00 : 0.00;

  const calculatedCustomPrice = (
    (pagesCount * (printType === 'bw' ? bwPricePerPage : colorPricePerPage)) * copiesCount + deliveryFee
  );

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: PrintOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      bundleTitle: selectedBundle ? selectedBundle.title : documentTitle || 'Custom Print Job',
      pages: selectedBundle ? selectedBundle.pages : pagesCount,
      copies: copiesCount,
      totalPrice: selectedBundle ? selectedBundle.price * copiesCount + deliveryFee : calculatedCustomPrice,
      fulfilmentOption,
      deliveryAddress: fulfilmentOption === 'local_delivery' ? deliveryAddress : undefined,
      status: 'submitted',
      createdAt: new Date().toLocaleDateString()
    };

    setOrders([newOrder, ...orders]);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedBundle(null);
      setActiveTab('history');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-500/30 text-blue-200 text-xs font-semibold rounded-full mb-2">
            South African Learner Support
          </span>
          <h2 className="text-xl font-bold">Learner Print Shop & Local Delivery</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Affordable printed revision packs, worksheets, and study notes. Collect at school or opt for local community delivery.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('bundles')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition ${
              activeTab === 'bundles' ? 'bg-white text-indigo-900 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Print Bundles
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition ${
              activeTab === 'custom' ? 'bg-white text-indigo-900 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Custom Job
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition ${
              activeTab === 'history' ? 'bg-white text-indigo-900 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Order History ({orders.length})
          </button>
        </div>
      </div>

      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>✅ Print request submitted successfully! Tracking added to Order History.</span>
        </div>
      )}

      {/* SECTION 1: PRINT BUNDLES */}
      {activeTab === 'bundles' && !selectedBundle && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Recommended Curriculum Bundles</h3>
            <span className="text-xs text-gray-500">Subsidized printing rates for learners</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_BUNDLES.map((bundle) => (
              <div
                key={bundle.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                      {bundle.grade}
                    </span>
                    {bundle.isPopular && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        ⭐ Popular
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{bundle.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{bundle.description}</p>

                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-600">
                    <span>📄 {bundle.pages} Pages</span>
                    <span>📑 Double-sided</span>
                    <span>📍 School Pickup</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-xs text-gray-400 block">Total Price</span>
                    <span className="text-lg font-extrabold text-indigo-900">R{bundle.price.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => setSelectedBundle(bundle)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Order Bundle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: BUNDLE CHECKOUT / CUSTOM FORM */}
      {(selectedBundle || activeTab === 'custom') && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">
              {selectedBundle ? `Order Bundle: ${selectedBundle.title}` : 'Submit Custom Print Request'}
            </h3>
            {selectedBundle && (
              <button
                onClick={() => setSelectedBundle(null)}
                className="text-xs text-indigo-600 font-medium hover:underline"
              >
                Change Selection
              </button>
            )}
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
            {!selectedBundle && (
              <>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Document Title / Worksheets</label>
                  <input
                    type="text"
                    required
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="e.g. Grade 10 Math Functions Worksheet"
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:ring-indigo-500"
                    >
                      <option>Mathematics</option>
                      <option>Physical Sciences</option>
                      <option>Life Sciences</option>
                      <option>English Home Language</option>
                      <option>Geography</option>
                      <option>Accounting</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Estimated Pages</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={pagesCount}
                      onChange={(e) => setPagesCount(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Print Color Mode</label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="printType"
                        checked={printType === 'bw'}
                        onChange={() => setPrintType('bw')}
                      />
                      <span>Black & White (R0.35 / page)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="printType"
                        checked={printType === 'color'}
                        onChange={() => setPrintType('color')}
                      />
                      <span>Color (R1.50 / page)</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-medium text-gray-700 mb-1">Number of Copies</label>
              <input
                type="number"
                min={1}
                max={10}
                value={copiesCount}
                onChange={(e) => setCopiesCount(Number(e.target.value))}
                className="w-24 rounded-lg border border-gray-300 p-2 text-xs"
              />
            </div>

            {/* FULFILMENT SELECTION */}
            <div className="pt-3 border-t border-gray-100">
              <label className="block font-semibold text-gray-900 mb-2">Fulfilment & Delivery Method</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setFulfilmentOption('school_collection')}
                  className={`p-3 rounded-xl border cursor-pointer ${
                    fulfilmentOption === 'school_collection'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block font-bold text-xs">🏫 School Collection Point</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Collect at Main Admin Office (Free)</span>
                </div>

                <div
                  onClick={() => setFulfilmentOption('local_delivery')}
                  className={`p-3 rounded-xl border cursor-pointer ${
                    fulfilmentOption === 'local_delivery'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block font-bold text-xs">🛵 Local Community Delivery</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Delivered to home address (+R20.00)</span>
                </div>
              </div>
            </div>

            {fulfilmentOption === 'local_delivery' && (
              <div>
                <label className="block font-medium text-gray-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street name, house number, area"
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs"
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-gray-700 mb-1">Special Notes / Stapling Instructions</label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Please staple top left corner"
                className="w-full rounded-lg border border-gray-300 p-2 text-xs"
              />
            </div>

            {/* PRICING BREAKDOWN */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Print Cost:</span>
                <span>R{selectedBundle ? (selectedBundle.price * copiesCount).toFixed(2) : (calculatedCustomPrice - deliveryFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Fulfilment Fee:</span>
                <span>R{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200 text-sm">
                <span>Total Amount:</span>
                <span className="text-indigo-900 font-extrabold">
                  R{selectedBundle ? (selectedBundle.price * copiesCount + deliveryFee).toFixed(2) : calculatedCustomPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-sm"
            >
              Submit Print Request
            </button>
          </form>
        </div>
      )}

      {/* SECTION 3: ORDER HISTORY & STATUS TRACKING */}
      {activeTab === 'history' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 text-base mb-4">Print Request Tracking & History</h3>

          {orders.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No active print orders found.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-900">{order.id}</span>
                      <span className="text-[10px] text-gray-400">• {order.createdAt}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-xs mt-0.5">{order.bundleTitle}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {order.pages} pages • {order.copies} copy • {order.fulfilmentOption === 'school_collection' ? 'School Office Collection' : 'Local Delivery'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <span className="text-sm font-bold text-gray-900">R{order.totalPrice.toFixed(2)}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'ready_for_collection'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'printing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
