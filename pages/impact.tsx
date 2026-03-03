import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  ShieldCheck,
  MessageSquare,
  Users,
  School,
  TrendingUp,
  CheckCircle2,
  Quote
} from 'lucide-react';
import FrontPageLayout from '../components/Layouts/FrontPageLayout';

const ImpactPage = () => {
  const metrics = [
    { label: "Schools onboarded", value: "4", icon: <School className="w-6 h-6" /> },
    { label: "Teachers using platform", value: "38", icon: <Users className="w-6 h-6" /> },
    { label: "Parent contacts connected", value: "2,450", icon: <MessageSquare className="w-6 h-6" /> },
    { label: "Messages sent", value: "18,230", icon: <TrendingUp className="w-6 h-6" /> },
  ];

  const secondaryMetrics = [
    { label: "Delivery rate", value: "92%" },
    { label: "Parent response rate", value: "67%" },
    { label: "Avg. response time", value: "3.4 hours" },
  ];

  const testimonials = [
    {
      quote: "Parent responses have increased significantly since using SchoolHeadOffice.",
      author: "Grade 7 Teacher",
      location: "Johannesburg"
    },
    {
      quote: "The ability to track delivery status in real-time has changed how we manage urgent school announcements.",
      author: "School Administrator",
      location: "Gauteng"
    }
  ];

  return (
    <FrontPageLayout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-slate-900 py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-extrabold text-white mb-6"
            >
              Our Impact & Evidence
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-300 max-w-3xl mx-auto"
            >
              Documenting how SchoolHeadOffice strengthens the connection between schools and families through data-driven communication.
            </motion.p>
          </div>
        </section>

        {/* Executive Summary & Theory of Change */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-100"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-blue-600 w-6 h-6" />
                Executive Summary
              </h2>
              <p className="text-slate-600 leading-relaxed">
                SchoolHeadOffice is dedicated to bridging the communication gap in the South African education ecosystem.
                Our platform provides a secure, efficient, and measurable way for schools to engage with parents,
                ensuring that vital information reaches home and supports learner success. This report outlines our
                current impact metrics and the evidence supporting our methodology.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-200"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Theory of Change
              </h2>
              <p className="text-blue-50 leading-relaxed">
                Improved parent communication increases accountability, strengthens home-school alignment,
                and supports learner performance through timely intervention. By reducing friction in communication,
                we empower educators to focus on teaching while parents remain informed and engaged partners
                in their child's education.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Impact Metrics (Aggregated) */}
        <section className="py-20 bg-slate-50 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Aggregated Impact Metrics</h2>
              <p className="text-slate-600">Real-time performance data from our active pilot programs.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {metrics.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center"
                >
                  <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                    {m.icon}
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{m.value}</div>
                  <div className="text-sm text-slate-500 font-medium">{m.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {secondaryMetrics.map((m, i) => (
                <div key={i} className="bg-white px-6 py-4 rounded-xl flex justify-between items-center border border-slate-100">
                  <span className="text-slate-600 font-medium">{m.label}</span>
                  <span className="text-xl font-bold text-blue-600">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Evidence Types */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Verification & Evidence</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-green-100 p-2 rounded-lg h-fit">
                    <CheckCircle2 className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Meta Platforms Verification</h3>
                    <p className="text-slate-600 text-sm">Messaging volume and delivery confirmations are verified via Meta platform receipts.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-green-100 p-2 rounded-lg h-fit">
                    <CheckCircle2 className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Internal Pilot Data</h3>
                    <p className="text-slate-600 text-sm">Direct platform usage statistics and automated delivery reports.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-green-100 p-2 rounded-lg h-fit">
                    <CheckCircle2 className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Teacher Testimonials</h3>
                    <p className="text-slate-600 text-sm">Qualitative feedback from educators on the front lines of school communication.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-slate-400 font-mono text-sm relative">
              <div className="absolute top-4 right-6 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
              <p className="mb-4 text-slate-500 border-b border-slate-800 pb-2">// Messaging Volume Verification</p>
              <p><span className="text-blue-400">Platform:</span> Meta WhatsApp Business API</p>
              <p><span className="text-blue-400">Total Sent:</span> 18,230</p>
              <p><span className="text-blue-400">Confirmed Delivered:</span> 16,771</p>
              <p><span className="text-blue-400">Billing Statement:</span> VERIFIED</p>
              <p className="mt-4 text-slate-600 italic">// Sensitive data (Account IDs, Phone Numbers) redacted for POPIA compliance</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-blue-50 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Teacher Testimonials</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-2xl shadow-sm relative"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-100" />
                  <p className="text-lg text-slate-700 mb-6 italic">"{t.quote}"</p>
                  <div>
                    <div className="font-bold text-slate-900">{t.author}</div>
                    <div className="text-sm text-slate-500">{t.location}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* POPIA Compliance */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-12 text-center">
            <div className="bg-white w-16 h-16 rounded-full shadow-md flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Protection Statement</h2>
            <p className="text-slate-600 mb-6">
              In compliance with the <strong>Protection of Personal Information Act (POPIA)</strong>, all metrics displayed
              on this page are aggregated and anonymized. We do not publicly disclose personal parent phone numbers,
              emails, student names, or any other personal identifiers.
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              POPIA Compliant Verification
            </div>
          </div>
        </section>
      </div>
    </FrontPageLayout>
  );
};

export default ImpactPage;
