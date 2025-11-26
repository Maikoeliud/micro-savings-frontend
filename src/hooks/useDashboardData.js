import { useState } from "react";
// import createUseContext from "constate";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import constate from "constate";

const api = axios.create({
  baseURL: "https://micro-savings-backend.vercel.app",
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

export const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch stats";
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
  const [allUsers, setAllUsers] = useState([]);


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

   const fetchAllUsers = async () => {
     try {
       const data = await getAllUsers();
       setAllUsers(data);
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
    allUsers,
    fetchAllUsers,
    // setLoading,
    setError,
    fetchBalance,
    fetchTransactions,
    fetchStats,
    fetchAllTransactions,
  };
};
const [ApiProvider, useApiContextHook] = constate(useDashboardData);

export { ApiProvider, useApiContextHook };
