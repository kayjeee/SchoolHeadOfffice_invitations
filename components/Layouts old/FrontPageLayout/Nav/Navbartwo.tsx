// In Navbartwo component
const Navbartwo: React.FC<{ roles: string[] }> = ({ roles }) => {
  // Now you can access the roles prop here
  const isAdmin = roles.includes('Admin'); // Example to check if the user has an 'Admin' role

  return (
    <nav className="bg-gray-800 text-white p-4">
      {/* Your Navbartwo layout */}
      {isAdmin && (
        <div>
          {/* Render admin-specific content */}
          <p>Admin Access</p>
        </div>
      )}
    </nav>
  );
};

export default Navbartwo;
