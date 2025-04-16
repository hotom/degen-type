import React, { useState, useEffect } from 'react';
import { questions as initialQuestions, likertOptions, typeDescriptions } from './data'; // Re-added typeDescriptions import
import { calculateMBTI } from './calculateType';
import './index.css'; // Explicitly setting correct import path

// Function to get questions based on test type
const getTestQuestions = (type) => {
  if (type === 'standard') {
    return initialQuestions; // Return all 40 questions
  }
  if (type === 'lite') {
    const liteQuestions = [];
    const questionsPerType = 3;
    const types = ['A', 'B', 'D', 'P', 'M', 'O', 'T', 'N'];

    types.forEach(positiveType => {
      const filtered = initialQuestions.filter(q => q.positiveType === positiveType);
      liteQuestions.push(...filtered.slice(0, questionsPerType));
    });
    // Simple shuffle to mix axes a bit (optional but recommended)
    for (let i = liteQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [liteQuestions[i], liteQuestions[j]] = [liteQuestions[j], liteQuestions[i]];
    }
    return liteQuestions; // Return 24 questions (3 per positiveType)
  }
  return []; // Default empty
};

// Helper Components (Defined outside App)
const DimensionBar = ({ label, score }) => {
  const percentage = Math.max(0, Math.min(100, score || 0));
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.875rem' }}>{label}</span>
      </div>
      <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
        <div 
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
            height: '100%',
            borderRadius: '4px 0 0 4px',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};

const ProgressBar = ({ current, total }) => {
  const progress = total > 0 ? (current / total) * 100 : 0;
  return (
    <div style={{ width: '80%', margin: '1rem auto', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', height: '8px' }}>
      <div 
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
          height: '100%',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }}
      />
    </div>
  );
};

// Moved sentence mapping outside the component
const dimensionSentences = {
  AB: { type1: "You like Aping into Crypto", type2: "You prefer to Build in Crypto" },
  DP: { type1: "You are Diamond Hands on your assets", type2: "You tend to have Paper Hands" },
  MO: { type1: "You are more of a Chain Maxi", type2: "You explore across Omni-chain" },
  TN: { type1: "You prefer Tokens over NFTs", type2: "You prefer NFTs over Tokens" },
};

