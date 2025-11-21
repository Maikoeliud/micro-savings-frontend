import React, { useState, useMemo, useEffect } from "react";
import { ApiProvider, useApiContextHook } from "../hooks/useDashboardData";
import Dialog from "./Dialog";
import {
  Users,
  Wallet,
  ArrowLeftRight,
  TrendingDown,
  Filter,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, title, value, color, iconBg }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${iconBg} p-4 rounded-xl`}>
        <Icon size={32} className={color} />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { fetchAllTransactions, fetchStats, totalStats, allTransactions } =
    useApiContextHook();

  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [filterType, setFilterType] = useState("All");
  const [filterUser, setFilterUser] = useState("All");

  const transactions = useMemo(() => {
    if (!allTransactions) return [];

    return allTransactions.map(t => ({
      id: t.id,
      type: t.type,
      status: t.status,
      amount: Number(t.amount),

      // Match your UI’s expected structure
      userName:
        t.type === "Deposit"
          ? t.toUser
          : t.type === "Withdrawal"
          ? t.fromUser
          : null,

      fromUserName: t.fromUser,
      toUserName: t.toUser,

      timestamp: new Date(t.timestamp),
    }));
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const typeMatch = filterType === "All" || t.type === filterType;
      const userMatch =
        filterUser === "All" ||
        t.userId === parseInt(filterUser) ||
        t.fromUserId === parseInt(filterUser) ||
        t.toUserId === parseInt(filterUser);
      return typeMatch && userMatch;
    });
  }, [transactions, filterType, filterUser]);

  const users = useMemo(() => {
    if (!allTransactions) return [];

    const balances = {};

    allTransactions.forEach(t => {
      const amount = Number(t.amount);

      switch (t.type) {
        case "Deposit":
          if (t.toUser) {
            balances[t.toUser] = (balances[t.toUser] || 0) + amount;
          }
          break;

        case "Withdrawal":
          if (t.fromUser) {
            balances[t.fromUser] = (balances[t.fromUser] || 0) - amount;
          }
          break;

        case "Transfer":
          if (t.fromUser) {
            balances[t.fromUser] = (balances[t.fromUser] || 0) - amount;
          }
          if (t.toUser) {
            balances[t.toUser] = (balances[t.toUser] || 0) + amount;
          }
          break;
      }
    });

    // Convert to array of user objects
    return Object.entries(balances).map(([name, balance], index) => ({
      id: index + 1,
      name,
      balance,
    }));
  }, [allTransactions]);

  const chartData = useMemo(() => {
    const typeData = [
      {
        name: "Deposits",
        value: transactions.filter(t => t.type === "Deposit").length,
        color: "#10b981",
      },
      {
        name: "Transfers",
        value: transactions.filter(t => t.type === "Transfer").length,
        color: "#3b82f6",
      },
      {
        name: "Withdrawals",
        value: transactions.filter(t => t.type === "Withdrawal").length,
        color: "#f59e0b",
      },
    ];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: date,
      };
    });

    const activityData = last7Days.map(day => ({
      date: day.date,
      transactions: transactions.filter(t => {
        const tDate = new Date(t.timestamp);
        return tDate.toDateString() === day.fullDate.toDateString();
      }).length,
    }));

    const userBalanceData = users.map(u => ({
      name: u.name.split(" ")[0],
      balance: u.balance,
    }));

    return { typeData, activityData, userBalanceData };
  }, [transactions, users]);

  useEffect(() => {
    fetchStats();
    fetchAllTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Activity size={32} className="text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Monitor and manage all wallet transactions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={Users}
            title="Total Users"
            value={totalStats?.totalUsers ?? 0}
            color="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            icon={Wallet}
            title="Total in Wallets"
            value={`$${totalStats?.totalValueInWallets?.toLocaleString()}`}
            color="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            icon={ArrowLeftRight}
            title="Total Transfers"
            value={totalStats?.totalTransfers || 0}
            color="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <StatCard
            icon={TrendingDown}
            title="Total Withdrawals"
            value={totalStats?.totalWithdrawals || 0}
            color="text-orange-600"
            iconBg="bg-orange-50"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Activity Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-indigo-600 rounded"></div>
              Transaction Activity (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="transactions"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction Types Pie */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-green-600 rounded"></div>
              Transaction Types
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Balances Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded"></div>
            User Balance Distribution
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.userBalanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={value => `$${value.toLocaleString()}`}
              />
              <Bar dataKey="balance" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <div className="w-1 h-6 bg-orange-600 rounded"></div>
              All Transactions
            </h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-600" />
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="p-2 border-2 border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Deposit">Deposits</option>
                  <option value="Transfer">Transfers</option>
                  <option value="Withdrawal">Withdrawals</option>
                </select>
              </div>
              <select
                value={filterUser}
                onChange={e => setFilterUser(e.target.value)}
                className="p-2 border-2 border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    User(s)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((t, idx) => (
                    <tr
                      key={t.id}
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        #{t.id}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            t.type === "Deposit"
                              ? "bg-green-100 text-green-800"
                              : t.type === "Transfer"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        ${t.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {t.type === "Transfer" ? (
                          <span>
                            <span className="font-medium">
                              {t.fromUserName}
                            </span>{" "}
                            →{" "}
                            <span className="font-medium">{t.toUserName}</span>
                          </span>
                        ) : (
                          <span className="font-medium">{t.userName}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {t.timestamp.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <span className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">{page * rowsPerPage + 1}</span> to{" "}
              <span className="font-semibold">
                {Math.min(
                  (page + 1) * rowsPerPage,
                  filteredTransactions.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold">
                {filteredTransactions.length}
              </span>{" "}
              transactions
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={
                  (page + 1) * rowsPerPage >= filteredTransactions.length
                }
                className="px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-purple-600 rounded"></div>
            Recent Activity Feed
          </h2>
          <div className="space-y-3">
            {transactions.slice(0, 10).map(t => (
              <div
                key={t.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.type === "Deposit"
                        ? "bg-green-100"
                        : t.type === "Transfer"
                        ? "bg-blue-100"
                        : "bg-orange-100"
                    }`}
                  >
                    {t.type === "Deposit"
                      ? "💰"
                      : t.type === "Transfer"
                      ? "↔️"
                      : "🏧"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {t.type === "Deposit" &&
                        `${t.userName} deposited $${t.amount.toFixed(2)}`}
                      {t.type === "Transfer" &&
                        `${t.fromUserName} transferred $${t.amount.toFixed(
                          2
                        )} to ${t.toUserName}`}
                      {t.type === "Withdrawal" &&
                        `${t.userName} withdrew $${t.amount.toFixed(2)}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    t.type === "Deposit"
                      ? "bg-green-100 text-green-800"
                      : t.type === "Transfer"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {t.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
