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
  const [showTypesPage, setShowTypesPage] = useState(false); // <-- New State

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

  // --- Render Logic --- 

  // --- Types Page View --- (Moved to be checked first)
  if (showTypesPage) {
    return (
      // Reverted background to sky-500, text to white
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center text-white bg-sky-500"> 
        {/* Reverted Back button text color */} 
        <button 
           onClick={() => setShowTypesPage(false)}
           className="absolute top-4 left-4 text-sm text-gray-200 hover:text-white transition-colors duration-200 z-10 bg-transparent border-none p-2"
           aria-label="Back to Home"
         >
           ← Back to Home
         </button>

        {/* Added Wrapper Div for layered effect */} 
        <div className="w-full max-w-4xl mt-16 mb-8 bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-xl"> 
          {/* Reverted Title color */} 
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">Understanding DegenTypes</h1>
          
          {/* Dimensions Section */} 
          <div className="mb-12 px-4"> 
            {/* Reverted Title color */} 
            <h2 className="text-2xl font-semibold mb-4 text-white text-center">The Four Dimensions</h2>
            {/* Reverted List text color */} 
            <ul className="space-y-2 text-lg max-w-md mx-auto text-left text-gray-100"> 
              {dimensions.map(dim => (
                <li key={dim.key}>
                  <span className="font-bold">{dim.name}:</span> {dim.type1} vs. {dim.type2}
                </li>
              ))}
            </ul>
          </div>

          {/* Types Section */} 
          <div> 
            {/* Reverted Title color */} 
            <h2 className="text-2xl font-semibold mb-6 text-white text-center">The 16 DegenTypes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4"> 
              {Object.entries(typeDescriptions).map(([code, data]) => (
                // Reverted card background and text colors 
                <div key={code} className="p-4 bg-sky-700/50 rounded-lg shadow text-left flex flex-col h-full"> 
                  <p className="font-bold text-lg mb-1 text-white">{code} - {data.name}</p>
                  <p className="text-xs italic text-sky-200 mb-2">{data.tagline}</p> 
                  <p className="text-sm text-gray-200 flex-grow">{data.description}</p> 
                </div>
              ))}
            </div>
          </div>
        </div>

         {/* Footer - Reverted text colors */} 
         <footer className="w-full text-center text-xs text-gray-100 mt-auto pb-4 z-10 [text-shadow:1px_1px_1px_rgb(0_0_0_/_0.5)]">
          <p className="mb-1">© 2025 Checkmate Foundation. All rights reserved</p>
          <div className="flex justify-center gap-4">
            <a href="https://checkmate.foundation/Checkmate%20Foundation%20-%20Terms%20of%20Use%20(D240513).pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">Terms & Conditions</a>
            <a href="https://checkmate.foundation/Checkmate%20Foundation%20-%20Privacy%20Notice%20(D240513).pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">Privacy Policy</a>
          </div>
        </footer>
      </div>
    );
  }

  // Home Screen (Check this *after* Types Page)
  if (!showQuiz && !showResults) { 
    return (
      // New layout: Full background image, content centered with padding
      // Changed justify-end back to justify-center, removed pb-32
      <div 
        className="container mx-auto px-4 min-h-screen flex flex-col justify-center items-center text-white home-container relative" 
        style={{
          backgroundImage: 'url(/home_background_v2.jpg)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Removed Overlay Div */}

        {/* Main Content Area - Centered Horizontally and Vertically */}
        {/* Reduced top padding pt-60 -> pt-16 */} 
        <div className="w-full max-w-xl text-center z-10 pt-16">
          {/* Text Content - White with Shadow */}
          {/* Title Line 1 */}
          <h1 className="text-4xl md:text-5xl font-bold mb-1 text-white [text-shadow:1px_1px_2px_rgb(0_0_0_/_0.6)]"> {/* Reduced mb-4 to mb-1 */} 
            DegenType
          </h1>
          {/* Title Line 2 - Smaller */}
          <p className="text-2xl md:text-3xl mb-8 text-white [text-shadow:1px_1px_2px_rgb(0_0_0_/_0.6)]"> {/* New line, smaller size */} 
            MBTI for Crypto Degens
          </p>
          {/* Tagline */}
          <p className="text-lg md:text-xl mb-8 text-white [text-shadow:1px_1px_2px_rgb(0_0_0_/_0.6)]"> 
            Find your crypto personality
          </p>

          {/* Button Area - Positioned below text */}
          <div className="flex flex-col gap-4 items-center mt-20">
            <button
              onClick={() => startTest('lite')}
              // Lighter sky blue background
              className="bg-sky-400 hover:bg-sky-500 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors w-64 shadow-lg"
            >
              Lite Test (~2 mins)
            </button>
            <button
              onClick={() => startTest('standard')}
              // Darker sky blue background
              className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors w-64 shadow-lg"
            >
              Standard (~5 mins)
            </button>
            {/* Restyled button */}
            <button 
              onClick={() => setShowTypesPage(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-4 py-1 rounded-full transition-colors shadow focus:outline-none mt-4"
            >
              Learn about the 16 DegenTypes
            </button>
          </div>
        </div>

        {/* Footer - Pushed to bottom by parent flex */}
        <footer className="w-full text-center text-xs text-gray-100 mt-auto pb-4 z-10 [text-shadow:1px_1px_1px_rgb(0_0_0_/_0.5)]">
          <p className="mb-1">© 2025 Checkmate Foundation. All rights reserved</p>
          <div className="flex justify-center gap-4">
            <a href="https://checkmate.foundation/Checkmate%20Foundation%20-%20Terms%20of%20Use%20(D240513).pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">Terms & Conditions</a>
            <a href="https://checkmate.foundation/Checkmate%20Foundation%20-%20Privacy%20Notice%20(D240513).pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">Privacy Policy</a>
          </div>
        </footer>
      </div>
    );
  }

  // Result Screen
  if (showResults && mbtiType) {
    const result = typeDescriptions[mbtiType];
    if (!result) {
      console.error(`Description for type ${mbtiType} not found!`);
      // Revert fallback to white bg
      return <div className="min-h-screen flex items-center justify-center bg-white text-red-600">Error: Result description not found. Please retake the quiz.</div>; 
    }

    return (
      // Revert background to white, default text to dark gray
      <div className="container mx-auto px-4 pb-8 min-h-screen flex flex-col items-center justify-center text-gray-800 bg-white results-container">
        <div className="w-full max-w-2xl text-center p-4 md:p-6">
           {/* Title - Gradient is fine */} 
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
             {/* Reverted text colors for white background */}
             <h2 className="text-3xl font-bold mb-1 text-teal-600"> {/* Darker Teal */} 
               {mbtiType}
             </h2>
             <h3 className="text-2xl font-semibold mb-1 text-black"> {/* Black */} 
               {result.name}
             </h3>
             <p className="text-base italic mb-2 text-gray-600"> {/* Darker Gray */} 
               {result.tagline}
             </p>
             <p className="text-base leading-relaxed mb-4 text-gray-700 max-w-prose mx-auto"> {/* Darker Gray */} 
               {result.description}
             </p>
             {/* Dimensions Box - Light gray background */} 
             <div className="bg-gray-100 p-4 rounded-md mb-4 text-left max-w-md mx-auto">
               <h4 className="text-lg font-semibold mb-4 text-purple-600 text-center">Your Dimensions:</h4> {/* Darker Purple */} 
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
                       <p className="text-base text-gray-800 mb-1">{sentence || `${dominantType} Tendency`}</p> {/* Dark text */} 
                       <p className="text-xs text-gray-600"> {/* Darker detail text */} 
                         <span className="font-medium">{dim.name}</span> (
                           {/* Darker teal for highlight */} 
                           {isType1Dominant ? <strong className="font-semibold text-teal-600">{type1}</strong> : type1}
                           {' vs '}
                           {!isType1Dominant ? <strong className="font-semibold text-teal-600">{type2}</strong> : type2}
                         ) - <span className='font-semibold'>{dominantPercent}%</span>
                       </p>
                     </div>
                   );
               })} 
             </div>
             {/* Note - Darker yellow */}
             {questions.length > 0 && !allQuestionsAnswered && (
               <p className="text-xs text-yellow-600 mt-4"> {/* Darker Yellow */} 
                 Note: Results based on {answers.filter(a => a !== undefined).length} of {questions.length} questions. Retake for full accuracy.
               </p>
             )}
           </div>
           {/* Reverted Retake button style */} 
           <div className="button-group mt-6 flex flex-col sm:flex-row justify-center gap-4">
             <button onClick={handleShare} className="share-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md">Share on X</button>
             <button onClick={handleRetakeQuiz} className="retake-button bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md">Take Test Again</button>
           </div>
        </div>
      </div>
    );
  }

  // Question Screen
  if (showQuiz && questions.length > 0) {
     return (
       // Changed background to white, default text to dark gray
       <div className="container relative mx-auto px-4 py-8 min-h-screen flex flex-col items-center text-gray-800 bg-white quiz-container">
         {/* Updated Back button color */} 
         <button 
           onClick={handleRetakeQuiz} 
           className="absolute top-4 left-4 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 z-10 bg-transparent border-none p-2"
           aria-label="Back to Home"
         >
           ← Back to Home
         </button>

         {/* Title - Gradient should be fine */} 
         <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text leading-relaxed pb-2">
            DegenType
         </h1>
         {/* Updated Progress Bar Track */} 
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
                 {/* Updated Question text color */} 
                 <h2 className={`question-text text-lg md:text-xl font-medium mb-4 text-center ${!allowInteraction && !isActive ? 'text-gray-400 opacity-70' : 'text-gray-900'}`}>{globalIndex + 1}. {question.text}</h2>
                 <div className="likert-scale flex items-center justify-center gap-3 md:gap-4 my-4">
                   {/* Updated Agree/Disagree text colors */} 
                   <span className={`text-base font-medium ${allowInteraction ? 'text-green-600' : 'text-gray-400'}`}>Agree</span>
                   {likertOptions.map(option => {
                     const isSelected = answers[globalIndex] === option.value;
                     let size = 'w-6 h-6 md:w-7 md:h-7';
                     // --- Updated Likert Button Colors for White BG --- 
                     let baseBgColor = allowInteraction ? 'bg-gray-100' : 'bg-gray-50'; 
                     let hoverBgColor = allowInteraction ? 'hover:bg-gray-200' : '';
                     let baseBorderColor = allowInteraction ? 'border-gray-300' : 'border-gray-200';
                     let selectedBgColor = 'bg-purple-500'; 
                     let selectedBorderColor = 'border-purple-500';
                     let textColor = 'text-white'; // Default for selected

                     if (option.value === 0) {
                       size = 'w-5 h-5 md:w-6 md:h-6';
                       selectedBgColor = 'bg-gray-400'; 
                       selectedBorderColor = 'border-gray-400';
                       if (allowInteraction) hoverBgColor = 'hover:bg-gray-300'; 
                     } else if (option.value > 0) {
                       selectedBgColor = 'bg-green-500'; 
                       selectedBorderColor = 'border-green-500';
                       if(allowInteraction) {
                          baseBorderColor = 'border-green-400'; // Lighter border for base
                          hoverBgColor = 'hover:bg-green-100'; // Light hover
                          baseBgColor = 'bg-green-50'; // Light base bg
                       }
                       if (option.value === 2) size = 'w-8 h-8 md:w-9 md:h-9';
                     } else { // value < 0
                       selectedBgColor = 'bg-purple-500';
                       selectedBorderColor = 'border-purple-500';
                       if(allowInteraction) {
                         baseBorderColor = 'border-purple-400'; // Lighter border for base
                         hoverBgColor = 'hover:bg-purple-100'; // Light hover
                         baseBgColor = 'bg-purple-50'; // Light base bg
                       }
                       if (option.value === -2) size = 'w-8 h-8 md:w-9 md:h-9';
                     }
                     // --- End Updated Colors --- 
                     
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
                           ${isSelected ? 'ring-2 ring-offset-2 ring-offset-white ring-indigo-500' : ''} /* Adjusted ring offset color */ 
                           ${!allowInteraction ? 'cursor-not-allowed' : 'cursor-pointer'} 
                         `}
                         onClick={() => handleAnswer(globalIndex, option.value)}
                       >
                         {isSelected && (
                           <svg className={`w-4 h-4 ${textColor}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                             <path d="M5 13l4 4L19 7"></path>
                           </svg>
                         )}
                       </button>
                     );
                   })}
                   {/* Updated Agree/Disagree text colors */} 
                   <span className={`text-base font-medium ${allowInteraction ? 'text-purple-600' : 'text-gray-400'}`}>Disagree</span>
                 </div>
               </div>
             );
           })}
           {/* Updated Nav button styles */} 
           <div className="navigation-buttons flex justify-between items-center mt-6">
             {/* Updated Back button style */} 
             <button onClick={handleBack} disabled={currentPageIndex === 0} className="nav-button px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">Back</button>
             {/* Updated Page indicator text */} 
             <p className="question-number text-sm text-gray-600">Page {currentPageIndex + 1} of {totalPages}</p>
             {/* Kept Next button style */} 
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
  return <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">Loading...</div>; // Updated fallback
}