export default function App() {
  const [testType, setTestType] = useState(null); // 'lite', 'standard', or null
  const [questions, setQuestions] = useState([]); // Initialize empty
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [mbtiType, setMbtiType] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  // State for new axis scores and percentages
  const [dimensionScores, setDimensionScores] = useState({});
  const [percentages, setPercentages] = useState({});

  // NEW: Define the axes for the new framework
  const dimensions = [
    { key: 'AB', name: 'Risk', type1: 'Ape', type2: 'Builder', emoji: '🦍/👷' },
    { key: 'DP', name: 'Holding', type1: 'Diamond', type2: 'Paper', emoji: '💎/📄' },
    { key: 'MO', name: 'Chain', type1: 'Maxi', type2: 'Omni', emoji: '⛓️/🌌' },
    { key: 'TN', name: 'Asset', type1: 'Token', type2: 'NFT', emoji: '🪙/🖼️' },
  ];

  // Function to start a specific test type
  const startTest = (type) => {
    const selectedQuestions = getTestQuestions(type);
    setTestType(type);
    setQuestions(selectedQuestions);
    setAnswers(Array(selectedQuestions.length).fill(undefined));
    setCurrentQuestionIndex(0);
    setShowQuiz(true);
    setShowResults(false);
    setMbtiType(null);
    setPercentages({});
    setDimensionScores({});
    // Maybe update URL here if desired, e.g., `?test=${type}`
  };

  // Function to calculate scores and percentages (needs to be adapted)
  const calculateScores = () => {
    const scores = {
      AB: 0, DP: 0, MO: 0, TN: 0
    };
    const maxScorePerDimension = questions.filter(q => q.type === 'AB').length * 2; // Assuming max Likert value is 2
    // Recalculate scores based on answers
    answers.forEach((answer, index) => {
      if (answer === undefined || index >= questions.length) return;
      const question = questions[index];
      if (!question || !scores.hasOwnProperty(question.type)) return;
      const positiveTypeValue = question.type[0];
      const scoreChange = question.positiveType === positiveTypeValue ? answer : -answer;
      scores[question.type] += scoreChange;
    });

    // Calculate percentages
    const calculatedPercentages = {};
    dimensions.forEach(dim => {
      const relevantQuestions = questions.filter(q => q.type === dim.key);
      const numQuestions = relevantQuestions.length;
      if (numQuestions === 0) {
        calculatedPercentages[dim.key] = 50; // Default to neutral if no questions
        return;
      }
      const maxPossibleScore = numQuestions * 2; // Max positive swing
      const totalScoreRange = maxPossibleScore * 2; // Full range from min to max

      const score = scores[dim.key] || 0;
      // Corrected normalization: (score + max) / (2 * max)
      const normalizedScore = (score + maxPossibleScore) / totalScoreRange;
      
      calculatedPercentages[dim.key] = Math.round(normalizedScore * 100);
    });

    setDimensionScores(scores); // Store raw scores if needed
    setPercentages(calculatedPercentages); // Store percentages
    return { dimensionScores: scores, percentages: calculatedPercentages }; // Return both
  };

  useEffect(() => {
    // Handle initial URL params
    const urlParams = new URLSearchParams(window.location.search);
    const resultsParam = urlParams.get('results');
    // Maybe add logic here if you want to directly link to results
    if (resultsParam && initialQuestions.length > 0) { // Ensure questions are available
      setMbtiType(resultsParam);
      // Need to determine which test was taken or assume standard for score calc?
      // For simplicity, let's assume standard if directly linking to results
      // OR maybe don't calculate scores/percentages on direct result link?
      // Let's just show the type and description for now if linking directly.
      setShowResults(true);
      setShowQuiz(false); 
    }
  }, []); // Run only once on mount

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    if (currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
      newAnswers[currentQuestionIndex] = value;
      setAnswers(newAnswers);
      
      if (currentQuestionIndex === questions.length - 1) {
        // Last question answered
        setTimeout(() => handleViewResults(true), 100);
      } else {
        // Move to next question
        setTimeout(() => handleNext(), 300);
      }
    } else {
      console.error("Invalid currentQuestionIndex:", currentQuestionIndex);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleViewResults = (force = true) => { // Default force to true now
    const resultType = calculateMBTI(answers);
    const { percentages: calculatedPercentages } = calculateScores(); // Use the active questions

    if (resultType) {
      setMbtiType(resultType);
      setPercentages(calculatedPercentages);
      setShowResults(true);
      setShowQuiz(false); // Hide quiz screen
      setAllQuestionsAnswered(true); // Mark as answered
      window.history.pushState(null, '', `?results=${resultType}`);
    } else {
      console.error("Failed to calculate MBTI type.");
    }
  };

  const handleRetakeQuiz = () => {
    setTestType(null); // Go back to test selection
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setMbtiType(null);
    setShowQuiz(false); // Show home screen
    setShowAllTypes(false);
    setPercentages({});
    setDimensionScores({});
    window.history.pushState(null, '', window.location.pathname);
  };

  const handleShare = () => {
    if (!mbtiType) return; // Ensure results are available
    
    // Fetch updated type descriptions when needed (will be added later)
    const result = typeDescriptions[mbtiType]; 
    // For now, just use the type code
    
    // Use calculated percentages
    const breakdown = dimensions.map(dim => {
        const percent = percentages[dim.key] ?? 50; // Default to 50 if not calculated
        const type1 = dim.type1;
        const type2 = dim.type2;
        return `${dim.emoji} ${dim.name}: ${percent}% ${type1} / ${100 - percent}% ${type2}`;
    }).join('\n');

    const shareText = `My DegenType is ${mbtiType}! 🚀\n\nMy Dimensions:\n${breakdown}\n\nFind yours: ${window.location.origin}`;
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

  // Personality Types Screen
  if (showAllTypes) {
    return (
      <div style={{ minHeight: '100vh', padding: '0.3rem 1rem' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => setShowAllTypes(false)}
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
  if (!showQuiz && !showResults) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center text-white bg-gray-900 home-container">
        <div className="home-content w-full max-w-lg text-center">
          <div className="home-text">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text" style={{ lineHeight: '1.2', paddingBottom: '0.25rem' }}>
              DegenType
            </h1>
            <p className="tagline text-lg text-gray-300 mb-4">
              MBTI for Crypto Degens
            </p>
            <p className="text-base text-gray-200 mb-6 max-w-md mx-auto">
              Uncover your on-chain personality in just a few questions.
              Are you a fearless Ape, a loyal Maxi, or a JPEG-loving Paper Hand?
            </p>
            <div className="text-left max-w-md mx-auto mb-8 px-4">
              <p className="text-base text-gray-200 mb-3">
                You'll be scored across four key crypto instincts:
              </p>
              <ul className="list-none space-y-2 text-sm text-gray-300">
                <li><span className="mr-2">🧠</span> <span className="font-semibold">Risk:</span> Ape vs. Builder</li>
                <li><span className="mr-2">💎</span> <span className="font-semibold">Holding:</span> Diamond Hands vs. Paper Hands</li>
                <li><span className="mr-2">🌐</span> <span className="font-semibold">Chain:</span> Maxi vs. Omni</li>
                <li><span className="mr-2">🪙</span> <span className="font-semibold">Asset:</span> Token vs. NFT</li>
              </ul>
            </div>
            <div className="flex flex-col gap-4 items-center mb-8">
              <button
                onClick={() => startTest('lite')}
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity w-64 shadow-lg"
              >
                Lite Test (~2 mins)
              </button>
              <button
                onClick={() => startTest('standard')}
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity w-64 shadow-lg"
              >
                Standard (~5 mins)
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-3 max-w-md mx-auto">
              Take the quiz. Meet your DegenType. Compare with friends.
            </p>
            <p className="text-sm text-gray-300 max-w-md mx-auto">
              And yes — your results may be used against you on Crypto Twitter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Result Screen
  if (showResults && mbtiType) {
    const result = typeDescriptions[mbtiType];
    if (!result) {
      console.error(`Description for type ${mbtiType} not found!`);
      return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Error: Result description not found. Please retake the quiz.</div>;
    }

    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center text-white bg-gray-900 results-container">
        <div className="card bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl text-center">
           {/* Title with gradient */}
           <h1 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text" style={{ lineHeight: '1.2', paddingBottom: '0.25rem' }}>
              Your DegenType Result
           </h1>
           <div className="result-card mb-6"> {/* Added margin bottom */}
             {/* Type Code - Larger, bolder */}
             <h2 className="text-3xl font-bold mb-2 text-blue-400">
               {mbtiType}
             </h2>
             {/* Type Name - Slightly larger, bold */}
             <h3 className="text-xl font-semibold mb-2 text-gray-100">
               {result.name}
             </h3>
             {/* Tagline - Italic, gray */}
             <p className="text-base italic mb-4 text-gray-400">
               {result.tagline}
             </p>
             {/* Description - Smaller, lighter gray */}
             <p className="text-sm leading-relaxed mb-6 text-gray-300 max-w-prose mx-auto"> {/* Centered max-width */}
               {result.description}
             </p>
             {/* Dimensions Box - Styled background, padding, rounded */} 
             <div className="bg-gray-700/50 p-4 rounded-md mb-6 text-left max-w-md mx-auto"> 
               {/* Centered Heading */}
               <h4 className="text-md font-semibold mb-4 text-purple-300 text-center">Your Dimensions:</h4> 
               {dimensions.map(dim => {
                   // Calculate values
                   const percent = percentages[dim.key] ?? 50;
                   const type1 = dim.type1;
                   const type2 = dim.type2;
                   const isType1Dominant = percent >= 50;
                   const dominantType = isType1Dominant ? type1 : type2;
                   const dominantPercent = isType1Dominant ? percent : 100 - percent;
                   // Get sentence using the mapping defined outside
                   const sentence = isType1Dominant 
                     ? dimensionSentences[dim.key]?.type1 
                     : dimensionSentences[dim.key]?.type2;
                   
                   return (
                     <div key={dim.key} className="mb-4 text-center"> 
                       <p className="text-base text-gray-100 mb-1">{sentence || `${dominantType} Tendency`}</p> 
                       <p className="text-xs text-gray-400">
                         <span className="font-medium">{dim.name}</span> (
                           {isType1Dominant ? <strong className="text-blue-400 font-semibold">{type1}</strong> : type1}
                           {' vs '}
                           {!isType1Dominant ? <strong className="text-blue-400 font-semibold">{type2}</strong> : type2}
                         ) - <span className='font-semibold'>{dominantPercent}%</span>
                       </p>
                     </div>
                   );
               })} 
             </div>
             {/* Note - Smaller, warning color */} 
             {questions.length > 0 && !allQuestionsAnswered && (
               <p className="text-xs text-yellow-500 mt-4">
                 Note: Results based on {answers.filter(a => a !== undefined).length} of {questions.length} questions. Retake for full accuracy.
               </p>
             )}
           </div>
           {/* Buttons - Styled consistently */} 
           <div className="button-group mt-6 flex flex-col sm:flex-row justify-center gap-4">
             <button onClick={handleShare} className="share-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md">Share on X</button>
             <button onClick={handleRetakeQuiz} className="retake-button bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md">Take Test Again</button>
           </div>
        </div>
      </div>
    );
  }

  // Question Screen
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center text-white bg-gray-900 quiz-container">
      <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text" style={{ lineHeight: '1.2', paddingBottom: '0.25rem' }}>
        DegenType
      </h1>
      <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />
      <div className="card bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl question-card">
        <p className="question-number text-sm text-gray-400 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <h2 className="question-text text-lg md:text-xl font-medium mb-6 text-gray-100">{currentQuestion?.text || 'Loading question...'}</h2>
        <div className="likert-scale flex flex-wrap justify-center gap-2 mb-6">
          {likertOptions.map(option => (
            <button
              key={option.value}
              className={`likert-btn ${answers[currentQuestionIndex] === option.value ? 'selected' : ''}`}
              onClick={() => handleAnswer(option.value)}
            >
              <div className="likert-circle" /> 
              <span className="text-sm">{option.label}</span> 
            </button>
          ))}
        </div>
        <div className="navigation-buttons flex justify-between mt-4">
          <button onClick={handleBack} disabled={currentQuestionIndex === 0} className="nav-button px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">Back</button>
          <button onClick={handleNext} disabled={answers[currentQuestionIndex] === undefined || currentQuestionIndex === questions.length - 1} className="nav-button px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}