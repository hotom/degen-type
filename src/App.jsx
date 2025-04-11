import React, { useState, useEffect } from 'react';
import { questions, typeDescriptions, likertOptions } from './data';
import { calculateMBTI } from './calculateType';

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [mbtiType, setMbtiType] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showPersonalityTypes, setShowPersonalityTypes] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [userName, setUserName] = useState('');

  // Calculate scores for each dimension
  const calculateScores = () => {
    const dimensionScores = {
      DB: 0,
      TV: 0,
      HE: 0,
      OM: 0
    };

    const answeredQuestions = {
      DB: 0,
      TV: 0,
      HE: 0,
      OM: 0
    };

    // Calculate scores based on Likert scale values (-2 to +2)
    answers.forEach((answer, index) => {
      if (answer === undefined || answer === null) return; // Skip unanswered questions
      
      const question = questions[index];
      const dimension = question.type;
      const isPositive = question.positiveType === dimension[0];
      
      dimensionScores[dimension] += isPositive ? answer : -answer;
      answeredQuestions[dimension]++;
    });

    // Calculate percentages based on max possible score
    const percentages = {};
    Object.keys(dimensionScores).forEach(dimension => {
      const questionsAnswered = answeredQuestions[dimension];
      if (questionsAnswered === 0) {
        percentages[dimension] = 0;
      } else {
        // Each question can contribute -2 to +2 points
        const maxPossibleScore = questionsAnswered * 2;
        // Get absolute value of score and calculate percentage
        const absoluteScore = Math.abs(dimensionScores[dimension]);
        // Convert to percentage (0-100)
        percentages[dimension] = Math.round((absoluteScore / maxPossibleScore) * 100);
      }
    });

    return { dimensionScores, percentages };
  };

  useEffect(() => {
    // Handle initial URL params
    const urlParams = new URLSearchParams(window.location.search);
    const questionParam = urlParams.get('q');
    const resultsParam = urlParams.get('results');

    if (resultsParam) {
      // If results in URL, show results directly
      setMbtiType(resultsParam);
      setShowResults(true);
      setShowIntro(false);
    } else if (questionParam) {
      // If question number in URL, show that question
      const questionNumber = parseInt(questionParam);
      if (questionNumber > 0 && questionNumber <= questions.length) {
        setCurrentQuestion(questionNumber - 1);
        setShowIntro(false);
      }
    }
  }, []);

  const handleStartTest = () => {
    setShowIntro(false);
    setCurrentQuestion(0);
    // Update URL to show first question
    window.history.pushState({}, '', '?q=1');
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // Update URL to show current question
      window.history.pushState({}, '', `?q=${currentQuestion + 2}`);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      // Update URL to show current question
      window.history.pushState({}, '', `?q=${currentQuestion}`);
    }
  };

  const handleReset = () => {
    // Reset all state variables
    setShowResults(false);
    setShowIntro(true);
    setCurrentQuestion(null);
    setAnswers([]);
    setMbtiType(null);
    setSelectedValue(null);
    setShowWarningModal(false);
    
    // Reset URL to home
    window.history.pushState({}, '', '/');
  };

  const handleViewResults = (force = false) => {
    if (!force && answers.length < questions.length) {
      setShowWarningModal(true);
      return;
    }
    
    const result = calculateMBTI(answers);
    if (result) {
      setMbtiType(result);
      setShowResults(true);
      window.history.pushState({}, '', `?results=${result}`);
    }
  };

  const handleConfirmResults = () => {
    setShowWarningModal(false);
    handleViewResults(true);
  };

  // Add popstate event listener to handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const questionParam = urlParams.get('q');
      const resultsParam = urlParams.get('results');

      if (resultsParam) {
        setShowResults(true);
      } else if (questionParam) {
        const questionNumber = parseInt(questionParam);
        if (questionNumber > 0 && questionNumber <= questions.length) {
          setCurrentQuestion(questionNumber - 1);
          setShowIntro(false);
        }
      } else {
        // No params means home
        setShowIntro(true);
        setShowResults(false);
        setCurrentQuestion(0);
        setAnswers(new Array(questions.length));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
        // Update URL to show next question
        window.history.pushState({}, '', `?q=${currentQuestion + 2}`);
      }
    }, 300);
  };

  const handleShare = () => {
    const url = window.location.origin;
    const result = typeDescriptions[mbtiType];
    const { dimensionScores, percentages } = calculateScores();
    
    const shareText = `I'm a ${mbtiType} (${result.name}) on DegenType! 🚀\n\n` +
      `Degen Dimension Breakdown:\n` +
      `• ${mbtiType[0] === 'D' ? 'Degen' : 'Builder'} (${percentages.DB}%)\n` +
      `• ${mbtiType[1] === 'T' ? 'Trader' : 'Visionary'} (${percentages.TV}%)\n` +
      `• ${mbtiType[2] === 'H' ? 'HODLer' : 'Exit Liquidity'} (${percentages.HE}%)\n` +
      `• ${mbtiType[3] === 'M' ? 'Maxi' : 'Omni-Chain'} (${percentages.OM}%)\n\n` +
      `Find your on-chain personality at ${url}\n\n` +
      `#DegenType #Web3MBTI`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank');
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
    alignItems: 'center',
    marginBottom: '0.5rem',
    fontSize: '1rem',
    fontWeight: '500'
  };

  const progressBarStyle = {
    width: '100%',
    height: '8px',
    backgroundColor: '#374151',
    borderRadius: '4px',
    position: 'relative',
    overflow: 'hidden'
  };

  const progressFillStyle = {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '4px',
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

  const DimensionBar = ({ label, value, score }) => {
    const isPositive = score >= 0;
    const [leftLabel, rightLabel] = label.split(' vs ');
    
    // Calculate percentage the same way as calculateScores
    const questionsAnswered = answers.filter((answer, index) => {
      const question = questions[index];
      return question.type === label.split(' ')[0].charAt(0) + label.split(' ')[2].charAt(0) && answer !== undefined;
    }).length;
    
    const maxPossibleScore = questionsAnswered * 2;
    const absoluteScore = Math.abs(score);
    const percentage = questionsAnswered > 0 ? Math.round((absoluteScore / maxPossibleScore) * 100) : 0;
    
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem',
          fontSize: '1.1rem',
          fontWeight: '500'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
            <span style={{ 
              color: isPositive ? '#3b82f6' : '#6b7280',
              fontWeight: isPositive ? '600' : '400',
              minWidth: '120px'
            }}>{leftLabel}</span>
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>vs</span>
            <span style={{ 
              color: !isPositive ? '#3b82f6' : '#6b7280',
              fontWeight: !isPositive ? '600' : '400',
              minWidth: '120px'
            }}>{rightLabel}</span>
          </div>
          <span style={{ 
            color: '#3b82f6',
            fontWeight: '600',
            marginLeft: '1rem'
          }}>{percentage}%</span>
        </div>
        <div style={{ 
          width: '100%',
          height: '10px',
          backgroundColor: '#1f2937',
          borderRadius: '5px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute',
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: '#3b82f6',
            borderRadius: '5px',
            left: isPositive ? '0' : `${100 - percentage}%`,
            transition: 'all 0.3s ease'
          }} />
        </div>
      </div>
    );
  };

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
                  {[
                    'DTVM', 'DTEO', 'DTEM', 'DTEH', 
                    'DTHO', 'DTHM', 'DTVO', 'DTVH',
                    'DTOM', 'DTOH', 'DTEV'
                  ].map(code => (
                    <TypeCard key={code} code={code} type={typeDescriptions[code]} />
                  ))}
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>🧱 Builder Types</h3>
                  {[
                    'BHVM', 'BHVO', 'BHEM', 'BHEO',
                    'BVEO', 'BVEH', 'BVEM', 'BVHM',
                    'BVHO'
                  ].map(code => (
                    <TypeCard key={code} code={code} type={typeDescriptions[code]} />
                  ))}
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>💹 Trader Types</h3>
                  {[
                    'BTHE', 'BTVE', 'BTHM', 'BTEO',
                    'BTVO', 'BTHO', 'BTEM'
                  ].map(code => (
                    <TypeCard key={code} code={code} type={typeDescriptions[code]} />
                  ))}
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>🔨 Builder Visionaries</h3>
                  {[
                    'BTOM', 'BTVM', 'BTVH', 'BTOH'
                  ].map(code => (
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
                DegenType
              </h1>
              <p className="tagline" style={{ margin: '1rem 0 0.5rem' }}>
                MBTI for the Web3 degens
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

              <button onClick={handleStartTest} className="start-button" style={{ margin: '0.5rem 0 1rem' }}>
                Start DegenType Test
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

              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                marginTop: '1rem'
              }}>
                {currentQuestion > 0 ? (
                  <button 
                    className="back-button"
                    onClick={handleBack}
                  >
                    ← Previous
                  </button>
                ) : (
                  <button 
                    className="back-button"
                    onClick={handleReset}
                    style={{
                      position: 'absolute',
                      left: '0',
                      bottom: '-3rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    ← Back to Home
                  </button>
                )}
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

    const { dimensionScores, percentages } = calculateScores();
    const allQuestionsAnswered = answers.length === questions.length;

    return (
      <div style={{ minHeight: '100vh', padding: '0.3rem 1rem' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Your DegenType Result
            </h1>
            <div className="result-card">
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#3b82f6' }}>
                {mbtiType}
              </h2>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#9ca3af' }}>
                {result.name}
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
                  score={dimensionScores.DB}
                />
                <DimensionBar 
                  label="Trader vs Visionary"
                  value={mbtiType[1] === 'T' ? 'Trader' : 'Visionary'}
                  score={dimensionScores.TV}
                />
                <DimensionBar 
                  label="HODLer vs Exit Liquidity"
                  value={mbtiType[2] === 'H' ? 'HODLer' : 'Exit Liquidity'}
                  score={dimensionScores.HE}
                />
                <DimensionBar 
                  label="Omni-Chain vs Maxi"
                  value={mbtiType[3] === 'M' ? 'Maxi' : 'Omni-Chain'}
                  score={dimensionScores.OM}
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
              <button 
                onClick={handleShare}
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  display: 'inline-block',
                  marginTop: '0.5rem'
                }}
              >
                Share on X
              </button>
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
              DegenType
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#9ca3af', marginBottom: '3rem' }}>
              Discover your Web3 Personality
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
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                marginTop: '2rem'
              }}>
                {currentQuestion === 0 ? (
                  <button 
                    onClick={handleReset}
                    style={{
                      background: 'none',
                      border: '1px solid var(--text-secondary)',
                      color: 'var(--text-secondary)',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ← Back to Home
                  </button>
                ) : (
                  <button 
                    className="back-button"
                    onClick={handleBack}
                  >
                    ← Previous
                  </button>
                )}
              </div>
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