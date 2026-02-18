import React from 'react';
import { motion } from 'framer-motion';
import { School, Users, BarChart, ShieldCheck } from 'lucide-react';
import FrontPageLayout from '../components/Layouts/FrontPageLayout';

const PrincipalPage = () => {
  return (
    <FrontPageLayout>
      <div className="min-h-screen bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Empowering School Principals
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive management tools designed to help you lead your school with confidence and efficiency.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Staff Management</h3>
              <p className="text-gray-600 text-sm">Efficiently manage your teaching and administrative staff in one place.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Academic Insights</h3>
              <p className="text-gray-600 text-sm">Real-time data and analytics to track school performance and growth.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Secure Operations</h3>
              <p className="text-gray-600 text-sm">Enterprise-grade security for all your school's sensitive data.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">School Culture</h3>
              <p className="text-gray-600 text-sm">Tools to foster a positive and connected school community.</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 bg-blue-600 rounded-3xl p-10 md:p-16 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-6">Join the Principal's Network</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Get early access to our specialized principal dashboard and connect with leaders across the country.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors">
              Request Early Access
            </button>
          </motion.div>
        </div>
      </div>
    </FrontPageLayout>
  );
};

export default PrincipalPage;
