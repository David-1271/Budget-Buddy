import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import BudgetPlanner from '../components/BudgetPlanner';

// Mock the api service
jest.mock('../api/apiService', () => ({
  dataAPI: {
    getBudgets: jest.fn(),
    createBudget: jest.fn(),
  }
}));

const { dataAPI } = require('../api/apiService');

describe('BudgetPlanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders BudgetPlanner component', async () => {
    // Mock the API response
    dataAPI.getBudgets.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <BudgetPlanner userRole="user" />
      </MemoryRouter>
    );

    // Check if the header is rendered
    await waitFor(() => {
      expect(screen.getByText(/Budget Planner/i)).toBeInTheDocument();
    });
    
    // Check if the form elements are present
    expect(screen.getByPlaceholderText(/Category \(e.g. Groceries, Rent\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Amount \(\$\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Budget/i)).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    dataAPI.getBudgets.mockReturnValue(new Promise(() => {})); // Never resolves to simulate loading

    render(
      <MemoryRouter>
        <BudgetPlanner userRole="user" />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading budgets.../i)).toBeInTheDocument();
  });

  test('shows error message when API fails', async () => {
    dataAPI.getBudgets.mockRejectedValue(new Error('Failed to load budgets'));

    render(
      <MemoryRouter>
        <BudgetPlanner userRole="user" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load budgets. Using mock data./i)).toBeInTheDocument();
    });
  });
});