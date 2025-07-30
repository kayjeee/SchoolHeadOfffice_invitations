import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProfessionalSection({ user }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [approvedSchools, setApprovedSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const toggleSection = () => {
    setIsExpanded((prev) => !prev);
  };

  useEffect(() => {
    const fetchSchoolsForAdmin = async () => {
      if (!user?.email || hasFetched || !isExpanded) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/admin_users/schools_for_admin?email=${encodeURIComponent(user.email)}`
        );

        if (!response.ok) throw new Error("Failed to fetch approved schools");

        const data = await response.json();
        setApprovedSchools(data.schools || []);
      } catch (err) {
        console.error("Error fetching schools:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    };

    fetchSchoolsForAdmin();
  }, [isExpanded, hasFetched, user?.email]);

  return (
    <div className="space-y-2">
      <h3
        className="flex items-center text-sm font-semibold text-gray-500 cursor-pointer hover:text-gray-700"
        onClick={toggleSection}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347"
          />
        </svg>
        Professional
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 h-5 ml-2 transform transition-transform ${isExpanded ? "rotate-180" : "rotate-0"}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </h3>

      {isExpanded && (
        <div className="mt-2">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : approvedSchools.length > 0 ? (
            <ul className="space-y-2">
              {approvedSchools.map((school) => (
                <li key={school._id} className="text-sm text-gray-700">
                  <Link href={`/schools/${school._id}`} className="hover:text-blue-500">
                    {school.schoolName}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No schools found where you are an admin.</p>
          )}
        </div>
      )}
    </div>
  );
}
