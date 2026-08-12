import { useState, useCallback } from "react";
import { Alert } from "react-native";



const API_URL = "https://rn-wallet-api-mlpc.onrender.com/api"//"http://localhost:5001/api"; // Replace with your actual API URL

export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState();

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  const [error, setError] = useState(null);

  const [loading, setIsLoading] = useState(true);


// Function to fetch transactions for a specific user
  const fetchTransactions = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${userId}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error);
    }
  }, [userId]);


  // Fetch summary data for the user
const fetchSummary = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API_URL}/transactions/summary/${userId}`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setError(error);
    }
  }, [userId]);


// Function to load both transactions and summary data
  const loadData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {   
    await Promise.all([fetchTransactions(userId), fetchSummary(userId)]);
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchTransactions, fetchSummary]);


// Function to delete a transaction
  const deleteTransaction = async (transactionId) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

     loadData(); // Refresh the transactions and summary after deletion
     Alert.alert("Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setError(error);
      Alert.alert("Error deleting transaction", error.message);
    }
  };

  return {
    transactions,
    summary,
    error,
    loading,
    loadData,
    deleteTransaction,
  };

};
