const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/budgetbuddy')
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Import models
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'budget_buddy_secret_key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    // Check the specific error type and respond appropriately
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token format' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token has expired' });
    } else {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'budget_buddy_secret_key',
    { expiresIn: '24h' }
  );
};

// Routes

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password (using the comparePassword method from the model)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user info with role and token
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // Will be hashed automatically with the pre-save hook
      role: 'user' // New signups are always regular users
    });

    await newUser.save();

    // Generate JWT token for immediate login
    const token = generateToken(newUser);

    res.json({
      success: true,
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during signup'
    });
  }
});

// Transactions endpoints
app.get('/api/transactions', authenticateUser, async (req, res) => {
  try {
    // Get only transactions for the authenticated user
    const transactions = await Transaction.find({ userId: req.user._id }).populate('userId', 'firstName lastName email');
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      message: 'Failed to fetch transactions'
    });
  }
});

app.post('/api/transactions', authenticateUser, async (req, res) => {
  try {
    const { date, description, category, amount, type } = req.body;

    const newTransaction = new Transaction({
      userId: req.user._id,
      date: new Date(date),
      description,
      category,
      amount: parseFloat(amount),
      type
    });

    await newTransaction.save();

    // Populate the userId field for the response
    await newTransaction.populate('userId', 'firstName lastName email');

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({
      message: 'Failed to add transaction'
    });
  }
});

app.get('/api/budgets', authenticateUser, async (req, res) => {
  try {
    // Get only budgets for the authenticated user
    const budgets = await Budget.find({ userId: req.user._id }).populate('userId', 'firstName lastName email');
    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      message: 'Failed to fetch budgets'
    });
  }
});

app.get('/api/dashboard/stats', authenticateUser, async (req, res) => {
  try {
    // Calculate dashboard statistics for authenticated user
    const totalIncome = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense' } },
      { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
    ]);

    const transactionCount = await Transaction.countDocuments({ userId: req.user._id });
    const budgetCount = await Budget.countDocuments({ userId: req.user._id });

    res.json({
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      balance: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
      transactionCount,
      budgetCount
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Budget categories endpoints
app.get('/api/budget-categories', authenticateUser, async (req, res) => {
  try {
    // Get all unique budget categories for the authenticated user's transactions
    const categories = await Transaction.distinct('category', { userId: req.user._id });
    res.json(categories);
  } catch (error) {
    console.error('Get budget categories error:', error);
    res.status(500).json({
      message: 'Failed to fetch budget categories'
    });
  }
});

// Create a new budget
app.post('/api/budgets', authenticateUser, async (req, res) => {
  try {
    const { category, amount, period } = req.body;

    // Check if a budget for this category already exists for the user
    const existingBudget = await Budget.findOne({
      userId: req.user._id,
      category
    });

    if (existingBudget) {
      return res.status(400).json({
        message: 'A budget for this category already exists'
      });
    }

    const newBudget = new Budget({
      userId: req.user._id,
      category,
      amount: parseFloat(amount),
      period: period || 'monthly'
    });

    await newBudget.save();
    res.status(201).json(newBudget);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      message: 'Failed to create budget'
    });
  }
});

// Update a budget
app.put('/api/budgets/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, period } = req.body;

    // Verify that the budget belongs to the authenticated user
    const budget = await Budget.findOne({ _id: id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({
        message: 'Budget not found or does not belong to user'
      });
    }

    // Update the budget
    budget.amount = parseFloat(amount);
    if (period) budget.period = period;

    await budget.save();
    res.json(budget);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      message: 'Failed to update budget'
    });
  }
});
//update a transaction
app.put('/api/transactions/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, category, amount, type } = req.body;

    // Verify that the transaction belongs to the authenticated user
    const transaction = await Transaction.findOne({ _id: id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found or does not belong to user'
      });
    }

    // Update the transaction
    transaction.date = new Date(date);
    transaction.description = description;
    transaction.category = category;
    transaction.amount = parseFloat(amount);
    transaction.type = type;

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      message: 'Failed to update transaction'
    });
  }
});

