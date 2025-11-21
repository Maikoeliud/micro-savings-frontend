import { useState } from "react";
// import createUseContext from "constate";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import constate from "constate";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

export const createUser = async data => {
  try {
    const response = await api.post("/users", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to create user";
  }
};

export const deposit = async (userId, amount) => {
  try {
    const response = await api.post("/transactions/deposit", {
      user_id: userId,
      amount,
      transaction_id: uuidv4(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Deposit failed";
  }
};

export const transfer = async (fromUserId, toUserId, amount) => {
  try {
    const response = await api.post("/transactions/transfer", {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount,
      transaction_id: uuidv4(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Transfer failed";
  }
};

export const withdraw = async (userId, amount) => {
  try {
    const response = await api.post("/transactions/withdraw", {
      user_id: userId,
      amount,
      transaction_id: uuidv4(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Withdrawal failed";
  }
};

export const getBalance = async userId => {
  try {
    const response = await api.get(`/users/balance/${userId}`);
    return response.data.balance;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch balance";
  }
};

export const getTransactions = async userId => {
  try {
    const response = await api.get(`/users/transactions/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch transactions";
  }
};

// Admin endpoints (from earlier addition)
export const getSystemStats = async () => {
  try {
    const response = await api.get("/users/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch stats";
  }
};

export const getAllTransactions = async () => {
  try {
    const response = await api.get("/users/all-transactions");
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch all transactions";
  }
};

const useDashboardData = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [balance, setBalance] = useState("0.00");
  const [transactions, setTransactions] = useState([]);
  const [totalStats, setTotalStats] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateUser = async data => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await createUser(data);
      setSelectedUserId(user.id);
      await fetchBalance(user.id);
      return user;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (userId, amount) => {
    setLoading(true);
    setError(null);
    try {
      await deposit(userId, amount);
      await fetchBalance(userId);
      await fetchTransactions(userId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (fromUserId, toUserId, amount) => {
    setLoading(true);
    setError(null);
    try {
      await transfer(fromUserId, toUserId, amount);
      await fetchBalance(fromUserId);
      await fetchTransactions(fromUserId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (userId, amount) => {
    setLoading(true);
    setError(null);
    try {
      await withdraw(userId, amount);
      await fetchBalance(userId);
      await fetchTransactions(userId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async userId => {
    try {
      const bal = await getBalance(userId);
      setBalance(bal);
    } catch (err) {
      setError(err);
    }
  };

  const fetchTransactions = async userId => {
    try {
      const txs = await getTransactions(userId);
      setTransactions(txs);
    } catch (err) {
      setError(err);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getSystemStats();
      setTotalStats(data);
    } catch (err) {
      setError(err);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      const txs = await getAllTransactions();
      setAllTransactions(txs);
    } catch (err) {
      setError(err);
    }
  };

  return {
    selectedUserId,
    setSelectedUserId,
    balance,
    transactions,
    totalStats,
    allTransactions,
    loading,
    error,
    setError,
    handleCreateUser,
    handleDeposit,
    handleTransfer,
    handleWithdraw,
    fetchBalance,
    fetchTransactions,
    fetchStats,
    fetchAllTransactions,
  };
};
const [ApiProvider, useApiContextHook] = constate(useDashboardData);

export { ApiProvider, useApiContextHook };
