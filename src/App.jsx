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
    // We don't need to recalculate scores since calculateMBTI now returns normalized scores
    return { percentages: {} }; // Return empty for now, will be replaced by calculateMBTI's results
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
    const result = calculateMBTI(answers);
    const mbtiType = result.type;
    const calculatedPercentages = result.normalizedScores;

    // Debug logging to verify consistency
    console.log("MBTI Result Type:", mbtiType);
    console.log("Calculated Percentages:", calculatedPercentages);
    
    // Validate that the percentage-based types match the MBTI result
    const typeFromPercentages = 
      (calculatedPercentages.AB >= 50 ? 'A' : 'B') + 
      (calculatedPercentages.DP >= 50 ? 'D' : 'P') + 
      (calculatedPercentages.MO >= 50 ? 'M' : 'O') + 
      (calculatedPercentages.TN >= 50 ? 'T' : 'N');
    
    console.log("Type derived from percentages:", typeFromPercentages);
    console.log("Types match:", typeFromPercentages === mbtiType);

    if (mbtiType) {
      setMbtiType(mbtiType);
      setPercentages(calculatedPercentages);
      setShowResults(true);
      setShowQuiz(false);
      setAllQuestionsAnswered(true); // Mark as answered
      window.history.pushState(null, '', `?results=${mbtiType}`);
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

    const shareText = `My Crypto MBTI type is ${result.name} (${mbtiType})! 🚀\n\n${breakdown}\n\nFind yours: ${resultUrl}\n\n@CheckmateFDN #CryptoMBTI`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank');
  };

  // --- Render Logic --- 

  // --- Types Page View --- (Moved to be checked first)
  if (showTypesPage) {
    // Define Type Groups and Descriptions
    const typeGroups = [
      {
        name: "Strategists 🏗️", 
        combination: "(Builder + Diamond Hands)", 
        description: "Calculated, disciplined investors who carefully construct portfolios with a long-term vision, meticulous research, and patience.",
        codes: ['BDMT', 'BDMN', 'BDOT', 'BDON'] 
      },
      {
        name: "Diamond Explorers 💪", 
        combination: "(Ape + Diamond Hands)", 
        description: "Bold, confident adventurers who actively explore and accumulate across the crypto ecosystem, holding tightly through volatility and dips.",
        codes: ['ADMT', 'ADMN', 'ADOT', 'ADON'] 
      },
      {
        name: "Degens 🚀", 
        combination: "(Ape + Paper Hands)", 
        description: "High-risk, impulsive traders and flippers, driven by short-term gains, hype cycles, and adrenaline-fueled market actions.",
        codes: ['APMT', 'APMN', 'APOT', 'APON'] 
      },
      {
        name: "Cautious Nomads 🧭", 
        combination: "(Builder + Paper Hands)", 
        description: "Careful, pragmatic traders who navigate cautiously between assets and ecosystems, always prepared to reposition quickly to avoid losses or seize opportunities.",
        codes: ['BPMT', 'BPMN', 'BPOT', 'BPON']
      }
    ];

    // Map dimensions to their descriptions
    const dimensionDetails = {
      AB: "Risk: Ape vs Builder\nFearless, impulsive investors (Apes) eagerly jump into new trends without research, driven by hype. Cautious, strategic investors (Builders) conduct thorough research, prioritizing steady gains.",
      DP: "Holding: Diamond vs Paper\nResolute holders (Diamond) remain unwavering through volatility, seeing dips as opportunities. Reactive investors (Paper) quickly sell at signs of trouble, with low tolerance for uncertainty.",
      MO: "Chain: Maxi vs Omni\nDeeply loyal investors (Maxis) commit exclusively to one blockchain. Adventurous investors (Omni) explore and engage across multiple ecosystems, seeking opportunities everywhere.",
      TN: "Asset: Token vs NFT\nInvestors (Token) focus heavily on fungible tokens, drawn by yield and liquidity. Enthusiastic collectors (NFT) are driven by unique digital assets and their cultural/social prestige."
    };

    return (
      // Updated to white background with gradients like the rest of the app
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center text-gray-800 bg-white relative overflow-hidden"> 
        {/* Add subtle background elements */}
        <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-30 z-0"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-blue-100 to-transparent rounded-tr-full opacity-30 z-0"></div>
        
        {/* Back Button */} 
        <button 
           onClick={() => setShowTypesPage(false)}
           className="absolute top-4 left-4 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 z-20 bg-transparent border-none p-2"
           aria-label="Back to Home"
         >
           ← Back to Home
         </button>

        {/* Updated title with gradient */}
        <h1 className="text-3xl md:text-4xl font-bold mb-10 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text text-center z-10 mt-16">
          Understanding your Crypto Personality
        </h1>

        {/* Increased max-width for more content */} 
        <div className="w-full max-w-5xl mb-8 bg-white shadow-md rounded-xl p-6 md:p-8 relative z-10"> 
          {/* Updated Dimensions Section */} 
          <div className="mb-12 px-4"> 
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">The Four Dimensions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"> 
              {dimensions.map((dim, index) => {
                // Create an array of gradient classes for each dimension
                const gradients = [
                  "bg-gradient-to-r from-purple-50 to-white border-l-4 border-purple-400",
                  "bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-400",
                  "bg-gradient-to-r from-teal-50 to-white border-l-4 border-teal-400",
                  "bg-gradient-to-r from-indigo-50 to-white border-l-4 border-indigo-400"
                ];
                const titleColors = ["text-purple-700", "text-blue-700", "text-teal-700", "text-indigo-700"];
                
                return (
                  <div key={dim.key} className={`p-4 rounded-lg shadow-sm ${gradients[index]}`}>
                    <h3 className={`font-bold text-lg mb-2 ${titleColors[index]}`}>{dim.name}: {dim.type1} vs. {dim.type2}</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{dimensionDetails[dim.key].split('\n')[1]}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Updated Types Section with Groups */} 
          <div className="mb-6"> 
            <h2 className="text-2xl font-semibold mb-8 text-gray-800 text-center">The 16 Crypto Personalities</h2>
            {typeGroups.map((group, groupIndex) => {
              // Create an array of header gradient classes for each group
              const headerGradients = [
                "bg-gradient-to-r from-purple-100 to-purple-50 border-purple-200", 
                "bg-gradient-to-r from-blue-100 to-blue-50 border-blue-200",
                "bg-gradient-to-r from-teal-100 to-teal-50 border-teal-200", 
                "bg-gradient-to-r from-indigo-100 to-indigo-50 border-indigo-200"
              ];
              const headerTextColors = ["text-purple-700", "text-blue-700", "text-teal-700", "text-indigo-700"];
              const cardGradients = [
                "bg-gradient-to-br from-white to-purple-50 border-purple-100",
                "bg-gradient-to-br from-white to-blue-50 border-blue-100",
                "bg-gradient-to-br from-white to-teal-50 border-teal-100",
                "bg-gradient-to-br from-white to-indigo-50 border-indigo-100"
              ];
              
              return (
                <div key={group.name} className="mb-10"> 
                  <div className={`mb-6 px-4 py-4 ${headerGradients[groupIndex]} rounded-lg shadow-sm border`}> 
                    <h3 className={`text-xl md:text-2xl font-bold text-center mb-2 ${headerTextColors[groupIndex]}`}>{group.name}</h3>
                    <p className="text-sm italic text-center mb-3 text-gray-600">{group.combination}</p>
                    <p className="text-base text-center text-gray-700 max-w-2xl mx-auto">{group.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4"> 
                    {group.codes.map(code => {
                      const data = typeDescriptions[code];
                      if (!data) return null; // Skip if data missing
                      return (
                        <div key={code} className={`p-4 ${cardGradients[groupIndex]} rounded-lg shadow-sm border text-left flex flex-col h-full`}> 
                          <p className="font-bold text-lg mb-1 text-gray-800">{code} - {data.name}</p>
                          <p className="text-xs italic text-gray-600 mb-2">{data.tagline}</p> 
                          <p className="text-sm text-gray-700 flex-grow">{data.description}</p> 
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

         {/* Footer */} 
         <footer className="w-full text-center text-xs text-gray-600 mt-auto pb-4 z-10">
          <p className="mb-1">© 2025 Checkmate Foundation. All rights reserved</p>
          <div className="flex justify-center gap-4">
            <a href="https://checkmate.foundation/Checkmate%20Foundation%20-%20Terms%20of%20Use%20(D240513).pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 underline">Terms & Conditions</a>
            <a href="https://checkmate.foundation/Checkmate%20Foundation%20-%20Privacy%20Notice%20(D240513).pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 underline">Privacy Policy</a>
          </div>
        </footer>
      </div>
    );
  }

  // Home Screen (Check this *after* Types Page)
  if (!showQuiz && !showResults) { 
    return (
      // Enhanced with a subtle gradient background and decorative elements
      <div 
        className="container mx-auto px-4 min-h-screen flex flex-col justify-center items-center bg-white text-gray-800 home-container relative overflow-hidden"
      >
        {/* Add decorative elements in the background */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-bl-full opacity-50 z-0"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-to-tr from-blue-100 to-blue-200 rounded-tr-full opacity-50 z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-purple-300 opacity-30"></div>
        <div className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-blue-300 opacity-40"></div>
        <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-teal-300 opacity-30"></div>
        
        {/* Main Content Area */}
        <div className="w-full max-w-xl text-center z-10 pt-16 relative">
          {/* Add a subtle gradient card behind the main content */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white rounded-xl -z-10"></div>
          
          {/* Title with gradient text to match other pages */}
          <h1 className="text-4xl md:text-5xl font-bold mb-1 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text"> 
            Crypto MBTI
          </h1>
          {/* Subtitle with darker text - reduced bottom margin */}
          <p className="text-2xl md:text-3xl mb-4 text-gray-700"> 
            Free Crypto Personality Test
          </p>
          {/* Replace tagline with new content about 4 key traits - reduced margins and padding */}
          <div className="mb-6 max-w-md mx-auto text-left px-5 py-3 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center">What Shapes Your Crypto Personality?</h3>
            
            <div className="space-y-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-50 to-white">
                <p className="font-medium text-purple-700 text-sm">Risk Instinct:</p>
                <p className="text-gray-600 text-sm">Are you a fearless Ape, or a calculated Builder?</p>
              </div>
              
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-white">
                <p className="font-medium text-blue-700 text-sm">Holding Style:</p>
                <p className="text-gray-600 text-sm">Do you have Diamond Hands through the dips, or Paper Hands ready to exit?</p>
              </div>
              
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-teal-50 to-white">
                <p className="font-medium text-teal-700 text-sm">Chain Loyalty:</p>
                <p className="text-gray-600 text-sm">Are you a loyal Maxi, or an adventurous Omni explorer?</p>
              </div>
              
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-white">
                <p className="font-medium text-indigo-700 text-sm">Asset Identity:</p>
                <p className="text-gray-600 text-sm">Do you vibe with Tokens for gains, or NFTs for culture?</p>
              </div>
            </div>
          </div>
          
          {/* Button Area - Reduced top margin */}
          <div className="flex flex-col gap-4 items-center mt-8">
            <button
              onClick={() => startTest('lite')}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all w-64 shadow-md"
            >
              Lite Test (~2 mins)
            </button>
            <button
              onClick={() => startTest('standard')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all w-64 shadow-md"
            >
              Standard (~5 mins)
            </button>
            {/* Learn more button styled to match other secondary buttons */}
            <button 
              onClick={() => setShowTypesPage(true)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded-full transition-colors shadow-md focus:outline-none mt-4"
            >
              Learn about the 16 Personalities
            </button>
          </div>
        </div>

        {/* Footer - Updated text color for white background */}
        <footer className="w-full text-center text-xs text-gray-600 mt-auto pb-4 z-10">
          <p className="mb-1">© 2025 Checkmate Foundation. All rights reserved</p>
          <div className="flex justify-center gap-4">
            <a href="https://checkmate.foundation/Checkmate%20Foundation%20-%20Terms%20of%20Use%20(D240513).pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 underline">Terms & Conditions</a>
            <a href="https://checkmate.foundation/Checkmate%20Foundation%20-%20Privacy%20Notice%20(D240513).pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 underline">Privacy Policy</a>
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
           {/* Updated title */} 
           <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
              Your Crypto Personality
           </h1>
           <div className="result-card mb-6"> 
             {/* Reordered elements: MBTI code first, then name, then image, then tagline */}
             <h2 className="text-3xl font-bold mb-2 text-teal-600">
               {mbtiType}
             </h2>
             <h3 className="text-2xl font-semibold mb-4 text-black">
               {result.name}
             </h3>
             {result.imageUrl && (
               <img 
                 src={result.imageUrl} 
                 alt={`${result.name} avatar`} 
                 className="w-36 h-36 md:w-44 md:h-44 rounded-lg mx-auto mb-4 shadow-lg object-cover" 
               />
             )}
             <p className="text-base italic mb-4 text-gray-600">
               {result.tagline}
             </p>
             <p className="text-base leading-relaxed mb-4 text-gray-700 max-w-prose mx-auto">
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
            Crypto MBTI
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