import React, { useState, useEffect } from 'react';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { dataAPI } from '../api/apiService';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

const Dashboard = ({ userRole }) => {
  const [stats, setStats] = useState({
    balance: 0
  });

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, statsData, transactionsData, budgetsData] = await Promise.all([
          dataAPI.getProfile(), // Get user profile to get monthly income
          dataAPI.getDashboardStats(),
          dataAPI.getTransactions(),
          dataAPI.getBudgets()
        ]);

        // Extract monthlyIncome from user preferences
        const income = userData.profile?.preferences?.monthlyIncome || null;
        setMonthlyIncome(income);

        // Only set the balance
        setStats({
          balance: statsData.balance
        });
        setTransactions(transactionsData);
        setBudgets(budgetsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare budget category data for the pie chart
  const budgetCategoryData = {
    labels: budgets.map(budget => budget.category),
    datasets: [
      {
        data: budgets.map(budget => budget.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(201, 203, 207, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(201, 203, 207, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare income vs expenses over time data
  const incomeExpenseOverTime = () => {
    // Group transactions by date
    const transactionsByDate = {};
    transactions.forEach(transaction => {
      const date = transaction.date.split('T')[0]; // Get just the date part
      if (!transactionsByDate[date]) {
        transactionsByDate[date] = { income: 0, expenses: 0 };
      }

      if (transaction.type === 'income') {
        transactionsByDate[date].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        transactionsByDate[date].expenses += Math.abs(transaction.amount);
      }
    });

    // Sort dates
    const sortedDates = Object.keys(transactionsByDate).sort();

    const incomeData = sortedDates.map(date => transactionsByDate[date].income);
    const expenseData = sortedDates.map(date => transactionsByDate[date].expenses);

    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1
        }
      ]
    };
  };


  // Calculate current month's income and expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthlyIncome = transactions
    .filter(t =>
      t.type === 'income' &&
      new Date(t.date).getMonth() === currentMonth &&
      new Date(t.date).getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthlyExpenses = transactions
    .filter(t =>
      t.type === 'expense' &&
      new Date(t.date).getMonth() === currentMonth &&
      new Date(t.date).getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Prepare income vs expenses data for chart
  const incomeExpenseData = {
    labels: ['Monthly Income', 'Monthly Expenses'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [currentMonthlyIncome, currentMonthlyExpenses],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const timeSeriesData = incomeExpenseOverTime();

  if (loading) {
    return <div className="dashboard-container">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      <div className="stats-container">
        <div className="stat-card balance-card">
          <h3>Balance</h3>
          <p className={`stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}`}>
            ${stats.balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Recent Transactions and Budget Visualization side by side */}
      <div className="dashboard-widgets-container">
        <div className="recent-transactions-container">
          <div className="widget-header">
            <h2>Recent Transactions</h2>
            <a href="/transaction-history" className="view-all-link">View All</a>
          </div>
          {transactions.length > 0 ? (
            <div className="recent-transactions-list">
              {transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
                .slice(0, 5) // Show only the 5 most recent
                .map(transaction => (
                  <div key={transaction._id} className="transaction-item">
                    <div className="transaction-info">
                      <div className="transaction-description">{transaction.description}</div>
                      <div className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</div>
                    </div>
                    <div className={`transaction-amount ${transaction.amount >= 0 ? 'income-amount' : 'expense-amount'}`}>
                      {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="no-transactions">No recent transactions</div>
          )}
        </div>

        {/* Budget Visualization */}
        {budgets && budgets.length > 0 && (
          <div className="budget-visualization-container">
            <div className="widget-header">
              <h2>Budget Breakdown</h2>
              <a href="/budget" className="view-all-link">Manage Budget</a>
            </div>

            {/* Budget chart */}
            <div className="chart-card clickable-chart" onClick={() => window.location.href = '/budget'}>
              <Pie
                data={budgetCategoryData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                          const percentage = total ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                          return `${label}: $${value.toFixed(2)} (${percentage})`;
                        }
                      }
                    }
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Charts */}
      <div className="summary-charts-container">
        <h2>Financial Summary</h2>

        <div className="charts-container">
          {/* Income vs Expenses over Time */}
          {transactions.length > 0 && (
            <div className="chart-card">
              <h2>Income vs Expenses Over Time</h2>
              <Line
                data={timeSeriesData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          )}


          {/* Income vs Expenses */}
          {transactions.length > 0 && (
            <div className="chart-card">
              <h2>Income vs Expenses</h2>
              <Bar
                data={incomeExpenseData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;