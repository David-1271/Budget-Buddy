import React, { useState, useEffect } from 'react';
import { dataAPI } from '../api/apiService';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal visibility state
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);

  // ⭐ [New] State for Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [transactionForm, setTransactionForm] = useState({
    date: '',
    name: '',
    description: '',
    amount: '',
    type: 'expense',
    category: 'Food & Dining'
  });
  
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [addTransactionError, setAddTransactionError] = useState(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState(null);

  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  const categories = [
    'Food & Dining', 'Transportation', 'Housing', 'Utilities', 
    'Entertainment', 'Healthcare', 'Personal Care', 'Shopping', 
    'Education', 'Others'
  ]; 
  
  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, transactions]);

  const handleTransactionFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ⭐ [New] Function to populate the form when "Edit" is clicked
  const handleEditClick = (transaction) => {
    setIsEditing(true);
    setEditingId(transaction._id);
    
    setTransactionForm({
      // Convert date to YYYY-MM-DD format for input field
      date: new Date(transaction.date).toISOString().split('T')[0],
      name: transaction.description,
      description: transaction.description,
      amount: Math.abs(transaction.amount), // Convert negative amount to positive for display
      type: transaction.type,
      category: transaction.category || 'Others'
    });
    
    setShowAddTransactionModal(true);
  };

  // ⭐ [New] Function to handle updating an existing transaction
  const handleUpdateTransaction = async () => {
    if (!transactionForm.date || !transactionForm.name || !transactionForm.amount) {
      setAddTransactionError('All fields are required');
      return;
    }

    const amount = parseFloat(transactionForm.amount);
    if (isNaN(amount)) {
      setAddTransactionError('Amount must be a valid number');
      return;
    }

    // Convert amount: negative for expenses, positive for income
    const finalAmount = transactionForm.type === 'expense' ? Math.abs(amount) * -1 : Math.abs(amount);

    setIsAddingTransaction(true);
    setAddTransactionError(null);

    try {
      const transactionData = {
        date: transactionForm.date,
        description: transactionForm.name,
        category: transactionForm.category,
        amount: finalAmount,
        type: transactionForm.type
      };

      const updatedTransaction = await dataAPI.updateTransaction(editingId, transactionData);

      // Success handling
      setShowAddTransactionModal(false);
      handleCloseAddModal(); // Reset form and state
      await fetchTransactions(); // Refresh list

      // Show success confirmation modal
      setConfirmationData({
        status: 'success',
        message: 'Transaction updated successfully!',
        data: updatedTransaction
      });
      setShowConfirmation(true);
    } catch (err) {
      console.error('Error updating transaction:', err);

      // Show error confirmation modal
      setConfirmationData({
        status: 'error',
        message: err.message || 'Failed to update transaction',
        error: err
      });
      setShowConfirmation(true);
    } finally {
      setIsAddingTransaction(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!transactionForm.date || !transactionForm.name || !transactionForm.amount) {
      setAddTransactionError('All fields are required');
      return;
    }

    const amount = parseFloat(transactionForm.amount);
    if (isNaN(amount)) {
      setAddTransactionError('Amount must be a valid number');
      return;
    }

    const finalAmount = transactionForm.type === 'expense' ? Math.abs(amount) * -1 : Math.abs(amount);

    setIsAddingTransaction(true);
    setAddTransactionError(null);

    try {
      const transactionData = {
        date: transactionForm.date,
        description: transactionForm.name,
        category: transactionForm.category,
        amount: finalAmount,
        type: transactionForm.type
      };

      const createdTransaction = await dataAPI.addTransaction(transactionData);
      setShowAddTransactionModal(false);
      handleCloseAddModal(); // Reuse reset logic
      await fetchTransactions();

      // Show success confirmation modal
      setConfirmationData({
        status: 'success',
        message: 'Transaction added successfully!',
        data: createdTransaction
      });
      setShowConfirmation(true);
    } catch (err) {
      console.error('Error adding transaction:', err);

      // Show error confirmation modal
      setConfirmationData({
        status: 'error',
        message: err.message || 'Failed to add transaction',
        error: err
      });
      setShowConfirmation(true);
    } finally {
      setIsAddingTransaction(false);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddTransactionModal(false);
    // ⭐ [Important] Reset Edit Mode state when closing modal
    setIsEditing(false);
    setEditingId(null);
    setTransactionForm({
      date: '',
      name: '',
      description: '',
      amount: '',
      type: 'expense',
      category: 'Food & Dining'
    });
    setAddTransactionError(null);
  };

  const toggleExpandedTransaction = (transactionId) => {
    setExpandedTransactionId(expandedTransactionId === transactionId ? null : transactionId);
  };

  const handleDeleteTransaction = async (transactionId, transaction) => {
    try {
      await dataAPI.deleteTransaction(transactionId);
      await fetchTransactions();

      // Show success confirmation modal
      setConfirmationData({
        status: 'success',
        message: 'Transaction deleted successfully!',
        data: {
          transactionId,
          description: transaction.description,
          deletedAt: new Date().toISOString()
        }
      });
      setShowConfirmation(true);

      if (expandedTransactionId === transactionId) {
        setExpandedTransactionId(null);
      }
    } catch (err) {
      console.error('Error deleting:', err);

      // Show error confirmation modal
      setConfirmationData({
        status: 'error',
        message: err.message || 'Failed to delete transaction',
        error: err
      });
      setShowConfirmation(true);
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await dataAPI.getTransactions();
      setTransactions(data);
      setFilteredTransactions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(transactions);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = transactions.filter(transaction => {
      if (transaction.description.toLowerCase().includes(query)) return true;
      const dateStr = new Date(transaction.date).toLocaleDateString();
      if (dateStr.includes(query)) return true;
      if (transaction.date.includes(query)) return true;
      if (transaction.amount.toString().includes(query)) return true;
      if (transaction.category.toLowerCase().includes(query)) return true;
      return false;
    });
    setFilteredTransactions(filtered);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const clearSearch = () => setSearchQuery('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount, type) => {
    const absAmount = Math.abs(amount);
    const transactionType = type || (amount >= 0 ? 'income' : 'expense');
    return transactionType === 'income' ? `+$${absAmount.toFixed(2)}` : `-$${absAmount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      <div className="transactions-content">
        <div className="transactions-header">
          <div className="header-content">
            <div>
              <h1>Transactions</h1>
              <p>View and search all your financial transactions</p>
            </div>
            {/* Always open in 'Add' mode when clicking this button */}
            <button className="add-transaction-btn" onClick={() => {
              setIsEditing(false);
              setEditingId(null);
              setShowAddTransactionModal(true);
            }}>
              Add Transaction
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-bar">
            <div className="search-input-container">
              <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Search transactions..." className="search-input" />
            </div>
            {searchQuery && <button onClick={clearSearch} className="clear-button">Clear</button>}
          </div>
          <div className="search-info">Showing {filteredTransactions.length} of {transactions.length} transactions</div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="transactions-table-container">
          {filteredTransactions.length === 0 ? (
            <div className="no-transactions"><h3>No transactions found</h3></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <React.Fragment key={transaction._id}>
                      <tr className="transaction-row" onClick={() => toggleExpandedTransaction(transaction._id)}>
                        <td>{formatDate(transaction.date)}</td>
                        <td>{transaction.description}</td>
                        <td>{transaction.category}</td>
                        <td className={`amount ${transaction.amount >= 0 ? 'income-amount' : 'expense-amount'}`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </td>
                        <td>
                          {/* ⭐ [New] Edit and Delete buttons */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="edit-btn"
                              style={{ 
                                backgroundColor: '#f59e0b', color: 'white', border: 'none', 
                                padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' 
                              }}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row expansion
                                handleEditClick(transaction);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row expansion
                                handleDeleteTransaction(transaction._id, transaction);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Details Row */}
                      {expandedTransactionId === transaction._id && (
                        <tr className="expanded-transaction-row">
                          <td colSpan="5" className="expanded-content">
                            <div className="expanded-details">
                              <div className="detail-item"><span className="detail-label">ID:</span><span>{transaction._id}</span></div>
                              <div className="detail-item"><span className="detail-label">Description:</span><span>{transaction.description}</span></div>
                              <div className="detail-item"><span className="detail-label">Category:</span><span>{transaction.category}</span></div>
                              <div className="detail-item"><span className="detail-label">Date:</span><span>{formatDate(transaction.date)}</span></div>
                              <div className="detail-item"><span className="detail-label">Type:</span><span>{transaction.type}</span></div>
                              <div className="detail-item">
                                <span className="detail-label">Amount:</span>
                                <span className={`detail-value amount ${transaction.amount >= 0 ? 'income-amount' : 'expense-amount'}`}>
                                  {formatAmount(transaction.amount, transaction.type)}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer code remains here... */}
        {/* ... */}

        {/* Modal: Handles both Add and Update */}
        {showAddTransactionModal && (
          <div className="modal-overlay" onClick={handleCloseAddModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                {/* ⭐ [New] Dynamic Title */}
                <h2>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h2>
                <button className="modal-close" onClick={handleCloseAddModal}>&times;</button>
              </div>

              <div className="modal-body">
                {addTransactionError && <div className="error-message">{addTransactionError}</div>}

                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input type="date" id="date" name="date" value={transactionForm.date} onChange={handleTransactionFormChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" name="name" value={transactionForm.name} onChange={handleTransactionFormChange} className="form-input" placeholder="Transaction name" required />
                </div>
                <div className='form-group'>
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" value={transactionForm.category} onChange={handleTransactionFormChange} className="form-select">
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description (Optional)</label>
                  <textarea id="description" name="description" value={transactionForm.description} onChange={handleTransactionFormChange} className="form-textarea" />
                </div>
                <div className="form-group">
                  <label htmlFor="amount">Amount</label>
                  <input type="number" id="amount" name="amount" value={transactionForm.amount} onChange={handleTransactionFormChange} className="form-input" placeholder="e.g., 50.00" step="0.01" required />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <select id="type" name="type" value={transactionForm.type} onChange={handleTransactionFormChange} className="form-select">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseAddModal}>Cancel</button>
                {/* ⭐ [New] Dynamic Button Action (Add vs Update) */}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={isEditing ? handleUpdateTransaction : handleAddTransaction}
                  disabled={isAddingTransaction}
                >
                  {isAddingTransaction ? 'Processing...' : (isEditing ? 'Update Transaction' : 'Add Transaction')}
                </button>
              </div>
            </div>
          </div>
        )}

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
                    <h3>Transaction Data:</h3>
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
    </div>
  );
};

export default Transactions;