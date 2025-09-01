// Step5InviteStaff.jsx
import React, { useState } from "react";
import { PlusCircle, Trash } from "lucide-react";

const Step5InviteStaff = ({ formData, setFormData, onSubmit, onPrevious }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");

  const addInvite = () => {
    if (!email) return;

    // ✅ Always work from latest state
    setFormData((prev) => ({
      ...prev,
      invites: [...(prev.invites || []), { email, role }],
    }));

    setEmail(""); // reset input
  };

  const removeInvite = (index) => {
    setFormData((prev) => {
      const updated = [...(prev.invites || [])];
      updated.splice(index, 1);
      return { ...prev, invites: updated };
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Invite Staff Members</h2>
        <button
          type="button"
          className="text-blue-600 text-sm font-medium"
          onClick={onSubmit}
        >
          Skip
        </button>
      </div>

      {/* Why Invite Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <h3 className="text-base font-semibold text-blue-700 mb-1">
          Why invite staff?
        </h3>
        <p className="text-sm text-gray-700">
          Adding teachers and principals enhances parent-teacher communication,
          streamlines announcements, and improves overall engagement.
        </p>
      </div>

      {/* Email Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-900">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter staff email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>

      {/* Role Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-900">
          Role
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["teacher", "principal", "other"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-2 rounded-lg border font-medium text-sm capitalize ${
                role === r
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={addInvite}
        className="flex items-center text-blue-600 font-medium text-sm mb-6"
      >
        <PlusCircle className="w-5 h-5 mr-2" />
        Add Staff Member
      </button>

      {/* Invites List */}
      {formData.invites && formData.invites.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Invites to Send ({formData.invites.length})
          </h4>
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {formData.invites.map((invite, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center px-4 py-2 text-sm"
              >
                <span className="text-gray-900">{invite.email}</span>
                <span className="text-gray-500 capitalize">{invite.role}</span>
                <button
                  type="button"
                  onClick={() => removeInvite(idx)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between space-x-4">
        <button
          type="button"
          onClick={onPrevious}
          className="w-1/2 border border-gray-300 rounded-lg py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="w-1/2 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700"
        >
          Send Invites & Continue
        </button>
      </div>
    </div>
  );
};

export default Step5InviteStaff;
