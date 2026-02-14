import React from "react";

export default function MessagesTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Parent-Teacher Messaging</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
          New Message
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {[
              { name: "Mr. Smith", subject: "Mathematics", lastMsg: "Regarding the upcoming test...", time: "10:30 AM", unread: true },
              { name: "Ms. Johnson", subject: "English", lastMsg: "The essay was excellent.", time: "Yesterday", unread: false },
              { name: "School Admin", subject: "General", lastMsg: "Reminder: School fees due.", time: "Oct 24", unread: false },
            ].map((chat, i) => (
              <div key={i} className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${chat.unread ? 'bg-blue-50/30' : ''}`}>
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 text-sm">{chat.name}</h4>
                  <span className="text-[10px] text-gray-500">{chat.time}</span>
                </div>
                <p className="text-xs text-blue-600 font-medium">{chat.subject}</p>
                <p className="text-xs text-gray-500 truncate mt-1">{chat.lastMsg}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-gray-400">
           <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a.5.5 0 01-1 0V5a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h3a.5.5 0 010 1H4a2 2 0 01-2-2V5z" />
                <path d="M15 7a2 2 0 012 2v4.5a.5.5 0 01-1 0V9a1 1 0 00-1-1h-3a.5.5 0 010-1h3z" />
                <path fillRule="evenodd" d="M10 13a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <p>Select a conversation to start messaging</p>
           </div>
        </div>
      </div>
    </div>
  );
}