// Delete a budget
app.delete('/api/budgets/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify that the budget belongs to the authenticated user
    const result = await Budget.deleteOne({ _id: id, userId: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'Budget not found or does not belong to user'
      });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      message: 'Failed to delete budget'
    });
  }
});

// Recurring transactions endpoints
app.post('/api/recurring-transactions', authenticateUser, async (req, res) => {
  try {
    const { date, description, category, amount, type, recurrencePattern, endDate } = req.body;

    // Create the initial recurring transaction
    const recurringTransaction = new Transaction({
      userId: req.user._id,
      date: new Date(date),
      description,
      category,
      amount: parseFloat(amount),
      type,
      isRecurring: true,
      recurrencePattern,
      nextOccurrence: calculateNextOccurrence(new Date(date), recurrencePattern),
      endDate: endDate ? new Date(endDate) : undefined
    });

    await recurringTransaction.save();

    // Populate the userId field for the response
    await recurringTransaction.populate('userId', 'firstName lastName email');

    res.status(201).json(recurringTransaction);
  } catch (error) {
    console.error('Create recurring transaction error:', error);
    res.status(500).json({
      message: 'Failed to create recurring transaction'
    });
  }
});

// Helper function to calculate next occurrence
function calculateNextOccurrence(date, pattern) {
  const nextDate = new Date(date);

  switch (pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      throw new Error('Invalid recurrence pattern');
  }

  return nextDate;
}

// Get all recurring transactions for a user
app.get('/api/recurring-transactions', authenticateUser, async (req, res) => {
  try {
    const recurringTransactions = await Transaction.find({
      userId: req.user._id,
      isRecurring: true
    }).populate('userId', 'firstName lastName email');

    res.json(recurringTransactions);
  } catch (error) {
    console.error('Get recurring transactions error:', error);
    res.status(500).json({
      message: 'Failed to fetch recurring transactions'
    });
  }
});

// Update a recurring transaction
app.put('/api/recurring-transactions/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, category, amount, type, recurrencePattern, endDate } = req.body;

    // Verify that the transaction belongs to the authenticated user
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user._id,
      isRecurring: true
    });

    if (!transaction) {
      return res.status(404).json({
        message: 'Recurring transaction not found or does not belong to user'
      });
    }

    // Update the transaction
    if (description) transaction.description = description;
    if (category) transaction.category = category;
    if (amount) transaction.amount = parseFloat(amount);
    if (type) transaction.type = type;
    if (recurrencePattern) {
      transaction.recurrencePattern = recurrencePattern;
      transaction.nextOccurrence = calculateNextOccurrence(transaction.date, recurrencePattern);
    }
    if (endDate !== undefined) transaction.endDate = new Date(endDate);

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    console.error('Update recurring transaction error:', error);
    res.status(500).json({
      message: 'Failed to update recurring transaction'
    });
  }
});

// Delete a recurring transaction
app.delete('/api/recurring-transactions/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify that the transaction belongs to the authenticated user
    const result = await Transaction.deleteOne({
      _id: id,
      userId: req.user._id,
      isRecurring: true
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'Recurring transaction not found or does not belong to user'
      });
    }

    res.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Delete recurring transaction error:', error);
    res.status(500).json({
      message: 'Failed to delete recurring transaction'
    });
  }
});

// Endpoint to generate actual transactions from recurring ones (meant to be used by a cron job or similar)
app.post('/api/recurring-transactions/generate', async (req, res) => {
  // This would be protected by a secret key in production
  try {
    const transactions = await Transaction.find({
      isRecurring: true,
      nextOccurrence: { $lte: new Date() },
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: new Date() } },
        { endDate: null }
      ]
    });

    // Create actual transactions for each recurring transaction that is due
    const createdTransactions = [];
    for (const recurring of transactions) {
      // Create a new transaction based on the recurring one
      const newTransaction = new Transaction({
        userId: recurring.userId,
        date: new Date(),
        description: recurring.description,
        category: recurring.category,
        amount: recurring.amount,
        type: recurring.type
      });

      await newTransaction.save();
      createdTransactions.push(newTransaction);

      // Update the recurring transaction's next occurrence
      recurring.nextOccurrence = calculateNextOccurrence(recurring.nextOccurrence, recurring.recurrencePattern);
      await recurring.save();
    }

    res.json({
      message: `${createdTransactions.length} recurring transactions processed`,
      createdTransactions
    });
  } catch (error) {
    console.error('Generate recurring transactions error:', error);
    res.status(500).json({
      message: 'Failed to process recurring transactions'
    });
  }
});



