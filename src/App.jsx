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

// Helper Components (Update Styles)
const DimensionBar = ({ label, score }) => {
  const percentage = Math.max(0, Math.min(100, score || 0));
  return (
    <div className="mb-4"> 
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-100 font-medium">{label}</span> {/* Light gray/white */} 
      </div>
      {/* Darker background for the bar track */}
      <div className="bg-slate-700/50 rounded h-2 overflow-hidden">
        <div 
          style={{ width: `${percentage}%` }} 
          // Brighter gradient for contrast
          className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full rounded transition-all duration-300 ease-in-out"
        />
      </div>
    </div>
  );
};

const ProgressBar = ({ current, total }) => {
  const progress = total > 0 ? (current / total) * 100 : 0;
  return (
    // Darker track
    <div className="w-4/5 mx-auto bg-slate-700/60 rounded-full h-2 my-4">
      <div 
        style={{ width: `${progress}%` }}
        // Brighter gradient
        className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full rounded-full transition-all duration-300 ease"
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

  // Effect to scroll to top when results are shown
  useEffect(() => {
    if (showResults) {
      window.scrollTo(0, 0);
    }
  }, [showResults]);

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
    if (!mbtiType) return; 
    
    const result = typeDescriptions[mbtiType]; 
    if (!result) {
        console.error(`Description for type ${mbtiType} not found for sharing.`);
        return; 
    }
    
    const breakdown = dimensions.map(dim => {
        const percent = percentages[dim.key] ?? 50;
        const type1 = dim.type1;
        const type2 = dim.type2;
        const isType1Dominant = percent >= 50;
        const dominantType = isType1Dominant ? type1 : type2;
        const dominantPercent = isType1Dominant ? percent : 100 - percent;
        return `${dim.emoji} ${dominantType}: ${dominantPercent}%`;
    }).join('\n');

    // Use window.location.href to get the full results URL
    const resultUrl = window.location.href; 

    const shareText = `My DegenType is ${result.name} (${mbtiType})! 🚀\n\n${breakdown}\n\nFind yours: ${resultUrl}\n\n@CheckmateFDN #CryptoMBTI #DegenType`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank');
  };

  // Home Screen
  if (!showQuiz && !showResults) {
    return (
      // Revert to standard dark background, image is now a separate element
      <div 
        className="container mx-auto px-4 pb-8 min-h-screen flex flex-col items-center justify-center text-white bg-gradient-to-b from-slate-800 to-slate-900 home-container"
      >
        {/* Content container - standard vertical flow */}
        <div className="home-content w-full max-w-xl text-center flex-grow flex flex-col justify-center relative z-10 pt-6 pb-12">
          {/* --- DegenType Title Moved OUTSIDE the image background container --- */}
          <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text leading-relaxed pb-2" > 
            DegenType
          </h1>

          {/* home-text container now relative, with padding - holds tagline and uncover text */}
          <div className="home-text mb-8 relative py-12 px-4 rounded-lg overflow-hidden shadow-lg"> 
            {/* Image Div: absolute positioned INSIDE home-text, behind text */} 
            <div 
              className="absolute inset-0 opacity-40 z-0" /* Opacity 40% */
              style={{
                backgroundImage: 'url(/home_background.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            {/* Lighter gray text */} 
            {/* Re-added text shadow for visibility */}
            <p className="tagline text-xl text-gray-200 mb-6 relative z-10 [text-shadow:1px_1px_2px_rgb(0_0_0_/_0.8)]"> 
              MBTI for Crypto Degens
            </p>
            {/* --- Re-added Text --- */}
            {/* Re-added text shadow for visibility */}
            <p className="text-base text-gray-300 mb-6 max-w-md mx-auto relative z-10 [text-shadow:1px_1px_2px_rgb(0_0_0_/_0.8)]">
              Uncover your on-chain personality in just a few questions.
            </p>
          </div>
          {/* --- Degen Dimensions List - Now follows home-text --- */}
          <div className="text-left max-w-md mx-auto px-4"> 
            <p className="text-base text-gray-300 mb-3">
              You'll be scored across four key crypto instincts:
            </p>
            <ul className="list-none space-y-2 text-sm text-gray-200">
              <li><span className="mr-2 text-lg">🧠</span> <span className="font-semibold">Risk:</span> Ape vs. Builder</li>
              <li><span className="mr-2 text-lg">💎</span> <span className="font-semibold">Holding:</span> Diamond Hands vs. Paper Hands</li>
              <li><span className="mr-2 text-lg">🌐</span> <span className="font-semibold">Chain:</span> Maxi vs. Omni</li>
              <li><span className="mr-2 text-lg">🪙</span> <span className="font-semibold">Asset:</span> Token vs. NFT</li>
            </ul>
          </div>
          {/* --- End Re-added Text / Dimension list --- */}

          {/* --- Buttons and Footer Section - Positioned normally AFTER the dimension list --- */}
          <div className="mt-8 relative z-10"> 
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
             <p className="text-sm text-gray-400 mb-8 text-center"> 
               <a href="https://x.com/CheckmateFDN" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline">
                 Follow us on X
               </a>
             </p>

             {/* Footer */} 
             <footer className="w-full text-center text-xs text-gray-400">
               <p className="mb-1">© 2025 Checkmate Foundation. All rights reserved</p>
               <div className="flex justify-center gap-4">
                 <a href="https://checkmate.foundation/Checkmate%20Foundation%20-%20Terms%20of%20Use%20(D240513).pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 underline">Terms & Conditions</a>
                 <a href="https://checkmate.foundation/Checkmate%20Foundation%20-%20Privacy%20Notice%20(D240513).pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 underline">Privacy Policy</a>
               </div>
             </footer>
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
      return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 text-white">Error: Result description not found. Please retake the quiz.</div>;
    }

    return (
      // Darker background
      <div className="container mx-auto px-4 pb-8 min-h-screen flex flex-col items-center justify-center text-white bg-gradient-to-b from-slate-800 to-slate-900 results-container">
        <div className="w-full max-w-2xl text-center p-4 md:p-6">
           {/* Title - Use accent gradient again? */}
           <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
              Your DegenType Result
           </h1>
           <div className="result-card mb-6"> 
             {result.imageUrl && (
               <img 
                 src={result.imageUrl} 
                 alt={`${result.name} avatar`} 
                 className="w-36 h-36 md:w-44 md:h-44 rounded-lg mx-auto mb-4 shadow-lg object-cover" 
               />
             )}
             {/* Adjust text colors for contrast */}
             <h2 className="text-3xl font-bold mb-1 text-teal-300"> {/* Brighter Accent */} 
               {mbtiType}
             </h2>
             <h3 className="text-2xl font-semibold mb-1 text-white">
               {result.name}
             </h3>
             <p className="text-base italic mb-2 text-gray-300"> {/* Lighter Gray */} 
               {result.tagline}
             </p>
             <p className="text-base leading-relaxed mb-4 text-gray-200 max-w-prose mx-auto"> {/* Lighter Gray */} 
               {result.description}
             </p>
             {/* Dimensions Box - Keep semi-transparent dark bg */}
             <div className="bg-slate-700/40 p-4 rounded-md mb-4 text-left max-w-md mx-auto">
               <h4 className="text-lg font-semibold mb-4 text-purple-300 text-center">Your Dimensions:</h4> {/* Keep Purple Accent */} 
               {dimensions.map(dim => {
                   const percent = percentages[dim.key] ?? 50;
                   const type1 = dim.type1;
                   const type2 = dim.type2;
                   const isType1Dominant = percent >= 50;
                   const dominantType = isType1Dominant ? type1 : type2;
                   const dominantPercent = isType1Dominant ? percent : 100 - percent;
                   const sentence = isType1Dominant 
                     ? dimensionSentences[dim.key]?.type1 
                     : dimensionSentences[dim.key]?.type2;
                   
                   return (
                     <div key={dim.key} className="mb-2 text-center"> 
                       <p className="text-base text-white mb-1">{sentence || `${dominantType} Tendency`}</p> 
                       <p className="text-xs text-gray-400"> {/* Muted detail text */} 
                         <span className="font-medium">{dim.name}</span> (
                           {/* Use teal for highlight? */}
                           {isType1Dominant ? <strong className="font-semibold text-teal-300">{type1}</strong> : type1}
                           {' vs '}
                           {!isType1Dominant ? <strong className="font-semibold text-teal-300">{type2}</strong> : type2}
                         ) - <span className='font-semibold'>{dominantPercent}%</span>
                       </p>
                     </div>
                   );
               })} 
             </div>
             {/* Note - Standard yellow might be fine */}
             {questions.length > 0 && !allQuestionsAnswered && (
               <p className="text-xs text-yellow-400 mt-4">
                 Note: Results based on {answers.filter(a => a !== undefined).length} of {questions.length} questions. Retake for full accuracy.
               </p>
             )}
           </div>
           {/* Update button styles for darker theme */}
           <div className="button-group mt-6 flex flex-col sm:flex-row justify-center gap-4">
             <button onClick={handleShare} className="share-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md">Share on X</button>
             <button onClick={handleRetakeQuiz} className="retake-button bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md">Take Test Again</button>
           </div>
        </div>
      </div>
    );
  }

  // Question Screen
  if (showQuiz && questions.length > 0) {
     return (
       // Darker background
       <div className="container relative mx-auto px-4 py-8 min-h-screen flex flex-col items-center text-white bg-gradient-to-b from-slate-800 to-slate-900 quiz-container">
         {/* Update Back button color */}
         <button 
           onClick={handleRetakeQuiz} 
           className="absolute top-4 left-4 text-sm text-gray-400 hover:text-gray-200 transition-colors duration-200 z-10 bg-transparent border-none p-2"
           aria-label="Back to Home"
         >
           ← Back to Home
         </button>

         {/* Title - Apply consistent homepage style */}
         <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text leading-relaxed pb-2">
            DegenType
         </h1>
         <ProgressBar current={answeredCount} total={questions.length} /> 
         <div className="w-full max-w-3xl px-4 py-6 question-card"> 
           {questionsOnCurrentPage.map((question, localIndex) => {
             const globalIndex = startIndex + localIndex;
             const isAnswered = answers[globalIndex] !== undefined;
             const isActive = globalIndex === firstUnansweredIndex;
             const isUpcoming = globalIndex > firstUnansweredIndex;
             const isPreviousAnswered = globalIndex === firstUnansweredIndex - 1;

             let containerClasses = "mb-8 pb-4";
             if (isUpcoming) {
               containerClasses += " opacity-50 pointer-events-none"; 
             } else if (isAnswered && !isActive && !isPreviousAnswered) {
               containerClasses += " opacity-60 pointer-events-none"; 
             } else if (isPreviousAnswered) {
                containerClasses += " opacity-80"; 
             }
             const allowInteraction = isActive || isPreviousAnswered;
             
             return (
               <div key={globalIndex} id={`question-${globalIndex}`} className={containerClasses}>
                 {/* Question text white unless faded */}
                 <h2 className={`question-text text-lg md:text-xl font-medium mb-4 text-center ${!allowInteraction && !isActive ? 'text-gray-500 opacity-70' : 'text-white'}`}>{globalIndex + 1}. {question.text}</h2>
                 <div className="likert-scale flex items-center justify-center gap-3 md:gap-4 my-4">
                   {/* Keep green/purple agree/disagree active, gray muted */}
                   <span className={`text-base font-medium ${allowInteraction ? 'text-green-400' : 'text-gray-500'}`}>Agree</span>
                   {likertOptions.map(option => {
                     const isSelected = answers[globalIndex] === option.value;
                     let size = 'w-6 h-6 md:w-7 md:h-7';
                     let baseBgColor = allowInteraction ? 'bg-slate-700/70' : 'bg-slate-800/50'; 
                     let hoverBgColor = allowInteraction ? 'hover:bg-slate-600' : '';
                     let baseBorderColor = allowInteraction ? 'border-gray-500' : 'border-gray-700';
                     let selectedBgColor = 'bg-purple-500'; 
                     let selectedBorderColor = 'border-purple-500';

                     if (option.value === 0) {
                       size = 'w-5 h-5 md:w-6 md:h-6';
                       selectedBgColor = 'bg-gray-400'; 
                       selectedBorderColor = 'border-gray-400';
                       if (allowInteraction) hoverBgColor = 'hover:bg-gray-400';
                     } else if (option.value > 0) {
                       selectedBgColor = 'bg-green-500'; 
                       selectedBorderColor = 'border-green-500';
                       if(allowInteraction) {
                          baseBorderColor = 'border-green-500';
                          hoverBgColor = 'hover:bg-green-700';
                       }
                       if (option.value === 2) size = 'w-8 h-8 md:w-9 md:h-9';
                     } else {
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
                         disabled={!allowInteraction}
                         className={`likert-circle-btn rounded-full border-2 transition-all duration-200 ease-in-out flex items-center justify-center 
                           ${size} 
                           ${isSelected ? selectedBorderColor : baseBorderColor} 
                           ${isSelected ? selectedBgColor : baseBgColor} 
                           ${!isSelected && allowInteraction ? hoverBgColor : ''} 
                           ${isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : ''} /* Adjusted ring offset color */
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
                   {/* Keep green/purple agree/disagree active, gray muted */}
                   <span className={`text-base font-medium ${allowInteraction ? 'text-purple-400' : 'text-gray-500'}`}>Disagree</span>
                 </div>
               </div>
             );
           })}
           {/* Update Nav button styles */} 
           <div className="navigation-buttons flex justify-between items-center mt-6">
             <button onClick={handleBack} disabled={currentPageIndex === 0} className="nav-button px-5 py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">Back</button>
             <p className="question-number text-sm text-gray-300">Page {currentPageIndex + 1} of {totalPages}</p>
             <button 
               onClick={handleNext} 
               disabled={!areAllQuestionsOnPageAnswered()}
               className="nav-button px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
             >
               {currentPageIndex === totalPages - 1 ? 'View Results' : 'Next'}
             </button>
           </div>
         </div>
       </div>
     );
  }

  // Fallback
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 text-white">Loading...</div>; 
}