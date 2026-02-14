import React from "react";

interface Notification {
  id: number;
  message: string;
  date: string;
}

interface NotificationListProps {
  notifications: Notification[];
}

export default function NotificationList({ notifications }: NotificationListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
        <h3 className="font-semibold text-gray-900">Recent Notifications</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-800">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 text-sm">
            No new notifications
          </div>
        )}
      </div>
    </div>
  );
}
