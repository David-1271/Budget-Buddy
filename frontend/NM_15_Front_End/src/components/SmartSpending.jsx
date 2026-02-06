import React, { useState, useEffect } from 'react';
import { dataAPI } from '../api/apiService';
import './SmartSpending.css';

const SmartSpending = () => {
  const [transactions, setTransactions] = useState([]);
  const [insight, setInsight] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [loading, setLoading] = useState(true);

  // challenge lists
  const challengeList = [
    { title: "No Coffee Out Today", description: "Brew coffee at home instead of buying it. Estimated savings: $5", difficulty: "Easy" },
    { title: "Pack Your Lunch", description: "Bring a homemade lunch to work/school. Estimated savings: $12", difficulty: "Medium" },
    { title: "Zero Spend Day", description: "Commit to spending $0 on non-essentials today.", difficulty: "Hard" },
    { title: "Cancel One Subscription", description: "Review your recurring bills and cancel one you don't use.", difficulty: "Medium" },
    { title: "Walk or Bike", description: "Save on gas or fare by walking/biking to a nearby destination.", difficulty: "Easy" }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await dataAPI.getTransactions();
      setTransactions(data);
      generateInsight(data);
    } catch (error) {
      console.error("Failed to load transactions", error);
    } finally {
      setLoading(false);
    }
  };

  // simple insight generation based on spending patterns
  const generateInsight = (data) => {
    if (!data || data.length === 0) {
      setInsight({ title: "Start Tracking!", text: "Add transactions to get personalized tips." });
      return;
    }

    // filter only expenses
    const expenses = data.filter(t => t.type === 'expense');
    
    // calculate total spending per category
    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Math.abs(curr.amount);
      return acc;
    }, {});

    // find the category with the highest spending
    let maxCategory = "";
    let maxAmount = 0;
    for (const [cat, amount] of Object.entries(categoryTotals)) {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxCategory = cat;
      }
    }

    if (maxAmount > 0) {
      setInsight({
        title: `Watch your ${maxCategory} spending!`,
        text: `You've spent $${maxAmount.toFixed(2)} on ${maxCategory}. Consider cutting back this week.`
      });
    } else {
      setInsight({ title: "Great Job!", text: "Your spending looks manageable so far." });
    }
  };

  // show a random challenge
  const handleShowChallenge = () => {
    const randomIndex = Math.floor(Math.random() * challengeList.length);
    setChallenge(challengeList[randomIndex]);
    setShowChallenge(true);
  };

  if (loading) return <div className="loading-container">Analyzing your spending...</div>;

  return (
    <div className="smart-spending-container">
      <header className="page-header">
        <h1>Smart Spending Insights</h1>
        <p>Personalized tips to help you save more.</p>
      </header>

      <div className="content-grid">
        {/* 1. insight cards */}
        <section className="insight-section">
          <div className="card insight-card">
            <div className="icon-wrapper">
              💡
            </div>
            <div className="text-content">
              <h2>{insight?.title}</h2>
              <p>{insight?.text}</p>
            </div>
          </div>
        </section>

        {/* 2. today's challenge section */}
        <section className="challenge-section">
          <div className="card challenge-card">
            <h2>Today's Savings Challenge</h2>
            <p className="subtitle">Ready to save some money today?</p>
            
            {!showChallenge ? (
              <button className="btn-reveal" onClick={handleShowChallenge}>
                Show Challenge
              </button>
            ) : (
              <div className="challenge-content fade-in">
                <span className={`difficulty-tag ${challenge.difficulty.toLowerCase()}`}>
                  {challenge.difficulty}
                </span>
                <h3>{challenge.title}</h3>
                <p>{challenge.description}</p>
                <button className="btn-refresh" onClick={handleShowChallenge}>
                  Get Another Challenge
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SmartSpending;