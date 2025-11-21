import React, { useEffect, useMemo, useState } from "react";
// import Dialog from "./Dialog";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Plus,
  X,
} from "lucide-react";
import {
  createUser,
  deposit,
  transfer,
  useApiContextHook,
  withdraw,
} from "../hooks/useDashboardData";
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
  const { fetchAllTransactions, fetchStats, fetchAllUsers, allTransactions, allUsers } =
    useApiContextHook();

  // const users = useMemo(() => {
  //   if (!allTransactions) return [];

  //   const balances = {};

  //   allTransactions.forEach(t => {
  //     const amount = Number(t.amount);

  //     switch (t.type) {
  //       case "Deposit":
  //         if (t.toUser) balances[t.toUser] = (balances[t.toUser] || 0) + amount;
  //         break;

  //       case "Withdrawal":
  //         if (t.fromUser)
  //           balances[t.fromUser] = (balances[t.fromUser] || 0) - amount;
  //         break;

  //       case "Transfer":
  //         if (t.fromUser)
  //           balances[t.fromUser] = (balances[t.fromUser] || 0) - amount;
  //         if (t.toUser) balances[t.toUser] = (balances[t.toUser] || 0) + amount;
  //         break;
  //     }
  //   });

  //   return Object.entries(balances).map(([name, balance], index) => ({
  //     id: index + 1,
  //     name,
  //     balance,
  //   }));
  // }, [allTransactions]);

  

  const users = useMemo(() => {
    if (!allUsers || !allTransactions) return [];

    // Step 1: Compute balances from transactions
    const balances = {};

    allTransactions.forEach(t => {
      const amount = Number(t.amount);

      switch (t.type) {
        case "Deposit":
          if (t.toUser) balances[t.toUser] = (balances[t.toUser] || 0) + amount;
          break;

        case "Withdrawal":
          if (t.fromUser)
            balances[t.fromUser] = (balances[t.fromUser] || 0) - amount;
          break;

        case "Transfer":
          if (t.fromUser)
            balances[t.fromUser] = (balances[t.fromUser] || 0) - amount;
          if (t.toUser) balances[t.toUser] = (balances[t.toUser] || 0) + amount;
          break;
      }
    });

    // Step 2: Merge backend users + computed balances
    return allUsers.map(u => ({
      id: u.id, // REAL backend user ID
      name: u.name,
      email: u.email,
      balance: Number(balances[u.name] || 0), // computed balance
      accountId: u.Account?.id,
    }));
  }, [allUsers, allTransactions]);

  const [selectedUser, setSelectedUser] = useState();

  const transaction = useMemo(() => {
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
  const [transactions, setTransactions] = useState(transaction);

  const [openDialog, setOpenDialog] = useState(null);
  const [amount, setAmount] = useState("");
  const [toUser, setToUser] = useState("");

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  const [notification, setNotification] = useState(null);

  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDepositUI = async () => {
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) return;

    try {
      await deposit(selectedUser, depositAmount);

      // Refresh global transaction list
      await fetchAllTransactions();

      setAmount("");
      setOpenDialog(null);
      showNotification(`✅ Deposited $${depositAmount} successfully!`);
    } catch (err) {
      showNotification(`❌ ${err}`, "error");
    }
  };

  const handleTransferUI = async () => {
    const transferAmount = parseFloat(amount);
    if (!transferAmount || transferAmount <= 0) return;

    const sender = users.find(u => u.id === selectedUser);
    const receiver = users.find(u => u.id === toUser);

    if (!receiver)
      return showNotification("❌ Select a valid recipient", "error");
    if (selectedUser === toUser)
      return showNotification("❌ Cannot transfer to yourself", "error");
    if (sender.balance < transferAmount)
      return showNotification("❌ Insufficient balance", "error");

    try {
      await transfer(selectedUser, toUser, transferAmount);

      await fetchAllTransactions();

      setAmount("");
      setToUser("");
      setOpenDialog(null);
      showNotification(`💸 Sent $${transferAmount} to ${receiver.name}`);
    } catch (err) {
      showNotification(`❌ ${err}`, "error");
    }
  };

  const handleWithdrawalUI = async () => {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) return;

    const user = users.find(u => u.id === selectedUser);

    if (user.balance < withdrawAmount) {
      return showNotification("❌ Insufficient balance", "error");
    }

    try {
      await withdraw(selectedUser, withdrawAmount);

      await fetchAllTransactions();

      setAmount("");
      setOpenDialog(null);
      showNotification(`🏧 Withdrew $${withdrawAmount} successfully!`);
    } catch (err) {
      showNotification(`❌ ${err}`, "error");
    }
  };

  const handleCreateUserUI = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      return showNotification("❌ Name and Email are required", "error");
    }

    try {
      await createUser({
        name: newUserName,
        email: newUserEmail,
      });

      await fetchAllTransactions();
      await fetchStats();

      setNewUserName("");
      setNewUserEmail("");
      setOpenDialog(null);

      showNotification(`👤 User ${newUserName} created successfully!`);
    } catch (err) {
      showNotification(`❌ ${err}`, "error");
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchAllTransactions();
  }, []);

  // useEffect(() => {
  //   if (users.length > 0 && !selectedUser) {
  //     setSelectedUser(users[0].id);
  //   }
  // }, [users]);

  const currentUser = users.find(u => u.id === selectedUser);
console.log({users, selectedUser, currentUser});
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Wallet size={32} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">User Dasboard</h1>
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
              // onChange={e => setSelectedUser(parseInt(e.target.value))}
              onChange={e => setSelectedUser(e.target.value)}
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
            onClick={handleDepositUI}
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
          onChange={e => setToUser(e.target.value)}
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
            onClick={handleTransferUI}
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
            onClick={handleWithdrawalUI}
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
          placeholder="Name"
          value={newUserName}
          onChange={e => setNewUserName(e.target.value)}
          className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUserEmail}
          onChange={e => setNewUserEmail(e.target.value)}
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
            onClick={handleCreateUserUI}
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
