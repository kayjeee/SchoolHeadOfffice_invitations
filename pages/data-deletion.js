export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          User Data Deletion Request
        </h1>

        <p className="text-gray-700 mb-6">
          Last updated: <strong>November 2025</strong>
        </p>

        <p className="text-gray-700 mb-4">
          At <strong>SchoolHeadOffice.co.za</strong>, we respect your privacy and your right
          to control your personal data. You can request the deletion of your data and
          account information at any time.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-3">
          🔒 How to Request Data Deletion
        </h2>
        <p className="text-gray-700 mb-4">
          To delete your personal data, please send an email to:
        </p>
        <p className="text-blue-600 font-medium mb-4">
          <a href="mailto:support@schoolheadoffice.co.za" className="underline">
            support@schoolheadoffice.co.za
          </a>
        </p>

        <p className="text-gray-700 mb-4">
          Use the subject line <strong>"Data Deletion Request"</strong> and include
          the email address associated with your account.
        </p>

        <p className="text-gray-700 mb-6">
          Once verified, we will permanently delete your personal information
          and confirm the completion of your request within <strong>7 business days</strong>.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-3">
          ⚙️ Automatic Data Deletion
        </h2>
        <p className="text-gray-700 mb-6">
          If you delete your account directly from within the SchoolHeadOffice app, all
          associated data — including your messages, contacts, and school-related
          information — will be automatically and permanently removed from our servers.
        </p>

        <p className="text-gray-700">
          For further assistance, please contact us at{" "}
          <a
            href="mailto:support@schoolheadoffice.co.za"
            className="text-blue-600 underline"
          >
            support@schoolheadoffice.co.za
          </a>.
        </p>
      </div>
    </div>
  );
}
