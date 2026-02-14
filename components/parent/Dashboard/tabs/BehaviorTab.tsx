import React from "react";
import { Learner } from "../../../../lib/types/parent.types";

interface BehaviorTabProps {
  learners: Learner[];
  isPremium?: boolean;
}

export default function BehaviorTab({ learners, isPremium }: BehaviorTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Behavioral Insights</h2>

      {!isPremium && (
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg text-purple-800 text-sm">
          <strong>Premium Feature:</strong> Behavioral tracking and pattern analysis are available for Premium subscribers.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4 text-green-700">Positive Feedback</h3>
          <div className="space-y-4">
            {[
              { comment: "Shows great leadership in group work", date: "Oct 25", teacher: "Mr. Smith" },
              { comment: "Always helps classmates with complex problems", date: "Oct 18", teacher: "Ms. Johnson" },
            ].map((item, i) => (
              <div key={i} className="bg-green-50/50 p-3 rounded-lg border border-green-50">
                <p className="text-sm text-gray-800">"{item.comment}"</p>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>{item.teacher}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4 text-orange-700">Areas for Improvement</h3>
          {isPremium ? (
             <div className="space-y-4">
               <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-50">
                 <p className="text-sm text-gray-800">Needs to focus more during afternoon sessions.</p>
                 <div className="flex justify-between mt-2 text-xs text-gray-500">
                   <span>Ms. Davis</span>
                   <span>Oct 20</span>
                 </div>
               </div>
             </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm italic">
              Locked for Standard Plan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
