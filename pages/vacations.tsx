import React from 'react';
import { motion } from 'framer-motion';
import { Palmtree, Umbrella, MapPin, Phone, Mail, Award, CheckCircle } from 'lucide-react';
import FrontPageLayout from '../components/Layouts/FrontPageLayout';

const VacationsPage = () => {
  const [couponClaimed, setCouponClaimed] = React.useState(false);

  return (
    <FrontPageLayout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
              alt="Tropical Beach"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-extrabold text-white mb-4"
            >
              Exclusive Teacher Vacations
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-medium"
            >
              Partnered with Ubuntu Education
            </motion.p>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              You work hard. You deserve a break.
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We've teamed up with Daniella to bring you stress-free vacation planning
              exclusively for the Ubuntu Education community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
              <div className="bg-blue-500 p-4 rounded-full text-white mb-6">
                <Palmtree className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Curated Destinations</h3>
              <p className="text-gray-600">Hand-picked locations that offer the perfect balance of relaxation and adventure.</p>
            </div>

            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
              <div className="bg-blue-500 p-4 rounded-full text-white mb-6">
                <Umbrella className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Stress-Free Planning</h3>
              <p className="text-gray-600">Daniella handles everything from bookings to itinerary, so you don't have to lift a finger.</p>
            </div>

            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
              <div className="bg-blue-500 p-4 rounded-full text-white mb-6">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Exclusive Offers</h3>
              <p className="text-gray-600">Special rates and perks specifically negotiated for teachers on Ubuntu Education.</p>
            </div>
          </div>
        </section>

        {/* The Hook / Coupon Section */}
        <section className="bg-gray-900 py-20 px-4 overflow-hidden">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-16 text-center relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-32 translate-y-32" />
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Special Launch Offer!
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Be one of the first <span className="font-bold text-white underline">50 teachers</span> to book through this platform and receive an exclusive discount on your vacation package.
            </p>

            {!couponClaimed ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCouponClaimed(true)}
                className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-xl shadow-xl hover:bg-blue-50 transition-colors"
              >
                Claim My Coupon
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl inline-block"
              >
                <p className="text-blue-100 mb-2 font-medium">Your Coupon Code:</p>
                <div className="text-4xl md:text-5xl font-mono font-bold text-white tracking-widest mb-4">
                  UBUNTU50
                </div>
                <p className="text-blue-200 text-sm">
                  Mention this code when contacting Daniella to secure your discount.
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Contact Daniella */}
       {/* Contact Daniella */}
<section className="py-20 px-4 max-w-5xl mx-auto text-center">
  <h2 className="text-3xl font-bold mb-8">Ready to start planning?</h2>
  <p className="text-lg text-gray-600 mb-12">
    Contact Daniella directly and mention your Ubuntu Education coupon code.
  </p>

  <div className="flex flex-col md:flex-row items-center justify-center gap-8">
    
    {/* WhatsApp */}
    <a
      href="https://wa.me/27790676551"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 text-xl font-semibold text-gray-800 hover:text-blue-600 transition"
    >
      <Phone className="text-blue-500 w-6 h-6" />
      <span>WhatsApp: +27 79 067 6551</span>
    </a>

    <div className="hidden md:block w-px h-8 bg-gray-200" />

    {/* Email */}
    <a
      href="mailto:daniella@dsquaredgs.com"
      className="flex items-center gap-3 text-xl font-semibold text-gray-800 hover:text-blue-600 transition"
    >
      <Mail className="text-blue-500 w-6 h-6" />
      <span>daniella@dsquaredgs.com</span>
    </a>
  </div>

  <div className="mt-16 p-6 bg-gray-50 rounded-xl border border-gray-100 max-w-2xl mx-auto">
    <div className="flex items-start gap-4 text-left">
      <CheckCircle className="text-green-500 w-6 h-6 mt-1 flex-shrink-0" />
      <p className="text-gray-600">
        "Ubuntu Education partnered with SchoolHeadOffice to help teachers book vacations.
        We offer exclusive discounts to teachers who are part of our community."
      </p>
    </div>
  </div>
</section>

      </div>
    </FrontPageLayout>
  );
};

export default VacationsPage;
