import React, { useState } from 'react';
import './Investment.css';

const Investment = () => {
  // 어떤 카드가 열려있는지 추적하는 상태 (null이면 모두 닫힘)
  const [activeId, setActiveId] = useState(null);

  const toggleCard = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  // investment data
  const investmentData = [
    {
      id: 1,
      title: "Stocks",
      icon: "📈",
      risk: "High",
      description: "Ownership shares in a company. High potential returns but higher volatility.",
      details: "Stocks represent fractional ownership in a company. When you buy a stock, you become a shareholder. Historically, stocks have outperformed other investments over the long run, but they fluctuate in value daily.",
      tips: ["Diversify across different sectors", "Think long-term (5+ years)", "Don't panic sell during market dips"]
    },
    {
      id: 2,
      title: "Bonds ",
      icon: "📜",
      risk: "Low",
      description: "A loan you make to the government or a company. Pays interest over time.",
      details: "Bonds are fixed-income instruments. You lend money to an entity (government or corporate) for a defined period at a variable or fixed interest rate. They are generally safer than stocks.",
      tips: ["Good for preserving capital", "Government bonds are safer than corporate ones", "Yields rise when interest rates fall"]
    },
    {
      id: 3,
      title: "ETFs ",
      icon: "🧺",
      risk: "Medium",
      description: "A basket of securities that trades on an exchange like a stock.",
      details: "Exchange-Traded Funds (ETFs) offer the diversification of mutual funds but trade like stocks. One ETF might hold hundreds of companies (like the S&P 500), spreading out your risk.",
      tips: ["Low expense ratios", "Instant diversification", "Great for passive investing"]
    },
    {
      id: 4,
      title: "Real Estate ",
      icon: "🏠",
      risk: "Medium-High",
      description: "Investing in physical property or REITs (Real Estate Investment Trusts).",
      details: "Real estate can generate passive income through rent and potential appreciation in value. REITs allow you to invest in real estate without owning physical property.",
      tips: ["Location is key", "Consider maintenance costs", "REITs offer liquidity unlike physical homes"]
    },
    {
      id: 5,
      title: "Cryptocurrency ",
      icon: "🪙",
      risk: "Very High",
      description: "Digital or virtual currency secured by cryptography.",
      details: "Crypto is a decentralized digital currency. Bitcoin and Ethereum are the most well-known. It is highly volatile and speculative, capable of massive gains or total loss.",
      tips: ["Only invest what you can lose", "Secure your private keys", "Understand the technology first"]
    }
  ];

  return (
    <div className="investment-container">
      <header className="page-header">
        <h1>Investment Guide</h1>
        <p>Learn about different asset classes to grow your wealth.</p>
      </header>

      <div className="investment-grid">
        {investmentData.map((item) => (
          <div 
            key={item.id} 
            className={`investment-card ${activeId === item.id ? 'active' : ''}`}
            onClick={() => toggleCard(item.id)}
          >
            <div className="card-header">
              <div className="header-left">
                <span className="icon">{item.icon}</span>
                <div className="title-group">
                  <h3>{item.title}</h3>
                  <span className={`risk-badge ${item.risk.toLowerCase().replace(' ', '-')}`}>
                    {item.risk} Risk
                  </span>
                </div>
              </div>
              <div className="header-right">
                <span className="toggle-icon">
                  {activeId === item.id ? '−' : '+'}
                </span>
              </div>
            </div>

            {/* short description */}
            <p className="summary">{item.description}</p>

            {/* detailed info*/}
            {activeId === item.id && (
              <div className="card-details fade-in">
                <hr />
                <p className="detail-text">{item.details}</p>
                <div className="tips-box">
                  <h4>💡 Quick Tips</h4>
                  <ul>
                    {item.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Investment;