// Spending alert configuration endpoints
app.get('/api/alerts', authenticateUser, async (req, res) => {
  try {
    // In a real app, we'd have a separate Alert model, but for now we'll store settings in user profile
    // or use the user's budget settings to determine alerts

    // For this implementation, we'll return alert settings from user preferences
    // Since we don't have a User preferences field yet, we'll return sample data
    // In a real implementation, you would have alert settings in your User model
    res.json({
      spendingLimits: req.user.spendingLimits || [],
      budgetAlerts: req.user.budgetAlerts || true,
      lowBalanceAlerts: req.user.lowBalanceAlerts || false,
      newTransactionAlerts: req.user.newTransactionAlerts || true
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      message: 'Failed to fetch alert settings'
    });
  }
});

app.put('/api/alerts', authenticateUser, async (req, res) => {
  try {
    const { spendingLimits, budgetAlerts, lowBalanceAlerts, newTransactionAlerts } = req.body;

    // Update user's alert preferences
    // This is a simplified implementation - in a real app you would have these fields in the User model
    await User.findByIdAndUpdate(req.user._id, {
      spendingLimits: spendingLimits || [],
      budgetAlerts: budgetAlerts !== undefined ? budgetAlerts : true,
      lowBalanceAlerts: lowBalanceAlerts !== undefined ? lowBalanceAlerts : false,
      newTransactionAlerts: newTransactionAlerts !== undefined ? newTransactionAlerts : true
    });

    res.json({
      message: 'Alert settings updated successfully',
      spendingLimits: spendingLimits || [],
      budgetAlerts: budgetAlerts !== undefined ? budgetAlerts : true,
      lowBalanceAlerts: lowBalanceAlerts !== undefined ? lowBalanceAlerts : false,
      newTransactionAlerts: newTransactionAlerts !== undefined ? newTransactionAlerts : true
    });
  } catch (error) {
    console.error('Update alerts error:', error);
    res.status(500).json({
      message: 'Failed to update alert settings'
    });
  }
});

// Helper function to check for spending alerts
async function checkSpendingAlerts(userId, transaction) {
  // Retrieve user's alert settings and budgets
  const user = await User.findById(userId);
  const budgets = await Budget.find({ userId: userId });

  // Check if transaction exceeds any spending limits
  for (const budget of budgets) {
    if (transaction.category === budget.category) {
      // Calculate if this transaction would exceed the budget
      const totalSpent = budget.spent + Math.abs(transaction.amount);
      const percentage = (totalSpent / budget.amount) * 100;

      // Check for budget alerts (notifications are disabled)
      if (percentage >= 90 && percentage < 100) {
        // Potential alert: Budget Alert - You have used ${percentage.toFixed(1)}% of your ${budget.category} budget.
      } else if (percentage >= 100) {
        // Potential alert: Budget Exceeded - You have exceeded your ${budget.category} budget by $${(totalSpent - budget.amount).toFixed(2)}.
      }
    }
  }

  // Check for transaction-specific spending limits
  if (user.spendingLimits && Array.isArray(user.spendingLimits)) {
    for (const limit of user.spendingLimits) {
      if (transaction.category === limit.category && Math.abs(transaction.amount) > limit.amount) {
        // Potential alert: Spending Limit Exceeded - Your ${transaction.description} transaction of $${Math.abs(transaction.amount).toFixed(2)} exceeds your spending limit of $${limit.amount} for ${limit.category}.
      }
    }
  }
}


