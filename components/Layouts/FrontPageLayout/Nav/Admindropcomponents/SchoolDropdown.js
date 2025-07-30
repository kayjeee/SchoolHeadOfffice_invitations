import { useState, useEffect } from "react";

const SchoolDropdown = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [approvedSchools, setApprovedSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleDropdown = () => setIsExpanded(!isExpanded);

  useEffect(() => {
    const fetchApprovedSchools = async () => {
      if (!user?.email) return;

      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/request_accesses/approved_schools?user[email]=${encodeURIComponent(user.email)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch approved schools");
        }

        const data = await response.json();
        setApprovedSchools(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedSchools();
  }, [user?.email]);

  return (
    <div className="space-y-2">
      <div
        className="flex items-center justify-between text-sm font-semibold text-gray-500 cursor-pointer"
        onClick={toggleDropdown}
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
            />
          </svg>
          Schools
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 h-5 transform ${isExpanded ? "rotate-180" : "rotate-0"} transition-transform`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isExpanded && <SchoolList loading={loading} error={error} schools={approvedSchools} />}
    </div>
  );
};

const SchoolList = ({ loading, error, schools }) => (
  <div className="ml-6 space-y-4 text-gray-700 max-h-40 overflow-y-auto">
    <ul className="space-y-2 pl-4 list-disc">
      {loading ? (
        <li>Loading...</li>
      ) : error ? (
        <li className="text-red-500">{error}</li>
      ) : schools.length > 0 ? (
        schools.map((school) => <SchoolItem key={school._id} school={school} />)
      ) : (
        <li>No approved schools found.</li>
      )}
    </ul>
  </div>
);

const SchoolItem = ({ school }) => (
  <li className="flex items-center space-x-2">
    <img
      src={school.logo || "/default-logo.png"}
      alt={school.schoolName}
      className="w-6 h-6 rounded-full"
    />
    <a href={`/schools/${school._id}`} className="hover:underline">
      {school.schoolName}
    </a>
  </li>
);

export default SchoolDropdown;
