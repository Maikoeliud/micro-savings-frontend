import React, { useState } from "react";
// import Dialog from "./Dialog";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Plus,
  X,
} from "lucide-react";
  const Dialog = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };
const UserInterface = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "Alice Johnson", balance: 5000 },
    { id: 2, name: "Bob Smith", balance: 3200 },
    { id: 3, name: "Carol Davis", balance: 7500 },
  ]);
  const [selectedUser, setSelectedUser] = useState(1);
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: "Deposit",
      status: "Completed",
      amount: 1000,
      userId: 1,
      userName: "Alice Johnson",
      timestamp: new Date("2024-11-20T10:30:00"),
    },
    {
      id: 2,
      type: "Transfer",
      status: "Completed",
      amount: 500,
      fromUserId: 2,
      fromUserName: "Bob Smith",
      toUserId: 1,
      toUserName: "Alice Johnson",
      timestamp: new Date("2024-11-20T11:15:00"),
    },
    {
      id: 3,
      type: "Withdrawal",
      status: "Completed",
      amount: 300,
      userId: 3,
      userName: "Carol Davis",
      timestamp: new Date("2024-11-20T12:00:00"),
    },
  ]);

  const [openDialog, setOpenDialog] = useState(null);
  const [amount, setAmount] = useState("");
  const [toUser, setToUser] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (depositAmount > 0) {
      const user = users.find(u => u.id === selectedUser);
      setUsers(
        users.map(u =>
          u.id === selectedUser
            ? { ...u, balance: u.balance + depositAmount }
            : u
        )
      );

      const newTransaction = {
        id: transactions.length + 1,
        type: "Deposit",
        status: "Completed",
        amount: depositAmount,
        userId: selectedUser,
        userName: user.name,
        timestamp: new Date(),
      };
      setTransactions([newTransaction, ...transactions]);

      setAmount("");
      setOpenDialog(null);
      showNotification(
        `✅ Deposited $${depositAmount.toFixed(2)} successfully!`
      );
    }
  };

  const handleTransfer = () => {
    const transferAmount = parseFloat(amount);
    const fromUser = users.find(u => u.id === selectedUser);
    const toUserObj = users.find(u => u.id === toUser);

    if (
      transferAmount > 0 &&
      fromUser.balance >= transferAmount &&
      toUser !== selectedUser
    ) {
      setUsers(
        users.map(u => {
          if (u.id === selectedUser)
            return { ...u, balance: u.balance - transferAmount };
          if (u.id === toUser)
            return { ...u, balance: u.balance + transferAmount };
          return u;
        })
      );

      const newTransaction = {
        id: transactions.length + 1,
        type: "Transfer",
        status: "Completed",
        amount: transferAmount,
        fromUserId: selectedUser,
        fromUserName: fromUser.name,
        toUserId: toUser,
        toUserName: toUserObj.name,
        timestamp: new Date(),
      };
      setTransactions([newTransaction, ...transactions]);

      setAmount("");
      setToUser("");
      setOpenDialog(null);
      showNotification(
        `✅ Transferred $${transferAmount.toFixed(2)} to ${toUserObj.name}!`
      );
    } else if (fromUser.balance < transferAmount) {
      showNotification("❌ Insufficient balance!", "error");
    }
  };

  const handleWithdrawal = () => {
    const withdrawAmount = parseFloat(amount);
    const user = users.find(u => u.id === selectedUser);

    if (withdrawAmount > 0 && user.balance >= withdrawAmount) {
      setUsers(
        users.map(u =>
          u.id === selectedUser
            ? { ...u, balance: u.balance - withdrawAmount }
            : u
        )
      );

      const newTransaction = {
        id: transactions.length + 1,
        type: "Withdrawal",
        status: "Completed",
        amount: withdrawAmount,
        userId: selectedUser,
        userName: user.name,
        timestamp: new Date(),
      };
      setTransactions([newTransaction, ...transactions]);

      setAmount("");
      setOpenDialog(null);
      showNotification(
        `✅ Withdrew $${withdrawAmount.toFixed(2)} successfully!`
      );
    } else if (user.balance < withdrawAmount) {
      showNotification("❌ Insufficient balance!", "error");
    }
  };

  const handleCreateUser = () => {
    if (newUserName.trim()) {
      const newUser = {
        id: users.length + 1,
        name: newUserName,
        balance: 0,
      };
      setUsers([...users, newUser]);
      setNewUserName("");
      setOpenDialog(null);
      showNotification(`✅ User ${newUserName} created successfully!`);
    }
  };

  const currentUser = users.find(u => u.id === selectedUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Wallet size={32} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            User Dasboard
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Notification */}
        {notification && (
          <div
            className={`mb-4 p-4 rounded-lg shadow-lg animate-pulse ${
              notification.type === "success"
                ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                : "bg-red-100 text-red-800 border-l-4 border-red-500"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Wallet Management
            </h2>
            <button
              onClick={() => setOpenDialog("createUser")}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md transition-all"
            >
              <Plus size={20} /> Create User
            </button>
          </div>

          {/* User Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Active User
            </label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(parseInt(e.target.value))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} - ${user.balance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-xl p-8 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90 font-medium">Current Balance</p>
              <Wallet size={28} className="opacity-80" />
            </div>
            <p className="text-5xl font-bold mb-3">
              ${currentUser?.balance.toFixed(2)}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-sm opacity-90">{currentUser?.name}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setOpenDialog("deposit")}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl hover:from-green-600 hover:to-green-700 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <TrendingUp
                size={24}
                className="group-hover:scale-110 transition-transform"
              />
              Deposit Funds
            </button>
            <button
              onClick={() => setOpenDialog("transfer")}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl hover:from-blue-600 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <ArrowLeftRight
                size={24}
                className="group-hover:scale-110 transition-transform"
              />
              Transfer Money
            </button>
            <button
              onClick={() => setOpenDialog("withdraw")}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 rounded-xl hover:from-orange-600 hover:to-orange-700 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <TrendingDown
                size={24}
                className="group-hover:scale-110 transition-transform"
              />
              Withdraw Cash
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded"></div>
            Recent Transaction History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .filter(
                    t =>
                      t.userId === selectedUser ||
                      t.fromUserId === selectedUser ||
                      t.toUserId === selectedUser
                  )
                  .slice(0, 8)
                  .map((t, idx) => (
                    <tr
                      key={t.id}
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {t.timestamp.toLocaleDateString()}{" "}
                        {t.timestamp.toLocaleTimeString()}
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
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        ${t.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {t.type === "Transfer"
                          ? `${t.fromUserName} → ${t.toUserName}`
                          : t.userName}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog
        isOpen={openDialog === "deposit"}
        onClose={() => setOpenDialog(null)}
        title="💰 Make a Deposit"
      >
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-green-500 focus:outline-none"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setOpenDialog(null)}
            className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeposit}
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            Deposit
          </button>
        </div>
      </Dialog>

      <Dialog
        isOpen={openDialog === "transfer"}
        onClose={() => setOpenDialog(null)}
        title="💸 Make a Transfer"
      >
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={toUser}
          onChange={e => setToUser(parseInt(e.target.value))}
          className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select recipient</option>
          {users
            .filter(u => u.id !== selectedUser)
            .map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
        </select>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setOpenDialog(null)}
            className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Transfer
          </button>
        </div>
      </Dialog>

      <Dialog
        isOpen={openDialog === "withdraw"}
        onClose={() => setOpenDialog(null)}
        title="🏧 Make a Withdrawal"
      >
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-orange-500 focus:outline-none"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setOpenDialog(null)}
            className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdrawal}
            className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md"
          >
            Withdraw
          </button>
        </div>
      </Dialog>

      <Dialog
        isOpen={openDialog === "createUser"}
        onClose={() => setOpenDialog(null)}
        title="👤 Create New User"
      >
        <input
          type="text"
          placeholder="Enter user name"
          value={newUserName}
          onChange={e => setNewUserName(e.target.value)}
          className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setOpenDialog(null)}
            className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateUser}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Create User
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default UserInterface;