// Delete a transaction
app.delete('/api/transactions/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify that the transaction belongs to the authenticated user
    const result = await Transaction.deleteOne({
      _id: id,
      userId: req.user._id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'Transaction not found or does not belong to user'
      });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      message: 'Failed to delete transaction'
    });
  }
});

// Update transaction creation to check for alerts
app.post('/api/transactions', authenticateUser, async (req, res) => {
  try {
    const { date, description, category, amount, type } = req.body;

    const newTransaction = new Transaction({
      userId: req.user._id,
      date: new Date(date),
      description,
      category,
      amount: parseFloat(amount),
      type
    });

    await newTransaction.save();

    // Populate the userId field for the response
    await newTransaction.populate('userId', 'firstName lastName email');

    // Check for spending alerts
    await checkSpendingAlerts(req.user._id, newTransaction);

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({
      message: 'Failed to add transaction'
    });
  }
});

// Search and filter transactions endpoint
app.get('/api/transactions/search', authenticateUser, async (req, res) => {
  try {
    const {
      search,
      category,
      type,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    let filter = { userId: req.user._id };

    // Add search filter (search in description)
    if (search) {
      filter.description = { $regex: search, $options: 'i' }; // Case insensitive search
    }

    // Add category filter
    if (category) {
      filter.category = category;
    }

    // Add type filter
    if (type) {
      filter.type = type;
    }

    // Add date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Define sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search with filters
    const transactions = await Transaction.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Search transactions error:', error);
    res.status(500).json({
      message: 'Failed to search transactions'
    });
  }
});

// Data backup and restore endpoints
app.get('/api/backup', authenticateUser, async (req, res) => {
  try {
    // Get all data for the user
    const [transactions, budgets] = await Promise.all([
      Transaction.find({ userId: req.user._id }),
      Budget.find({ userId: req.user._id })
    ]);

    // Create backup object
    const backupData = {
      userId: req.user._id,
      backupDate: new Date(),
      transactions,
      budgets
    };

    // Send as JSON file
    res.header('Content-Type', 'application/json');
    res.header('Content-Disposition', `attachment; filename=budget-buddy-backup-${req.user._id}-${new Date().toISOString().split('T')[0]}.json`);

    res.send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({
      message: 'Failed to create backup'
    });
  }
});

app.post('/api/restore', authenticateUser, async (req, res) => {
  try {
    // In a real implementation, you would handle file upload here
    // For simplicity, we're assuming the data is sent in the request body
    const { transactions, budgets } = req.body;

    if (!transactions || !budgets) {
      return res.status(400).json({
        message: 'Invalid backup data format'
      });
    }

    // Clear existing user data to avoid duplicates (optional - depends on requirements)
    await Promise.all([
      Transaction.deleteMany({ userId: req.user._id }),
      Budget.deleteMany({ userId: req.user._id })
    ]);

    // Restore transactions
    const restoredTransactions = [];
    for (const transaction of transactions) {
      const newTransaction = new Transaction({
        ...transaction,
        _id: undefined, // Remove the original ID to create new documents
        userId: req.user._id
      });
      await newTransaction.save();
      restoredTransactions.push(newTransaction);
    }

    // Restore budgets
    const restoredBudgets = [];
    for (const budget of budgets) {
      const newBudget = new Budget({
        ...budget,
        _id: undefined, // Remove the original ID to create new documents
        userId: req.user._id
      });
      await newBudget.save();
      restoredBudgets.push(newBudget);
    }

    res.json({
      message: 'Data restored successfully',
      restored: {
        transactions: restoredTransactions.length,
        budgets: restoredBudgets.length
      }
    });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({
      message: 'Failed to restore data'
    });
  }
});

// Transaction categorization suggestions endpoints
app.get('/api/transactions/suggest-category', authenticateUser, async (req, res) => {
  try {
    const { description, type } = req.query;

    if (!description) {
      return res.status(400).json({
        message: 'Description is required for category suggestion'
      });
    }

    // Get user's existing transactions to analyze patterns
    const userTransactions = await Transaction.find({
      userId: req.user._id,
      type: type || 'expense'  // default to expense if not specified
    });

    // Simple categorization logic based on common keywords
    const keywordCategories = {
      'Food & Dining': ['grocery', 'groceries', 'supermarket', 'grocery store', 'aldi', 'walmart', 'costco', 'restaurant', 'dining', 'dinner', 'lunch', 'breakfast', 'cafe', 'starbucks', 'mcdonald', 'subway', 'pizza', 'food'],
      'Transportation': ['gas', 'fuel', 'gas station', 'shell', 'exxon', 'car', 'uber', 'lyft', 'taxi', 'bus', 'train', 'metro', 'transportation'],
      'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'disney', 'amc', 'theater', 'games', 'game', 'app store', 'itunes'],
      'Shopping': ['amazon', 'target', 'walmart', 'best buy', 'macy', 'kohls', 'shopping', 'department', 'retail', 'store', 'outlet'],
      'Healthcare': ['hospital', 'doctor', 'clinic', 'pharmacy', 'walgreens', 'cvs', 'health', 'medical', 'dental', 'optical'],
      'Utilities': ['electric', 'gas', 'water', 'internet', 'wifi', 'comcast', 'att', 'verizon', 'utilities'],
      'Income': ['salary', 'wage', 'payment', 'paycheck', 'deposit', 'transfer', 'refund', 'bonus', 'interest', 'dividend'],
      'Housing': ['rent', 'mortgage', 'property', 'housing', 'apartment', 'home']
    };

    // Find the most likely category based on keywords
    let suggestedCategory = 'Other'; // default category
    let maxMatches = 0;

    const lowerDesc = description.toLowerCase();

    for (const [category, keywords] of Object.entries(keywordCategories)) {
      const matches = keywords.filter(keyword => lowerDesc.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        suggestedCategory = category;
      }
    }

    // If it's an income transaction, prefer income-related categories
    if (type === 'income' && suggestedCategory === 'Other') {
      const incomeKeywords = keywordCategories['Income'] || [];
      const incomeMatches = incomeKeywords.filter(keyword => lowerDesc.includes(keyword)).length;
      if (incomeMatches > 0) {
        suggestedCategory = 'Income';
      }
    }

    // Alternative suggestion based on user's most common categories
    let userSuggestion = 'Other';
    if (userTransactions.length > 0) {
      // Count category frequencies in user's transactions
      const categoryCounts = {};
      userTransactions.forEach(t => {
        if (!categoryCounts[t.category]) {
          categoryCounts[t.category] = 0;
        }
        categoryCounts[t.category]++;
      });

      // Find the category with the highest frequency
      let maxCount = 0;
      for (const [category, count] of Object.entries(categoryCounts)) {
        if (count > maxCount) {
          maxCount = count;
          userSuggestion = category;
        }
      }
    }

    res.json({
      suggestedCategory,
      userSuggestion,
      confidence: maxMatches > 0 ? 'high' : 'low',
      description: description
    });
  } catch (error) {
    console.error('Suggest category error:', error);
    res.status(500).json({
      message: 'Failed to suggest category'
    });
  }
});


// User profile endpoints
app.get('/api/profile', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

app.put('/api/profile', authenticateUser, async (req, res) => {
  try {
    const { firstName, lastName, bio, avatar, dateOfBirth, phone, address, preferences } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.profile.bio = bio;
    if (avatar !== undefined) user.profile.avatar = avatar;
    if (dateOfBirth !== undefined) user.profile.dateOfBirth = dateOfBirth;
    if (phone !== undefined) user.profile.phone = phone;

    if (address) {
      user.profile.address = {
        ...user.profile.address,
        ...address
      };
    }

    if (preferences) {
      user.profile.preferences = {
        ...user.profile.preferences,
        ...preferences
      };
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password endpoint
app.put('/api/profile/change-password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Budget Buddy API is running!' });
});

// Handle 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Export the app for testing purposes
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}