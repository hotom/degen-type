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
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // New state
  const [questionsPerPage, setQuestionsPerPage] = useState(0); // New state
  const [showResults, setShowResults] = useState(false);
  const [mbtiType, setMbtiType] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false); // Will be set when results are shown

  const [percentages, setPercentages] = useState({});

  const dimensions = [
    { key: 'AB', name: 'Risk', type1: 'Ape', type2: 'Builder', emoji: '🦍/👷' },
    { key: 'DP', name: 'Holding', type1: 'Diamond', type2: 'Paper', emoji: '💎/📄' },
    { key: 'MO', name: 'Chain', type1: 'Maxi', type2: 'Omni', emoji: '⛓️/🌌' },
    { key: 'TN', name: 'Asset', type1: 'Token', type2: 'NFT', emoji: '🪙/🖼️' },
  ];

  // --- Calculate derived state early --- 
  const answeredCount = answers.filter(a => a !== undefined).length;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = currentPageIndex * questionsPerPage;
  const endIndex = Math.min(startIndex + questionsPerPage, questions.length);
  const questionsOnCurrentPage = questions.slice(startIndex, endIndex);

  // Find the global index of the first unanswered question
  const activeQuestionGlobalIndex = answers.findIndex(a => a === undefined);
  // If all answered, set to length to avoid issues, or -1 if no questions yet
  const firstUnansweredIndex = activeQuestionGlobalIndex === -1 && questions.length > 0 ? questions.length : activeQuestionGlobalIndex;

  // --- Effects --- 
  useEffect(() => {
    // Handle initial URL loading (simplified)
    const urlParams = new URLSearchParams(window.location.search);
    const resultsParam = urlParams.get('results');
    if (resultsParam && initialQuestions.length > 0) { 
      setMbtiType(resultsParam);
      setShowResults(true);
      setShowQuiz(false); 
    }
  }, []); // Run only once on mount

  // Effect to scroll to the TOP of the page when the page index changes
  useEffect(() => {
    if (showQuiz && questions.length > 0 && questionsPerPage > 0) {
      const elementId = `question-${startIndex}`;
      const element = document.getElementById(elementId);
      if (element) {
        // Use setTimeout to ensure DOM is updated after state changes
        setTimeout(() => {
           // Scroll the *first* question of the page into view
           element.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
        }, 50); // Short delay
      }
    }
    // Run only when page changes or quiz starts
  }, [currentPageIndex, showQuiz, questionsPerPage]); 

  // --- Handlers ---
  const startTest = (type) => {
    const selectedQuestions = getTestQuestions(type);
    const qpp = 4; // Set questions per page to 4 for both modes
    setTestType(type);
    setQuestions(selectedQuestions);
    setAnswers(Array(selectedQuestions.length).fill(undefined));
    setCurrentPageIndex(0);
    setQuestionsPerPage(qpp);
    setShowQuiz(true);
    setShowResults(false);
    setMbtiType(null);
    setPercentages({});
    window.history.pushState(null, '', `?test=${type}&page=1`); // Optional URL update
  };

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

    setPercentages(calculatedPercentages); // Store percentages
    return { percentages: calculatedPercentages }; // Return only percentages as scores are not used directly
  };

  const handleAnswer = (globalIndex, value) => {
    const newAnswers = [...answers];
    if (globalIndex >= 0 && globalIndex < questions.length) {
      newAnswers[globalIndex] = value;
      setAnswers(newAnswers);
      
      // --- Scroll to next question IF it's on the same page --- 
      const nextGlobalIndex = globalIndex + 1;
      // Check if the next question index is within the current page bounds (less than endIndex)
      if (nextGlobalIndex < endIndex) { 
        const nextQuestionElement = document.getElementById(`question-${nextGlobalIndex}`);
        if (nextQuestionElement) {
          // Use setTimeout to allow state update before scrolling
          setTimeout(() => {
            nextQuestionElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
          }, 100); 
        }
      }
      // If it's the last question on the page, do nothing - user clicks Next/View Results.
      // --- End scroll logic ---

    } else {
      console.error("Invalid globalIndex in handleAnswer:", globalIndex);
    }
  };

  const areAllQuestionsOnPageAnswered = () => {
    if (questions.length === 0) return false;
    for (let i = startIndex; i < endIndex; i++) {
      if (answers[i] === undefined) {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (areAllQuestionsOnPageAnswered()) {
      if (currentPageIndex < totalPages - 1) {
        setCurrentPageIndex(currentPageIndex + 1);
        window.history.pushState(null, '', `?test=${testType}&page=${currentPageIndex + 2}`); // Optional URL update
      } else {
        // This is the last page, trigger results view
        handleViewResults(true);
      }
    } else {
      // Optionally alert the user to answer all questions
      alert('Please answer all questions on this page before proceeding.');
    }
  };

  const handleBack = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      window.history.pushState(null, '', `?test=${testType}&page=${currentPageIndex}`); // Optional URL update
    }
  };

  const handleViewResults = (force = true) => {
    const resultType = calculateMBTI(answers);
    const { percentages: calculatedPercentages } = calculateScores(); // Use the active questions

    if (resultType) {
      setMbtiType(resultType);
      setPercentages(calculatedPercentages);
      setShowResults(true);
      setShowQuiz(false);
      setAllQuestionsAnswered(true); // Mark as answered
      window.history.pushState(null, '', `?results=${resultType}`);
    } else {
      console.error("Failed to calculate MBTI type.");
    }
  };

  const handleRetakeQuiz = () => {
    setTestType(null); 
    setQuestions([]);
    setAnswers([]);
    setCurrentPageIndex(0);
    setQuestionsPerPage(0);
    setShowResults(false);
    setMbtiType(null);
    setShowQuiz(false); 
    setPercentages({});
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
           <div className="result-card mb-6"> 
             {/* Add Image Display */}
             {result.imageUrl && (
               <img 
                 src={result.imageUrl} 
                 alt={`${result.name} avatar`} 
                 className="w-48 h-48 md:w-56 md:h-56 rounded-lg mx-auto mb-4 shadow-lg object-cover" 
               />
             )}

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
  if (showQuiz && questions.length > 0) {
     // Note: We use questionsOnCurrentPage for rendering this page's questions
     return (
       // Add relative positioning to the container for absolute positioning of the button
       <div className="container relative mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center text-white bg-gray-900 quiz-container">
         {/* Add Back to Home Button */}
         <button 
           onClick={handleRetakeQuiz} 
           className="absolute top-4 left-4 text-sm text-gray-400 hover:text-gray-200 transition-colors duration-200 z-10 bg-transparent border-none p-2"
           aria-label="Back to Home"
         >
           ← Back to Home
         </button>

         <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text" style={{ lineHeight: '1.2', paddingBottom: '0.25rem' }}>
            DegenType
         </h1>
         {/* Progress bar shows overall question progress */}
         <ProgressBar current={answeredCount} total={questions.length} /> 
         <div className="card bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-3xl question-card"> {/* Wider card */}
           <p className="question-number text-sm text-gray-400 mb-4">Page {currentPageIndex + 1} of {totalPages}</p>
           {/* Map over questions for the current page */}
           {questionsOnCurrentPage.map((question, localIndex) => {
             const globalIndex = startIndex + localIndex;
             const isAnswered = answers[globalIndex] !== undefined;
             const isActive = globalIndex === firstUnansweredIndex;
             const isUpcoming = globalIndex > firstUnansweredIndex;
             // NEW: Check if it's the immediately preceding answered question
             const isPreviousAnswered = globalIndex === firstUnansweredIndex - 1;

             // Determine container classes based on state
             let containerClasses = "mb-6 pb-6 border-b border-gray-700 last:border-b-0 last:mb-0 last:pb-0 transition-opacity duration-300 ease-in-out";
             if (isUpcoming) {
               containerClasses += " opacity-50 pointer-events-none"; 
             } else if (isAnswered && !isActive && !isPreviousAnswered) {
               // Older answered questions (not the previous one) are faded and non-interactive
               containerClasses += " opacity-60 pointer-events-none"; 
             } else if (isPreviousAnswered) {
                // Slightly fade the previous question, but keep it interactive
                containerClasses += " opacity-80"; 
             }
             // Active question has full opacity and is interactive by default

             // Determine if buttons should be interactive
             const allowInteraction = isActive || isPreviousAnswered;
             
             return (
               <div key={globalIndex} id={`question-${globalIndex}`} className={containerClasses}>
                 <h2 className={`question-text text-md md:text-lg font-medium mb-4 text-gray-100 ${!allowInteraction && !isActive ? 'text-gray-500' : ''}`}>{globalIndex + 1}. {question.text}</h2>
                 <div className="likert-scale flex items-center justify-center gap-3 md:gap-4 my-4">
                   {/* Mute Agree/Disagree labels if interaction not allowed */}
                   <span className={`text-sm font-medium ${allowInteraction ? 'text-green-400' : 'text-gray-500'}`}>Agree</span>
                   {likertOptions.map(option => {
                     const isSelected = answers[globalIndex] === option.value;
                     // Define styles, considering allowInteraction
                     let size = 'w-6 h-6 md:w-7 md:h-7';
                     let baseBgColor = allowInteraction ? 'bg-gray-700' : 'bg-gray-800'; 
                     let hoverBgColor = allowInteraction ? 'hover:bg-gray-500' : ''; 
                     let baseBorderColor = allowInteraction ? 'border-gray-500' : 'border-gray-600';
                     let selectedBgColor = 'bg-purple-500'; 
                     let selectedBorderColor = 'border-purple-500';

                     if (option.value === 0) { // Neutral
                       size = 'w-5 h-5 md:w-6 md:h-6';
                       selectedBgColor = 'bg-gray-400'; 
                       selectedBorderColor = 'border-gray-400';
                       if (allowInteraction) hoverBgColor = 'hover:bg-gray-400';
                     } else if (option.value > 0) { // Agree side
                       selectedBgColor = 'bg-green-500'; 
                       selectedBorderColor = 'border-green-500';
                       if(allowInteraction) {
                          baseBorderColor = 'border-green-500';
                          hoverBgColor = 'hover:bg-green-700';
                       }
                       if (option.value === 2) size = 'w-8 h-8 md:w-9 md:h-9';
                     } else { // Disagree side
                       selectedBgColor = 'bg-purple-500';
                       selectedBorderColor = 'border-purple-500';
                       if(allowInteraction) {
                         baseBorderColor = 'border-purple-500';
                         hoverBgColor = 'hover:bg-purple-700';
                       }
                       if (option.value === -2) size = 'w-8 h-8 md:w-9 md:h-9';
                     }
                     
                     return (
                       <button
                         key={option.value}
                         title={option.label}
                         disabled={!allowInteraction} // Disable button if interaction not allowed
                         className={`likert-circle-btn rounded-full border-2 transition-all duration-200 ease-in-out flex items-center justify-center 
                           ${size} 
                           ${isSelected ? selectedBorderColor : baseBorderColor} 
                           ${isSelected ? selectedBgColor : baseBgColor} 
                           ${!isSelected && allowInteraction ? hoverBgColor : ''} 
                           ${isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}
                           ${!allowInteraction ? 'cursor-not-allowed' : 'cursor-pointer'} 
                         `}
                         onClick={() => handleAnswer(globalIndex, option.value)}
                       >
                         {isSelected && (
                           <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                             <path d="M5 13l4 4L19 7"></path>
                           </svg>
                         )}
                       </button>
                     );
                   })}
                   {/* Mute Agree/Disagree labels if interaction not allowed */}
                   <span className={`text-sm font-medium ${allowInteraction ? 'text-purple-400' : 'text-gray-500'}`}>Disagree</span>
                 </div>
               </div>
             );
           })}
           <div className="navigation-buttons flex justify-between mt-6">
             <button onClick={handleBack} disabled={currentPageIndex === 0} className="nav-button px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">Back</button>
             <button 
               onClick={handleNext} 
               disabled={!areAllQuestionsOnPageAnswered()} 
               className="nav-button px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
             >
               {currentPageIndex === totalPages - 1 ? 'View Results' : 'Next'}
             </button>
           </div>
         </div>
       </div>
     );
  }

  // Fallback
  return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>; 
}