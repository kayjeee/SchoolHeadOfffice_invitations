// DesktopHome.js
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import SearchBarDesktop from "./DesktopComponents/SearchBarDesktop";
import DesktopNavigationButtons from "./DesktopNavigationButtons/DesktopNavigationButtons";
import Courses from "./DesktopCarousel/Courses";
import AppPromo from "./DesktopComponents/AppPromo";

const DesktopHome = ({ schools }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const roles = [
    { name: "Teacher", icon: "📚" },
    { name: "Parent", icon: "🏠" },
    { name: "Student", icon: "🎓" },
    { name: "School Leader", icon: "🏫" },
    { name: "District Leader", icon: "📍" },
  ];

  return (
    <>
      {/* HERO SECTION */}
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-6 py-20 overflow-hidden">
    
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold text-gray-900 text-center max-w-4xl"
        >
          Where schools and families connect.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-gray-600 text-lg md:text-xl mt-4 max-w-2xl text-center"
        >
          Empowering teachers, parents, and students to communicate, share
          updates, and grow together.
        </motion.p>

        {/* CTA Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 font-semibold text-lg text-gray-800"
        >
          Get started as a...
        </motion.p>

        {/* Role Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
          {roles.map((role) => (
            <motion.div
              key={role.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl flex flex-col items-center justify-center border border-gray-100 cursor-pointer transition-all"
            >
              <span className="text-4xl mb-3">{role.icon}</span>
              <p className="font-semibold text-gray-800">{role.name}</p>
              <ArrowRight className="w-5 h-5 mt-2 text-gray-400" />
            </motion.div>
          ))}
        </div>

        {/* QR Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex flex-col items-center justify-center bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <p className="font-semibold text-gray-800 mb-2">Get the App</p>
          <img
            src="/qr-code.png"
            alt="QR Code"
            className="w-24 h-24 object-contain"
          />
        </motion.div>
      </div>

      {/* ADDITIONAL COMPONENTS */}
      <DesktopNavigationButtons />
      <Courses />

      {/* Floating Chat Button */}
      <div className="fixed bottom-4 right-4 flex flex-col items-end z-30">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300 text-lg font-bold"
        >
          Chat with us
        </button>
        <AppPromo />
      </div>
    </>
  );
};

export default DesktopHome;
