import React from "react";
import { Learner } from "../../types";

interface LearnerCardProps {
  learner: Learner;
  getDisplayName: (learner: Learner) => string;
  getDisplayGender: (learner: Learner) => string;
  getDisplayStatus: (learner: Learner) => string;
}

export const LearnerCard: React.FC<LearnerCardProps> = ({
  learner,
  getDisplayName,
  getDisplayGender,
  getDisplayStatus,
}) => {
  return (
    <div
      key={learner.id}
      className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
              {getDisplayName(learner).charAt(0).toUpperCase()}
            </div>
            <div>
              <h5 className="font-medium text-gray-900 text-sm">
                {getDisplayName(learner)}
              </h5>
              {learner.accession_number && (
                <p className="text-xs text-gray-500">
                  ID: {learner.accession_number}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
            {getDisplayGender(learner) !== "Unknown" && (
              <div>
                <span className="font-medium">Gender:</span> {getDisplayGender(learner)}
              </div>
            )}

            {getDisplayStatus(learner) !== "Unknown" && (
              <div>
                <span className="font-medium">Status:</span>
                <span
                  className={`ml-1 px-1 rounded ${
                    getDisplayStatus(learner) === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {getDisplayStatus(learner)}
                </span>
              </div>
            )}

            {learner.email && (
              <div className="col-span-2">
                <span className="font-medium">Email:</span>
                <span className="ml-1 text-blue-600 truncate">{learner.email}</span>
              </div>
            )}

            {learner.phone && (
              <div className="col-span-2">
                <span className="font-medium">Phone:</span>
                <span className="ml-1">{learner.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-1">
          <div
            className={`text-xs px-2 py-1 rounded-full ${
              getDisplayStatus(learner) === "Active"
                ? "bg-green-100 text-green-800"
                : getDisplayStatus(learner) === "Inactive"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {getDisplayStatus(learner)}
          </div>
          {learner.created_at && (
            <div className="text-xs text-gray-400">
              Joined: {new Date(learner.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
