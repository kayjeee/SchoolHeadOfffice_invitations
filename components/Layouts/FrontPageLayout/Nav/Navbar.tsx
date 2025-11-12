import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState, useMemo } from "react";
import { useAppTheme } from "../../context/ThemeContext";
import { School } from "../../shared/types/School";
import { User } from "../../shared/types/User";
import { UserRole } from "../../shared/types/UserRole";
import AdminDrop from "./AdminDrop";
import MenuDropdown from "./MenuDropdown";
import MenuReflectionTab from "./MenuReflectionTab";
import { 
  generateColorPalette, 
  ColorPalette, 
  getLogoColor,
  getComplementaryColor,
  getTriadicColors 
} from "../../NavbarTheming/colorUtils";

interface NavbarProps {
  user?: User;
  loading: boolean;
  schools?: School[];
  searchQuery?: string;
  userRoles?: UserRole[];
  setSearchQuery?: (query: string) => void;
  schoolImage?: string;
  schoolTheme?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  user,
  loading,
  schools = [],
  searchQuery = "",
  userRoles = [],
  setSearchQuery,
  schoolImage,
}) => {
  const [showReflection, setShowReflection] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const router = useRouter();

  const { currentSchool, getPrimaryColorValue } = useAppTheme();

  // 🎨 Generate theme palette
  const themePalette: ColorPalette | null = useMemo(() => {
    const primaryColorValue = getPrimaryColorValue();
    const palette = generateColorPalette(primaryColorValue);
    if (!palette) {
      const logoColor = getLogoColor(primaryColorValue) || '#190961ff';
      return { primary: primaryColorValue, logo: logoColor };
    }
    return palette;
  }, [getPrimaryColorValue]);

  // 🎨 SVG background (color harmony)
  const svgBackgroundColor = useMemo(() => {
    const primaryColorValue = getPrimaryColorValue();
    const triadicColors = getTriadicColors(primaryColorValue);
    if (triadicColors?.length >= 2) return triadicColors[1];
    const complementaryColor = getComplementaryColor(primaryColorValue);
    if (complementaryColor) return complementaryColor;
    try {
      const rgb = parseInt(primaryColorValue.slice(1), 16);
      const r = Math.min(255, ((rgb >> 16) & 0xff) * 1.2);
      const g = Math.min(255, ((rgb >> 8) & 0xff) * 1.2);
      const b = Math.min(255, (rgb & 0xff) * 1.2);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    } catch {
      return "#f0f0f0";
    }
  }, [getPrimaryColorValue]);

  const svgIconColor = useMemo(
    () => getLogoColor(svgBackgroundColor) || '#000000',
    [svgBackgroundColor]
  );

  const adminDropdownRef = useRef<HTMLDivElement | null>(null);
  const profileModalRef = useRef<HTMLDivElement | null>(null);

  // 🧠 Role check
  const isAdmin = Array.isArray(userRoles) && userRoles.some((role) =>
    typeof role === "string" ? role.toLowerCase() === "admin" : (role as any) === "admin"
  );

  const handleLogin = () => router.push("/api/auth/login");
  const handleLogout = () => router.push("/api/auth/logout");

  const toggleReflection = () => setShowReflection((p) => !p);
  const toggleProfileModal = () => setShowProfileModal((p) => !p);
  const toggleAdminDropdown = () => setShowAdminDropdown((p) => !p);

  // 🖱 Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target as Node)) {
        setShowAdminDropdown(false);
      }
      if (profileModalRef.current && !profileModalRef.current.contains(e.target as Node)) {
        setShowProfileModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav
        className="border-b border-gray-200 relative"
        style={{ backgroundColor: getPrimaryColorValue() }}
      >
        <div className="max-w-full mx-auto h-20 flex items-center justify-between px-4">
          {/* ---------- LEFT SECTION (LOGO + AWARD) ---------- */}
          <div className="flex items-center space-x-6">
            <Link href="/" passHref>
              <img
                src={schoolImage || currentSchool?.schoolImage || "/ShoLogoUpdate.png"}
                alt="SchoolHeadOffice Logo"
                width={70}
                height={90}
                className="cursor-pointer"
                style={{
                  filter: themePalette?.logo === '#FFFFFF' ? 'invert(1) brightness(2)' : 'none',
                }}
              />
            </Link>

            {/* 🏆 F6S Award Badge */}
            <a
              href="https://www.f6s.com/schoolheadoffice.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              <img
                src="/fs6awardlogo.png"
                alt="F6S Award Badge"
                className="h-10 w-auto"
                style={{ borderRadius: "8px", boxShadow: "0 0 6px rgba(0,0,0,0.15)" }}
              />
            </a>

            {/* School Name */}
            {currentSchool && (
              <h1
                className="text-xl font-bold"
                style={{
                  color: themePalette?.logo || "white",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                }}
              >
                {currentSchool.schoolName}
              </h1>
            )}
          </div>

          {/* ---------- RIGHT SECTION (ACTIONS) ---------- */}
          <div className="flex items-center space-x-8">
            {!loading ? (
              user ? (
                <>
                  {/* Admin Dropdown */}
                  {isAdmin && (
                    <div className="relative" ref={adminDropdownRef}>
                      <button
                        onClick={toggleAdminDropdown}
                        className="hover:scale-105 transition-all p-2 rounded-lg shadow-sm hover:shadow-md"
                        style={{
                          backgroundColor: svgBackgroundColor,
                          border: `2px solid ${themePalette?.tertiary || svgBackgroundColor}`,
                          color: svgIconColor,
                        }}
                        aria-label="Admin menu"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {showAdminDropdown && <AdminDrop userRoles={userRoles} user={user} />}
                    </div>
                  )}

                  {/* Profile */}
                  <div
                    className="flex items-center space-x-2 cursor-pointer group"
                    onClick={toggleProfileModal}
                  >
                    <span
                      className="group-hover:opacity-80 transition-opacity group-hover:underline"
                      style={{ color: themePalette?.logo || "white" }}
                    >
                      Profile
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: themePalette?.logo || "white" }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: themePalette?.logo || "white" }}
                >
                  Login
                </button>
              )
            ) : (
              <span style={{ color: themePalette?.logo || "white" }}>Loading...</span>
            )}

            <MenuDropdown
              toggleReflection={toggleReflection}
              iconColor={themePalette?.logo || "white"}
              backgroundColor={svgBackgroundColor}
            />
          </div>
        </div>
      </nav>

      {/* ---------- Reflection Tab ---------- */}
      {showReflection && <MenuReflectionTab />}

      {/* ---------- Profile Modal ---------- */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75"
          ref={profileModalRef}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">User Profile</h2>
            <p>
              <strong>Name:</strong> {user?.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {user?.email || "N/A"}
            </p>
            <p>
              <strong>Roles:</strong> {userRoles?.join(", ") || "N/A"}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={toggleProfileModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
