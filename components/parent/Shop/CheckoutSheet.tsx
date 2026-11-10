import React, { useState } from 'react';
import { useCart } from './CartContext';
import {
  ShopAPI,
  CreateOrderPayload,
  Order,
  formatCurrency,
} from '../../../lib/api/shop-api';
import {
  X,
  CheckCircle,
  AlertTriangle,
  Building2,
  User,
  ShoppingBag,
  Send,
  Loader2,
} from 'lucide-react';

interface CheckoutSheetProps {
  schoolId: string;
  parentProfile: any;
  onOrderSuccess: (order: Order) => void;
}

export default function CheckoutSheet({
  schoolId,
  parentProfile,
  onOrderSuccess,
}: CheckoutSheetProps) {
  const {
    cartItems,
    selectedLearner,
    estimatedTotalCents,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
  } = useCart();

  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setErrorMessage(null);
    setCompletedOrder(null);
  };

  const handleSendRequest = async () => {
    if (!selectedLearner) {
      setErrorMessage('Please select a learner before submitting.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload: CreateOrderPayload = {
        order: {
          school_id: schoolId,
          parent_id: parentProfile?.id || parentProfile?.user_id,
          parent_email: parentProfile?.email,
          learner_id: selectedLearner.id,
          learner_name:
            selectedLearner.full_name ||
            `${selectedLearner.first_name} ${selectedLearner.last_name}`,
          learner_grade: selectedLearner.grade,
          notes: orderNotes.trim() || undefined,
          fulfilment_type: 'collect_at_school',
          items: cartItems.map((item) => ({
            catalog_item_id: item.catalogItem.id,
            variant_id: item.variant?.id,
            quantity: item.quantity,
            print_options: item.printOptions,
            notes: item.notes,
          })),
        },
      };

      const serverOrder = await ShopAPI.createOrder(payload);

      // On successful order creation, clear the cart and display server-computed totals
      clearCart();
      setCompletedOrder(serverOrder);
      onOrderSuccess(serverOrder);
    } catch (err: any) {
      console.error('[CheckoutSheet] Submission error:', err);
      // Keep cart intact on error and show clear error message
      setErrorMessage(
        err?.message ||
          'Failed to submit your school shop request. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* BACKDROP */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4 text-center">
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-lg bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all flex flex-col max-h-[90vh]"
        >
          {/* HEADER */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {completedOrder ? 'Request Submitted!' : 'Confirm School Request'}
                </h2>
                <div className="text-xs text-gray-500">Collect at school office</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* BODY */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {completedOrder ? (
              /* SUCCESS STATE */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Request #{completedOrder.order_number}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Your request has been successfully sent to the school administration.
                  </p>
                </div>

                {/* SERVER-CONFIRMED TOTAL */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-left space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Learner:</span>
                    <span className="font-bold text-gray-900">
                      {completedOrder.learner_name} ({completedOrder.learner_grade})
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Items Count:</span>
                    <span className="font-bold text-gray-900">
                      {completedOrder.items.reduce((s, i) => s + i.quantity, 0)} items
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Official Total:</span>
                    <span className="text-blue-600 font-extrabold text-base">
                      {formatCurrency(completedOrder.total_cents)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 text-left">
                  💡 You can monitor preparation progress in the <strong>"My Requests"</strong> tab.
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
                >
                  Close & View Requests
                </button>
              </div>
            ) : (
              /* REVIEW FORM */
              <>
                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-left">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-red-800">Request Failed</h4>
                      <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* RECIPIENT LEARNER */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Request Details
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>
                      {selectedLearner?.full_name || selectedLearner?.first_name} (
                      {selectedLearner?.grade})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>Collect at school reception / administration office</span>
                  </div>
                </div>

                {/* LINE ITEMS PREVIEW */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Items ({cartItems.length})
                  </div>
                  <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-gray-900">
                            {item.quantity}x {item.catalogItem.name}
                          </span>
                          {item.variant && (
                            <span className="text-gray-500 ml-1.5 font-normal">
                              ({item.variant.name})
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(item.estimatedLineTotalCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NOTES */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Additional Instructions for Admin (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Please inform learner in Grade 10-A to collect..."
                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                </div>

                {/* TOTAL */}
                <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Estimated Total:</div>
                    <div className="text-xs text-gray-400">Payable at school</div>
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    {formatCurrency(estimatedTotalCents)}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FOOTER */}
          {!completedOrder && (
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-3 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendRequest}
                disabled={isSubmitting || cartItems.length === 0}
                className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Request to School</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
