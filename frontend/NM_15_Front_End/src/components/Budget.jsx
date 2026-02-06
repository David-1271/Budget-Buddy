import React, { useState, useEffect, useRef } from 'react';
import { dataAPI } from '../api/apiService';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './Budget.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Budget = () => {
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [savedIncome, setSavedIncome] = useState(0);  // Track the actual saved income
  const [budgets, setBudgets] = useState([]);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      setLoading(true);

      // Get user profile to get income
      const userData = await dataAPI.getProfile();
      const income = userData.profile?.preferences?.monthlyIncome || 0;
      const incomeValue = parseFloat(income) || 0;
      setMonthlyIncome(incomeValue.toString());
      setSavedIncome(incomeValue);  // Set the actual saved income

      // Get budgets
      const budgetsData = await dataAPI.getBudgets();
      setBudgets(budgetsData);
    } catch (err) {
      console.error('Error loading budget data:', err);
      setError('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetIncome = async (e) => {
  e.preventDefault();

  try {
    const incomeValue = parseFloat(monthlyIncome) || 0;

    // Get current profile data
    const userData = await dataAPI.getProfile();
    
    // Send only the profile data that the endpoint expects
    const updatedProfile = {
      preferences: {
        ...userData.profile?.preferences,
        monthlyIncome: incomeValue
      }
    };

    await dataAPI.updateProfile(updatedProfile);
    setSavedIncome(incomeValue); // Update the saved income
    alert('Income updated successfully!');
  } catch (err) {
    console.error('Error updating income:', err);
    setError('Failed to update income');
  }
};

  const handleCreateBudget = async (e) => {
    e.preventDefault();

    if (!newBudget.category || !newBudget.amount) {
      alert('Please enter both category and amount');
      return;
    }

    try {
      const budgetData = {
        category: newBudget.category.trim(),
        amount: parseFloat(newBudget.amount),
        period: 'monthly'
      };

      const createdBudget = await dataAPI.createBudget(budgetData);
      setBudgets([...budgets, createdBudget]);
      setNewBudget({ category: '', amount: '' });

      // Show success confirmation modal
      setConfirmationData({
        status: 'success',
        message: 'Budget created successfully!',
        data: createdBudget
      });
      setShowConfirmation(true);
    } catch (err) {
      console.error('Error creating budget:', err);

      // Show error confirmation modal
      setConfirmationData({
        status: 'error',
        message: err.message || 'Failed to create budget',
        error: err
      });
      setShowConfirmation(true);
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await dataAPI.deleteBudget(id);
      setBudgets(budgets.filter(budget => budget._id !== id));
    } catch (err) {
      console.error('Error deleting budget:', err);
      alert('Failed to delete budget');
    }
  };

  // Calculate summary values
  const totalIncome = savedIncome;  // Use the saved/loaded income value
  const totalBudgets = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const remainingAmount = totalIncome - totalBudgets;

  // Prepare data for the pie chart
  const chartData = {
    labels: budgets.map(budget => budget.category),
    datasets: [
      {
        label: 'Budget Allocation',
        data: budgets.map(budget => budget.amount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
          '#4BC0C0',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(2);
            return `${context.label}: $${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (loading) {
    return <div className="budget-container">Loading...</div>;
  }

  return (
    <div className="budget-container">
      <h1>Budget Planner</h1>

      {/* Summary panel showing total income, total budgets, and remaining */}
      <div className="summary-panel">
        <div className="summary-card">
          <h3>Total Income</h3>
          <p className="summary-value">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Budgets</h3>
          <p className="summary-value">${totalBudgets.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Remaining</h3>
          <p className={`summary-value ${remainingAmount < 0 ? 'negative' : ''}`}>
            ${remainingAmount.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="budget-layout">
        {/* Left Column - 1/3 of screen */}
        <div className="budget-form-section">
          {/* Income Section */}
          <div className="income-section">
            <h2>Set Monthly Income</h2>
            <form onSubmit={handleSetIncome} className="income-form">
              <div className="form-group">
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="Enter monthly income"
                  step="0.01"
                  min="0"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Update Income
              </button>
            </form>
          </div>

          {/* Budget Creation Form */}
          <div className="add-budget-section">
            <h2>Create New Budget</h2>
            <form onSubmit={handleCreateBudget} className="budget-form">
              <div className="form-group">
                <input
                  type="text"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                  placeholder="Category (e.g. Groceries, Rent)"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                  placeholder="Amount"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Budget
              </button>
            </form>
          </div>

          {/* Budget List */}
          <div className="budget-list">
            <h2>Your Budgets</h2>
            {budgets.length === 0 ? (
              <p>No budgets created yet.</p>
            ) : (
              <div className="budget-cards">
                {budgets.map(budget => (
                  <div key={budget._id} className="budget-card">
                    <div className="budget-info">
                      <h3>{budget.category}</h3>
                      <p className="budget-amount">${budget.amount.toFixed(2)}</p>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteBudget(budget._id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - 2/3 of screen - Pie Chart */}
        <div className="budget-chart-section">
          <h2>Budget Allocation Chart</h2>
          <div className="chart-container">
            {budgets.length > 0 ? (
              <Pie data={chartData} options={chartOptions} />
            ) : (
              <div className="no-data-message">
                <p>Add budgets to see the allocation chart</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && confirmationData && (
        <div className="modal-overlay" onClick={closeConfirmation}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{confirmationData.status === 'success' ? '✅ Success!' : '❌ Error!'}</h2>
            </div>
            <div className="modal-body">
              <p>{confirmationData.message}</p>

              {confirmationData.status === 'success' && confirmationData.data && (
                <>
                  <h3>Created Budget Data:</h3>
                  <pre className="json-display">
                    {JSON.stringify(confirmationData.data, null, 2)}
                  </pre>
                </>
              )}

              {confirmationData.status === 'error' && (
                <>
                  <h3>Error Details:</h3>
                  <pre className="json-display">
                    {JSON.stringify(confirmationData.error, null, 2)}
                  </pre>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={closeConfirmation}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;