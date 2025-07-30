import React, { useState } from "react";
import CreateSchoolForm from "../Schoolpage/CreateSchoolForm";

const SchoolSearchPage = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [schoolAvailable, setSchoolAvailable] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(0); // 0 = Search, 1 = Form

  const handleSearch = async () => {
    if (!user) {
      setMessage("You must be logged in to search for schools.");
      return;
    }

    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setMessage("");
    setSchoolAvailable(null);

    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/schools/search?query=${encodeURIComponent(searchTerm)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setSchoolAvailable(data.isAvailable);
        setMessage(data.message);

        if (data.isAvailable) setStep(1); // Move to Step 2
      } else {
        setMessage(data.message || "Error checking school availability.");
      }
    } catch (error) {
      setMessage("Failed to fetch school name availability.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
    

      {/* Step 1: Search */}
      {step === 0 && (
        <div className="container mx-auto py-6 px-4 md:px-10">
          <div className="flex items-center justify-center">
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-l"
              placeholder="Search for a school name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className={`px-6 py-2 rounded-r ${
                !searchTerm.trim() || isLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              onClick={handleSearch}
              disabled={!searchTerm.trim() || isLoading}
            >
              {isLoading ? "Checking..." : "Search"}
            </button>
          </div>

          {message && (
            <div
              className={`mt-4 p-4 rounded ${
                schoolAvailable
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Create School Form */}
      {step === 1 && (
        <div className="container mx-auto py-6 px-4 md:px-10">
          <CreateSchoolForm searchTerm={searchTerm} user={user}/>
        </div>
      )}
    </div>
  );
};

export default SchoolSearchPage;
