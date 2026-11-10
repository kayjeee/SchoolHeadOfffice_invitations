import React from 'react';
import { OrderStatus } from '../../../lib/api/shop-api';
import { Check, Clock, PackageCheck, Truck, CheckCircle2, XCircle } from 'lucide-react';

interface OrderStatusTrackerProps {
  status: OrderStatus;
}

const STEPS = [
  { key: 'placed', label: 'Placed', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: Check },
  { key: 'preparing', label: 'Preparing', icon: PackageCheck },
  { key: 'ready_for_collection', label: 'Ready for Collection', icon: Truck },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export default function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  const isCancelled = status === 'cancelled';
  const isRejected = status === 'rejected';

  if (isCancelled || isRejected) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
            {isCancelled ? 'Request Cancelled' : 'Request Rejected'}
          </span>
          <p className="text-xs text-red-600 mt-0.5">
            {isCancelled
              ? 'This request was cancelled before preparation began.'
              : 'The school could not fulfil this request.'}
          </p>
        </div>
      </div>
    );
  }

  const stepOrder = ['placed', 'accepted', 'preparing', 'ready_for_collection', 'completed'];
  const currentIndex = stepOrder.indexOf(status);

  return (
    <div className="py-2">
      {/* STEPPER BAR */}
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 w-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 z-0"
          style={{
            width: `${Math.max(0, (currentIndex / (STEPS.length - 1)) * 100)}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const IconComponent = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <IconComponent className="w-3.5 h-3.5" />
                )}
              </div>
              <span
                className={`mt-2 text-[10px] sm:text-xs font-semibold whitespace-nowrap text-center ${
                  isCurrent
                    ? 'text-blue-700 font-bold'
                    : isDone
                    ? 'text-gray-700'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
