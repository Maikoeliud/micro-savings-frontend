// src/App.jsx
import React, { useState } from "react";
import { Wallet } from "lucide-react";
import UserInterface from "./components/UserInterface";
import AdminDashboard from "./components/AdminDashboard";
import { ApiProvider } from "./hooks/useDashboardData";

function App() {
  const [currentRoute, setCurrentRoute] = useState("user");

  return (
    <ApiProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <div className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* <div className="flex items-center gap-3">
            <Wallet size={32} />
            <h1 className="text-2xl font-bold">Wallet Management System</h1>
          </div> */}
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-4 border-b border-blue-500">
              <button
                onClick={() => setCurrentRoute("user")}
                className={`px-6 py-3 font-medium transition-colors ${
                  currentRoute === "user"
                    ? "border-b-2 border-white"
                    : "opacity-75 hover:opacity-100"
                }`}
              >
                User Dashboard
              </button>
              <button
                onClick={() => setCurrentRoute("admin")}
                className={`px-6 py-3 font-medium transition-colors ${
                  currentRoute === "admin"
                    ? "border-b-2 border-white"
                    : "opacity-75 hover:opacity-100"
                }`}
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Route Content */}
        {currentRoute === "user" ? <UserInterface /> : <AdminDashboard />}
      </div>
    </ApiProvider>
  );
}

export default App;
