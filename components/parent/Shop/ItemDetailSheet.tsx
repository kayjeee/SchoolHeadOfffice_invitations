import React, { useState, useEffect } from 'react';
import { CatalogItem, ItemVariant, SelectedPrintOptions, formatCurrency } from '../../../lib/api/shop-api';
import { useCart } from './CartContext';
import { X, Minus, Plus, Check, ShoppingBag, FileText, CheckCircle2 } from 'lucide-react';

interface ItemDetailSheetProps {
  item: CatalogItem | null;
  onClose: () => void;
}

export default function ItemDetailSheet({ item, onClose }: ItemDetailSheetProps) {
  const { addItem, selectedLearner } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  // Print specific options
  const [copies, setCopies] = useState(1);
  const [isColor, setIsColor] = useState(false);
  const [isDoubleSided, setIsDoubleSided] = useState(false);

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setNotes('');
      setCopies(1);
      setIsColor(false);
      setIsDoubleSided(false);
      setIsAddedFeedback(false);

      if (item.variants && item.variants.length > 0) {
        setSelectedVariant(item.variants[0]);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [item]);

  if (!item) return null;

  const isPrints = item.category === 'prints';
  const printConfig = item.print_options_config;

  // Calculate live unit price & total
  let unitPriceCents = item.base_price_cents;
  if (selectedVariant && typeof selectedVariant.price_cents === 'number') {
    unitPriceCents = selectedVariant.price_cents;
  }

  if (isPrints && printConfig) {
    let perPage = printConfig.price_per_page_cents ?? unitPriceCents;
    if (isColor && printConfig.color_surcharge_cents) {
      perPage += printConfig.color_surcharge_cents;
    }
    if (isDoubleSided && printConfig.double_sided_discount_cents) {
      perPage = Math.max(0, perPage - printConfig.double_sided_discount_cents);
    }
    unitPriceCents = perPage * copies;
  }

  const lineTotalCents = unitPriceCents * quantity;

  const handleAddToCart = () => {
    const printOptions: SelectedPrintOptions | null = isPrints
      ? {
          copies,
          is_color: isColor,
          is_double_sided: isDoubleSided,
        }
      : null;

    addItem({
      catalogItem: item,
      variant: selectedVariant,
      printOptions,
      quantity,
      notes: notes.trim() || undefined,
    });

    setIsAddedFeedback(true);
    setTimeout(() => {
      setIsAddedFeedback(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4 text-center">
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all flex flex-col max-h-[90vh]"
        >
          {/* HEADER */}
          <div className="relative aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                <span className="text-6xl mb-2">
                  {isPrints ? '📄' : item.category === 'uniform' ? '👕' : '✏️'}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  {item.category}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 uppercase">
                  {item.category}
                </span>
                {item.subcategory && (
                  <span className="text-xs text-gray-500 font-medium">• {item.subcategory}</span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mt-2">{item.name}</h2>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {item.description || 'Official school item approved for students.'}
              </p>
            </div>

            {/* LEARNER NOTICE */}
            {selectedLearner && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-gray-500">Adding to request for:</span>
                <span className="font-bold text-gray-900">
                  {selectedLearner.full_name || selectedLearner.first_name} ({selectedLearner.grade})
                </span>
              </div>
            )}

            {/* VARIANTS PICKER (IF APPLICABLE) */}
            {item.variants && item.variants.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Select Size / Option
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {item.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600 ring-offset-1'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{v.name}</span>
                        {typeof v.price_cents === 'number' && (
                          <span className="text-[10px] text-gray-500 mt-0.5">
                            {formatCurrency(v.price_cents)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PRINTS CONFIGURATION OPTIONS */}
            {isPrints && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Print & Paper Specifications</span>
                </div>

                {/* NUMBER OF COPIES PER PACKET */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Copies of this document:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    <button
                      type="button"
                      disabled={copies <= 1}
                      onClick={() => setCopies((c) => Math.max(1, c - 1))}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-gray-900">{copies}</span>
                    <button
                      type="button"
                      onClick={() => setCopies((c) => c + 1)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* COLOUR TOGGLE */}
                {printConfig?.allow_color && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div>
                      <div className="text-xs font-medium text-gray-900">Full Colour Printing</div>
                      <div className="text-[11px] text-gray-500">
                        {printConfig.color_surcharge_cents
                          ? `+${formatCurrency(printConfig.color_surcharge_cents)} surcharge`
                          : 'Standard colour'}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isColor}
                      onChange={(e) => setIsColor(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* DOUBLE SIDED TOGGLE */}
                {printConfig?.allow_double_sided && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div>
                      <div className="text-xs font-medium text-gray-900">Double-Sided Printing</div>
                      <div className="text-[11px] text-gray-500">Eco-friendly duplex printing</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isDoubleSided}
                      onChange={(e) => setIsDoubleSided(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* SPECIAL NOTES */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Special Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g., Please staple top-left, or name label preference..."
                className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>
          </div>

          {/* STICKY FOOTER / ACTIONS */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4">
            {/* QUANTITY STEPPER */}
            <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden h-12">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-gray-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* ADD TO REQUEST BUTTON */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-between px-5 text-white transition-all shadow-md ${
                isAddedFeedback ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {isAddedFeedback ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
                <span>{isAddedFeedback ? 'Added to Request!' : 'Add to Request'}</span>
              </div>
              <span className="font-extrabold text-base">{formatCurrency(lineTotalCents)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
