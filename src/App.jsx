import React, { useState } from 'react';
import { questions, typeDescriptions, likertOptions } from './data';
import { calculateMBTI } from './calculateType';

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [mbtiType, setMbtiType] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showPersonalityTypes, setShowPersonalityTypes] = useState(false);

  const startTest = () => {
    setCurrentQuestion(0);
  };

  const handleAnswer = (value) => {
    setSelectedValue(value);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (currentQuestion + 1 === questions.length) {
        const result = calculateMBTI(newAnswers);
        setMbtiType(result);
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedValue(null);
      }
    }, 300);
  };

  const handleViewResults = () => {
    if (answers.length < questions.length) {
      setShowWarningModal(true);
    } else {
      const result = calculateMBTI(answers);
      setMbtiType(result);
    }
  };

  const handleConfirmResults = () => {
    setShowWarningModal(false);
    const result = calculateMBTI(answers);
    setMbtiType(result);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedValue(answers[currentQuestion - 1]);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(null);
    setAnswers([]);
    setMbtiType(null);
    setSelectedValue(null);
  };

  // Extract repeated styles into constants
  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    marginBottom: '0.5rem'
  };

  const typeCodeStyle = {
    color: 'var(--accent)',
    marginBottom: '0.25rem',
    fontSize: '0.875rem'
  };

  const descriptionStyle = {
    color: 'var(--text-secondary)',
    marginBottom: '0.25rem',
    fontSize: '0.875rem'
  };

  const taglineStyle = {
    color: 'var(--accent)',
    fontStyle: 'italic',
    fontSize: '0.875rem'
  };

  const dimensionStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.25rem'
  };

  const progressBarStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    height: '4px',
    borderRadius: '2px',
    overflow: 'hidden'
  };

  const progressFillStyle = {
    height: '100%',
    background: 'var(--accent)',
    transition: 'width 0.3s ease'
  };

  // Extract repeated JSX into components
  const TypeCard = ({ code, type }) => (
    <div style={cardStyle}>
      <h3 style={{ fontSize: '0.67rem', marginBottom: '0.25rem' }}>{type.name}</h3>
      <p style={typeCodeStyle}>{code}</p>
      <p style={{ ...descriptionStyle, fontSize: '0.5rem' }}>
        {code[0] === 'D' ? 'Degen' : 'Builder'} • 
        {code[1] === 'T' ? 'Trader' : 'Visionary'} • 
        {code[2] === 'H' ? 'HODLer' : 'Exit Liquidity'} • 
        {code[3] === 'M' ? 'Maxi' : 'Omni-Chain'}
      </p>
      <p style={descriptionStyle}>{type.description}</p>
      <p style={taglineStyle}>"{type.tagline}"</p>
    </div>
  );

  const DimensionBar = ({ label, value, score }) => (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={dimensionStyle}>
        <span>{label}:</span>
        <span>{value} ({Math.abs(score) * 20}%)</span>
      </div>
      <div style={progressBarStyle}>
        <div style={{ ...progressFillStyle, width: `${50 + (score * 10)}%` }} />
      </div>
    </div>
  );

  // Personality Types Screen
  if (showPersonalityTypes) {
    return (
      <div style={{ minHeight: '100vh', padding: '0.3rem 1rem' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => setShowPersonalityTypes(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              ← Back to Home
            </button>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Degen Dimensions
            </h1>
            
            <div style={{ textAlign: 'left', marginTop: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                4 Dichotomies
              </h2>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Degen vs. Builder (D vs. B)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Degen: Quick to ape into new projects, loves the thrill of discovery
                  <br/>
                  Builder: Takes time to research, focuses on fundamentals
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Trader vs. Visionary (T vs. V)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Trader: Focuses on charts, patterns, and short-term opportunities
                  <br/>
                  Visionary: Believes in long-term potential and narratives
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>HODLer vs. Exit Liquidity (H vs. E)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  HODLer: Diamond hands. Buys and forgets. Probably still holding DOGE from 2017.
                  <br/>
                  Exit Liquidity: Always chasing the next pump — often left holding the bag (or worse, becoming the bag).
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Omni-Chain vs. Maxi (O vs. M)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Omni-Chain: Lives on bridges. Keeps gas on 8 chains. Probably farming on some random zk-L3 testnet.
                  <br/>
                  Maxi: One chain to rule them all. Loyal to ETH, Solana, or Base — no bridge, no betrayals.
                </p>
              </div>

              <h2 style={{ fontSize: '0.84rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                Personality Types
              </h2>
              <div style={{ 
                display: 'grid', 
                gap: '0.75rem',
                gridTemplateColumns: 'repeat(2, 1fr)'
              }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>🔮 Degen Types</h3>
                  {['DTVM', 'DTEO', 'DTEM', 'DTEH', 'DTHO', 'DTHM', 'DTVO', 'DTVH'].map(code => (
                    <TypeCard key={code} code={code} type={typeDescriptions[code]} />
                  ))}
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>🧱 Builder Types</h3>
                  {['BHVM', 'BHVO', 'BHEM', 'BHEO'].map(code => (
                    <TypeCard key={code} code={code} type={typeDescriptions[code]} />
                  ))}
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>📉 Exit Liquidity Types</h3>
                  {['DTOM', 'DTOH', 'DTEV', 'BTEM'].map(code => (
                    <TypeCard key={code} code={code} type={typeDescriptions[code]} />
                  ))}
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>🔨 Builder Visionaries</h3>
                  {['BTOM', 'BTVM', 'BTVH', 'BTOH'].map(code => (
                    <TypeCard key={code} code={code} type={typeDescriptions[code]} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home Screen
  if (currentQuestion === null && !mbtiType) {
    return (
      <div style={{ minHeight: '100vh', padding: '0.3rem 1rem' }}>
        <div className="card home-card">
          <div className="home-content">
            <div className="home-text">
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                DegenMind
              </h1>
              <p className="tagline" style={{ margin: '1rem 0 0.5rem' }}>
                🔮 What kind of crypto degen are you?
              </p>
              <p className="description" style={{ marginBottom: '1.5rem' }}>
                Find your on-chain personality — from Diamond Hands to Rug Chasers.
              </p>

              <div className="sample-questions" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)' }}>
                  Sample questions you'll be asked:
                </h3>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  padding: '0.25rem', 
                  borderRadius: '0.5rem',
                  marginBottom: '0.25rem'
                }}>
                  <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    "I ape into presales I heard about on Telegram at 2AM."
                  </p>
                </div>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  padding: '0.25rem', 
                  borderRadius: '0.5rem'
                }}>
                  <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    "I bridged to a chain I still can't pronounce — just for the yield."
                  </p>
                </div>
              </div>

              <p className="made-by" style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                🧠 Made by crypto psychologists (read: Crypto Twitter addicts)
              </p>

              <button onClick={startTest} className="start-button" style={{ margin: '0.5rem 0 1rem' }}>
                Start DegenMind Test
              </button>

              <p className="disclaimer" style={{ margin: '0.25rem 0' }}>
                By using this site, you acknowledge that none of this is financial advice, obviously.
              </p>

              <div style={{ 
                textAlign: 'center', 
                marginTop: '1rem',
                fontSize: '0.875rem'
              }}>
                <button 
                  onClick={() => setShowPersonalityTypes(true)}
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    width: '100%',
                    maxWidth: '300px'
                  }}
                >
                  View Degen Personality Types →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result Screen
  if (mbtiType) {
    const result = typeDescriptions[mbtiType];
    if (!result) {
      return (
        <div style={{ minHeight: '100vh', padding: '0.3rem 1rem' }}>
          <div className="card">
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Error
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Could not determine your personality type. Please try again.
              </p>
              <button 
                onClick={handleReset}
                className="reset-button"
              >
                Take Test Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Calculate scores for each dimension
    const calculateScores = () => {
      const dimensionScores = {
        DB: 0, // D vs B (Degen vs Builder)
        TV: 0, // T vs V (Trader vs Visionary)
        HE: 0, // H vs E (HODLer vs Exit Liquidity)
        OM: 0  // O vs M (Omni-Chain vs Maxi)
      };

      answers.forEach((answer, index) => {
        if (answer === undefined) return;
        const question = questions[index];
        const dimension = question.type;
        const isPositive = question.positiveType === dimension[0];
        dimensionScores[dimension] += isPositive ? answer : -answer;
      });

      return dimensionScores;
    };

    const scores = calculateScores();
    const allQuestionsAnswered = answers.length === questions.length;

    const tweetText = encodeURIComponent(
      `I'm a ${result.name} (${mbtiType}) on DegenMind! 🚀\n\n` +
      `Degen Dimension Breakdown:\n` +
      `• ${mbtiType[0] === 'D' ? 'Degen' : 'Builder'} (${Math.abs(scores.DB) * 20}%)\n` +
      `• ${mbtiType[1] === 'T' ? 'Trader' : 'Visionary'} (${Math.abs(scores.TV) * 20}%)\n` +
      `• ${mbtiType[2] === 'H' ? 'HODLer' : 'Exit Liquidity'} (${Math.abs(scores.HE) * 20}%)\n` +
      `• ${mbtiType[3] === 'M' ? 'Maxi' : 'Omni-Chain'} (${Math.abs(scores.OM) * 20}%)\n\n` +
      `Find your on-chain personality at DegenMind!`
    );
    const tweetURL = `https://twitter.com/intent/tweet?text=${tweetText}`;

    return (
      <div style={{ minHeight: '100vh', padding: '0.3rem 1rem' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Your DegenMind Result
            </h1>
            <div className="result-card">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#3b82f6' }}>
                {result.name}
              </h2>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#9ca3af' }}>
                {mbtiType}
              </h3>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                textAlign: 'left'
              }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                  Your Degen Dimensions:
                </h4>
                <DimensionBar 
                  label="Degen vs Builder"
                  value={mbtiType[0] === 'D' ? 'Degen' : 'Builder'}
                  score={scores.DB}
                />
                <DimensionBar 
                  label="Trader vs Visionary"
                  value={mbtiType[1] === 'T' ? 'Trader' : 'Visionary'}
                  score={scores.TV}
                />
                <DimensionBar 
                  label="HODLer vs Exit Liquidity"
                  value={mbtiType[2] === 'H' ? 'HODLer' : 'Exit Liquidity'}
                  score={scores.HE}
                />
                <DimensionBar 
                  label="Omni-Chain vs Maxi"
                  value={mbtiType[3] === 'M' ? 'Maxi' : 'Omni-Chain'}
                  score={scores.OM}
                />
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: '1.75' }}>
                {result.description}
              </p>
              {!allQuestionsAnswered && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                  Note: More answers would provide more accurate results
                </p>
              )}
            </div>
            <div className="button-group">
              {!allQuestionsAnswered && (
                <button 
                  onClick={() => {
                    setMbtiType(null);
                    setSelectedValue(answers[currentQuestion]);
                  }}
                  className="reset-button"
                >
                  Continue Test
                </button>
              )}
              <button 
                onClick={handleReset}
                className="reset-button"
              >
                Take Test Again
              </button>
              <a 
                href={tweetURL} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginTop: '0.5rem'
                }}
              >
                Share on X
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question Screen
  const q = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <>
      {showWarningModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 1000,
          height: '100vh',
          width: '100vw',
          paddingTop: '20vh'
        }}>
          <div style={{
            background: 'var(--card)',
            padding: '2rem',
            borderRadius: '1rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: 'var(--text)'
            }}>
              ⚠️ Early Results Warning
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              Viewing results before completing all questions may lead to less accurate results. You can still continue the test later to improve accuracy.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowWarningModal(false)}
                style={{
                  background: 'none',
                  border: '1px solid var(--text-secondary)',
                  color: 'var(--text-secondary)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResults}
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ minHeight: '100vh', padding: '0.3rem 1rem' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              DegenMind
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#9ca3af', marginBottom: '3rem' }}>
              Discover your on-chain personality
            </p>
            
            <div style={{ marginBottom: '2rem' }}>
              <p className="question-number">
                Question {currentQuestion + 1} of {questions.length}
              </p>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="question-container">
              <div className="question-text-container">
                <h2 className="question-text">{q.text}</h2>
              </div>
              <div className="likert-scale">
                {likertOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`likert-btn ${selectedValue === opt.value ? 'selected' : ''}`}
                    onClick={() => handleAnswer(opt.value)}
                  >
                    <div className="likert-circle" />
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
              <button 
                className="back-button"
                onClick={handleReset}
              >
                ← Home
              </button>
              {currentQuestion >= 11 && (
                <button 
                  style={{ 
                    position: 'absolute',
                    bottom: '-2rem',
                    right: '0',
                    background: 'var(--accent)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                  onClick={handleViewResults}
                >
                  View Results
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}