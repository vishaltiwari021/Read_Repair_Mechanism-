import React from "react";

const WorkspaceSection = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Workspace Dashboard
        </h1>
        <p className="text-gray-500">
          Manage your repair activities and progress
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white shadow-md rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-gray-700">
            Total Repairs
          </h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">24</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow-md rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-gray-700">
            Pending Repairs
          </h2>
          <p className="text-3xl font-bold text-yellow-500 mt-2">8</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white shadow-md rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-gray-700">
            Completed Repairs
          </h2>
          <p className="text-3xl font-bold text-green-600 mt-2">16</p>
        </div>
      </div>

      {/* Activity Section */}
      <div className="mt-8 bg-white shadow-md rounded-2xl p-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>

        <ul className="space-y-3">
          <li className="p-3 bg-gray-50 rounded-lg">
            Device A repaired successfully
          </li>
          <li className="p-3 bg-gray-50 rounded-lg">
            Device B repair in progress
          </li>
          <li className="p-3 bg-gray-50 rounded-lg">
            New repair request added
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WorkspaceSection;