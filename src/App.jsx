import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // <-- Import supabase
import { questions as initialQuestions, likertOptions, typeDescriptions } from './data'; // Removed dimensionSentences import
import { calculateMBTI } from './calculateType';
import './index.css'; // Explicitly setting correct import path
import AuthModal from './components/AuthModal'; // Import AuthModal
import Login from './components/Login';       // Import Login
import Register from './components/Register'; // Import Register
import ErrorBoundary from './components/ErrorBoundary'; // <-- Import ErrorBoundary
import ProgressBar from './components/ProgressBar'; // <-- Re-added import
// import ProgressBar from './components/ProgressBar'; // Assuming ProgressBar was externalized or correctly defined <-- REMOVED

// Function to get questions based on test type
const getTestQuestions = (type) => {
  if (type === 'standard') {
    return initialQuestions; // Return all 40 questions
  }
  if (type === 'lite') {
    const liteQuestions = [];
    const questionsPerSide = 3; // Questions per side of each dimension
    const dimensions = ['AB', 'DP', 'MO', 'TN'];

    dimensions.forEach(dimension => {
      // Get questions for first type (e.g., A, D, M, T)
      const firstTypeQuestions = initialQuestions
        .filter(q => q.type === dimension && q.positiveType === dimension[0])
        .slice(0, questionsPerSide);
      
      // Get questions for second type (e.g., B, P, O, N)
      const secondTypeQuestions = initialQuestions
        .filter(q => q.type === dimension && q.positiveType === dimension[1])
        .slice(0, questionsPerSide);
      
      // Add both sets of questions
      liteQuestions.push(...firstTypeQuestions, ...secondTypeQuestions);
    });

    // Shuffle questions within each dimension to mix them up
    for (let i = 0; i < dimensions.length; i++) {
      const startIdx = i * (questionsPerSide * 2);
      const endIdx = startIdx + (questionsPerSide * 2);
      const dimensionQuestions = liteQuestions.slice(startIdx, endIdx);
      
      // Shuffle this dimension's questions
      for (let j = dimensionQuestions.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [dimensionQuestions[j], dimensionQuestions[k]] = [dimensionQuestions[k], dimensionQuestions[j]];
      }
      
      // Put shuffled questions back
      liteQuestions.splice(startIdx, dimensionQuestions.length, ...dimensionQuestions);
    }

    console.log('[getTestQuestions - Lite] Selected questions:', liteQuestions);
    return liteQuestions; // Return 24 questions (3 per side of each dimension)
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

// Moved sentence mapping outside the component
// const dimensionSentences = {  // <-- REMOVE THIS DECLARATION
//   AB: { type1: "You like Aping into Crypto", type2: "You prefer to Build in Crypto" },
//   DP: { type1: "You are Diamond Hands on your assets", type2: "You tend to have Paper Hands" },
//   MO: { type1: "You are more of a Chain Maxi", type2: "You explore across Omni-chain" },
//   TN: { type1: "You prefer Tokens over NFTs", type2: "You prefer NFTs over Tokens" },
// };

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

  // --- New Authentication State ---
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [pendingTestType, setPendingTestType] = useState(null); // Store test type while login occurs
  // --- New State for Guest Results --- 
  const [guestResultData, setGuestResultData] = useState(null);
  // --- New state to store initial ref code ---
  const [initialReferralCode, setInitialReferralCode] = useState(null);
  // --- State for Previous Results ---
  const [previousResults, setPreviousResults] = useState([]);
  const [loadingPreviousResults, setLoadingPreviousResults] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false); // To toggle history view
  // --- State for Profile Dropdown ---
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isReferralCopied, setIsReferralCopied] = useState(false);
  // --- State for Leaderboard ---
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [showLeaderboardPage, setShowLeaderboardPage] = useState(false);
  // --- End State ---
  const [emailConfirmed, setEmailConfirmed] = useState(false); // New state for email confirmation
  const [loginSuccess, setLoginSuccess] = useState(false); // Add this new state
  const [logoutSuccess, setLogoutSuccess] = useState(false); // Add this new state

  const dimensions = [
    { key: 'AB', name: 'Risk Instinct', type1: 'Ape', type2: 'Builder', emoji: '🦍/👷' },
    { key: 'DP', name: 'Holding Style', type1: 'Diamond', type2: 'Paper', emoji: '💎/📄' },
    { key: 'MO', name: 'Chain Loyalty', type1: 'Maxi', type2: 'Omni', emoji: '⛓️/🌌' },
    { key: 'TN', name: 'Asset Identity', type1: 'Token', type2: 'NFT', emoji: '🪙/🖼️' },
  ];

  // Restore dimensionSentences definition here
  const dimensionSentences = {
    AB: { type1: "You like Aping into Crypto", type2: "You prefer to Build in Crypto" },
    DP: { type1: "You are Diamond Hands on your assets", type2: "You tend to have Paper Hands" },
    MO: { type1: "You are more of a Chain Maxi", type2: "You explore across Omni-chain" },
    TN: { type1: "You prefer Tokens over NFTs", type2: "You prefer NFTs over Tokens" },
  };  

  // --- Define Type Groups ---
  const typeGroups = [
    {
      title: "Strategists",
      description: "Thesis-driven long-term thinkers. They build with conviction, research deeply, and hold through the noise. \"Play the long game. Think five moves ahead.\"",
      types: ["BDMT", "BDMN", "BDOT", "BDON"] // Builder + Diamond Hands
    },
    {
      title: "Degens",
      description: "Fearless risk-takers with unshakable conviction. They ape into trends early and ride them to Valhalla — or rekt. \"Aped at launch. Still holding.\"",
      types: ["ADMT", "ADMN", "ADOT", "ADON"] // Ape + Diamond Hands
    },
    {
      title: "Diamond Explorers",
      description: "Curious and adaptive. They bridge chains, chase alpha, and never stay in one place too long. \"Bridge now. Think later.\"",
      types: ["APOT", "APON", "BPOT", "BPON"] // Paper Hands + Omni-chain Focus (Ape/Builder + Paper + Omni) - Note: Corrected description based on types
    },
    {
      title: "Cautious Nomads",
      description: "Contradictory but relatable. Cautious with their bags, yet oddly loyal to one chain. Caught between conviction and FOMO. \"I won't sell… unless it dumps.\"",
      types: ["APMT", "APMN", "BPMT", "BPMN"] // Paper Hands + Maxi Focus (Ape/Builder + Paper + Maxi) - Note: Corrected description based on types
    }
  ];
  // --- End Type Groups ---

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
    console.log('[Auth] Setting up auth state change listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[Auth] Auth state changed:', { event: _event, userId: session?.user?.id });
      setSession(session);

      // Check for email confirmation
      if (_event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        // Check if this is a new confirmation
        const confirmationTime = new Date(session.user.email_confirmed_at).getTime();
        const now = new Date().getTime();
        const isNewConfirmation = (now - confirmationTime) < 5000; // Within last 5 seconds
        
        console.log('[Auth] SIGNED_IN event details:', {
          event: _event,
          confirmationTime,
          now,
          isNewConfirmation,
          userId: session.user.id,
          metadata: session.user.user_metadata
        });

        if (isNewConfirmation) {
          console.log('[Auth] New email confirmation detected, creating user record...');
          setEmailConfirmed(true);
          setTimeout(() => setEmailConfirmed(false), 4000);
          
          try {
            // Check if user record already exists
            const { data: existingUser, error: checkError } = await supabase
              .from('users')
              .select('id')
              .eq('auth_user_id', session.user.id)
              .single();

            if (checkError && checkError.code !== 'PGRST116') {
              console.error('[Auth] Error checking existing user:', checkError);
              return;
            }

            if (!existingUser) {
              console.log('[Auth] No existing user record found, creating new record...');
              // Generate a referral code
              const generatedCode = Math.random().toString(36).substring(2, 7).toUpperCase();
              
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  auth_user_id: session.user.id,
                  username: session.user.user_metadata.username,
                  referral_code: generatedCode,
                  referred_by: session.user.user_metadata.referred_by || null,
                  points: 0
                });

              if (insertError) {
                console.error('[Auth] Error creating user record:', insertError);
              } else {
                console.log('[Auth] User record created successfully');
              }
            } else {
              console.log('[Auth] User record already exists:', existingUser);
            }
          } catch (error) {
            console.error('[Auth] Error handling email confirmation:', error);
          }
        }
      }
    });

    return () => {
      console.log('[Auth] Cleaning up auth state change listener...');
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // --- Supabase Auth Listener --- 
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth event:", _event, session);
      setSession(session); // Set session immediately

      // Check for email confirmation
      if (_event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        // Check if this is a new confirmation
        const confirmationTime = new Date(session.user.email_confirmed_at).getTime();
        const now = new Date().getTime();
        const isNewConfirmation = (now - confirmationTime) < 5000; // Within last 5 seconds
        
        console.log('[Auth] SIGNED_IN event details:', {
          event: _event,
          confirmationTime,
          now,
          isNewConfirmation,
          userId: session.user.id,
          metadata: session.user.user_metadata
        });

        if (isNewConfirmation) {
          setEmailConfirmed(true);
          setTimeout(() => setEmailConfirmed(false), 4000);
          
          // Create user record after email confirmation
          try {
            console.log('[Auth] Checking for existing user record...');
            const { data: existingUser, error: checkError } = await supabase
              .from('users')
              .select('id')
              .eq('auth_user_id', session.user.id)
              .single();

            if (checkError) {
              console.log('[Auth] Check existing user result:', { error: checkError });
            }

            if (!existingUser) {
              console.log('[Auth] No existing user found, creating new record...');
              // Generate a referral code
              const generatedCode = Math.random().toString(36).substring(2, 7).toUpperCase();
              
              const newUser = {
                auth_user_id: session.user.id,
                username: session.user.user_metadata.username,
                referral_code: generatedCode,
                referred_by: session.user.user_metadata.referred_by || null,
                points: 0
              };
              
              console.log('[Auth] Attempting to create user record:', newUser);

              // Create the user record
              const { data: insertData, error: insertError } = await supabase
                .from('users')
                .insert(newUser)
                .select()
                .single();

              if (insertError) {
                console.error('[Auth] Error creating user record:', insertError);
              } else {
                console.log('[Auth] Successfully created user record:', insertData);
              }
            } else {
              console.log('[Auth] Existing user found:', existingUser);
            }
          } catch (error) {
            console.error('[Auth] Error handling email confirmation:', error);
          }
        }
      } else if (_event === 'SIGNED_IN') {
        // Show login success message for any sign in that's not an email confirmation
        setLoginSuccess(true);
        // Clear success message after 4 seconds
        setTimeout(() => setLoginSuccess(false), 4000);
      } else if (_event === 'SIGNED_OUT') {
        // Show logout success message
        setLogoutSuccess(true);
        // Clear success message after 4 seconds
        setTimeout(() => setLogoutSuccess(false), 4000);
      }

      if (session?.user) {
        // --- Add Delay --- 
        console.log('[onAuthStateChange] User detected, setting loading and scheduling profile fetch...');
        setLoadingProfile(true); // Set loading BEFORE the timeout
        const userId = session.user.id;
        setTimeout(() => {
          console.log(`[onAuthStateChange] Timeout finished, calling fetchUserProfile for ${userId}`);
          fetchUserProfile(userId); // Call fetch after a short delay
        }, 100); // 100ms delay
        // --- End Delay --- 
        
      } else {
        setUserProfile(null); // Clear profile on logout
        setLoadingProfile(false); // Ensure loading is false on logout
      }
    });

    // Initial session check
    const checkInitialSession = async () => {
      console.log("[Initial Check] Checking for existing session...");
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("[Initial Check] Error getting session:", error.message);
        setLoadingProfile(false); // Ensure loading stops if session check fails
        return;
      }
      console.log("[Initial Check] Session found:", initialSession ? initialSession.user.id : null);
      setSession(initialSession);
      if (initialSession?.user) {
        console.log("[Initial Check] Session exists, fetching profile...");
        await fetchUserProfile(initialSession.user.id); // Fetch profile if session exists on load
      } else {
        console.log("[Initial Check] No session, setting loading false.");
        setLoadingProfile(false); // No session, profile loading is done (it's null)
      }

      // --- Handle initial URL params ONCE --- 
    const urlParams = new URLSearchParams(window.location.search);
    const resultsParam = urlParams.get('results');
      const refParam = urlParams.get('ref'); // Get ref code

      if (refParam) {
        setInitialReferralCode(refParam.toUpperCase()); // Store initial ref code
        console.log("[Initial Check] Stored initial referral code:", refParam.toUpperCase());
      }

      if (resultsParam && initialQuestions.length > 0) {
      setMbtiType(resultsParam);
      setShowResults(true);
        setShowQuiz(false);
      } 
      // We don't need the history replace state logic here anymore as URL changes during quiz/results naturally
      // --- End initial URL param handling ---
    };
    checkInitialSession();

    // Cleanup listener on component unmount
    return () => {
      console.log("[Cleanup] Unsubscribing from auth state changes.");
      subscription?.unsubscribe();
    };
  }, []); // Run only once on mount
  
  // --- Effect to close modal and start test AFTER profile is loaded ---
  useEffect(() => {
    if (!loadingProfile && session) {
      console.log('[Effect] Login/Profile load sequence finished.');
      
      if (showAuthModal) {
         console.log('[Effect] Closing auth modal.');
         setShowAuthModal(false); 
      }

      // --- Check for Guest Data to Save --- 
      if (guestResultData && userProfile) { // Make sure profile is loaded before saving
        console.log('[Effect] Detected guest data and logged-in user, attempting to save...');
        saveGuestResult(guestResultData);
        
        // After saving guest result, show the results
        if (guestResultData.type) {
          setMbtiType(guestResultData.type);
          setPercentages(guestResultData.percentages);
          setShowResults(true);
          setShowQuiz(false);
          setAllQuestionsAnswered(true);
          window.history.pushState(null, '', `?results=${guestResultData.type}`);
        }
      } 
      // --- End Check --- 
      
      else if (pendingTestType) { // Only start pending test if guest data wasn't just saved
        console.log(`[Effect] Initiating pending test: ${pendingTestType}`);
        initiateTest(pendingTestType);
        setPendingTestType(null); 
      }
    } 
  }, [session, userProfile, loadingProfile, pendingTestType, guestResultData]); // Add guestResultData and userProfile to dependencies

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

  // --- Helper Functions ---
  const fetchUserProfile = async (authUserId) => {
    console.log(`[fetchUserProfile] Fetching profile for auth_user_id: ${authUserId}`);
    let profileData = null;
    let queryError = null;
    let queryStatus = null;

    try {
      console.log('[fetchUserProfile] Executing Supabase query with .single()...');
      // --- Revert to original query --- 
      const { data, error, status } = await supabase
        .from('users')
        .select(`id, username, referral_code, points, referred_by`)
        .eq('auth_user_id', authUserId)
        .single();
      // --- End Revert --- 
      
      queryError = error;
      queryStatus = status;
      console.log(`[fetchUserProfile] Query result - Status: ${status}, Error: ${JSON.stringify(error)}, Data:`, data);

      if (error && status !== 406) { // Status 406 from .single() means no row found
        console.error('[fetchUserProfile] Supabase query error (excluding 406):', error);
      } else if (data) { // Data is now an object or null
        profileData = data;
        console.log('[fetchUserProfile] Profile data found:', profileData);
      } else {
        console.log('[fetchUserProfile] No profile data found (status 406 or data null).');
      }

    } catch (error) {
      console.error('[fetchUserProfile] Caught error during query execution:', error.message);
      queryError = error; // Store error if await itself fails
    } 

    // --- Update state AFTER the await --- 
    console.log('[fetchUserProfile] Updating state AFTER query attempt...');
    setUserProfile(profileData); // Set profile data (or null if not found/error)
    setLoadingProfile(false);
    console.log('[fetchUserProfile] Finished state updates.');
  };

  // --- Initiate Test (actual setup) ---
  const initiateTest = (type) => {
    const selectedQuestions = getTestQuestions(type);
    const qpp = type === 'lite' ? 4 : 5; // 4 questions per page for lite mode (24/6), 5 for standard (40/8)
    setTestType(type);
    setQuestions(selectedQuestions);
    setAnswers(Array(selectedQuestions.length).fill(undefined));
    setCurrentPageIndex(0);
    setQuestionsPerPage(qpp);
    setShowQuiz(true);
    setShowResults(false);
    setMbtiType(null);
    setPercentages({});
    window.history.pushState(null, '', `?test=${type}&page=1`);
  };

  // --- Start Test Flow (Handles Auth Check) ---
  const startTestFlow = (type) => {
    if (!type) {
      console.error('[startTestFlow] No test type provided');
      return;
    }
    // Always initiate the test directly without showing the login modal
    initiateTest(type);
  };

  const calculateScores = () => {
    // We don't need to recalculate scores since calculateMBTI now returns normalized scores
    return { percentages: {} }; // Return empty for now, will be replaced by calculateMBTI's results
  };

  const handleAnswer = (globalIndex, value) => {
    const newAnswers = [...answers];
    if (globalIndex >= 0 && globalIndex < questions.length) {
      console.log(`[handleAnswer] Updating index ${globalIndex} with value ${value}`);
      newAnswers[globalIndex] = value;
      setAnswers(newAnswers);
      
      // --- Scroll to next question IF it's on the same page --- 
      // /* // <-- REMOVE THIS LINE
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
      // */ // <-- REMOVE THIS LINE
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

  const handleViewResults = async (force = true) => { 
    const result = calculateMBTI(answers, questions); 
    const mbtiTypeCode = result.type;
    const calculatedPercentages = result.normalizedScores;

    if (mbtiTypeCode) {
      setMbtiType(mbtiTypeCode);
      setPercentages(calculatedPercentages);
      setShowResults(true);
      setShowQuiz(false);
      setAllQuestionsAnswered(true);
      window.history.pushState(null, '', `?results=${mbtiTypeCode}`);

      // --- Store or Save Result --- 
      if (session?.user) {
        setGuestResultData(null); // Clear any potential stale guest data if user is logged in
        try {
          const { data: userProfileData } = await supabase
             .from('users')
             .select('id, referred_by, points') // Need user ID from our table and referral info
             .eq('auth_user_id', session.user.id)
             .single();

          if (!userProfileData) {
             throw new Error('Could not find user profile to save result.');
          }
          
          // Check if user already has results to prevent double referral points
          const { data: existingResults, error: resultsError } = await supabase
            .from('results')
            .select('id')
            .eq('user_id', userProfileData.id)
            .limit(1); 
            
          if (resultsError) throw resultsError;  
            
          const isFirstResult = existingResults.length === 0;

          const { error: insertError } = await supabase
            .from('results')
            .insert({
              user_id: userProfileData.id, // Use ID from our users table
              mbti_type: mbtiTypeCode,
              percentages: calculatedPercentages,
              test_type: testType // Use the stored testType state
            });
          if (insertError) throw insertError;

          // --- Award referral points if applicable (on first result) ---
          if (isFirstResult && userProfileData.referred_by) {
             const { data: referrerData, error: referrerError } = await supabase
                .from('users')
                .select('id, points')
                .eq('referral_code', userProfileData.referred_by)
                .single();
                
             if (referrerError) throw new Error(`Error finding referrer: ${referrerError.message}`);
             
             if (referrerData) {
                const newPoints = (referrerData.points || 0) + 1; // Award 1 point
                const { error: updateError } = await supabase
                  .from('users')
                  .update({ points: newPoints })
                  .eq('id', referrerData.id);
                  
                if (updateError) throw new Error(`Error updating referrer points: ${updateError.message}`);
             }
          }
          // --- End referral points logic ---

        } catch (error) {
          console.error('Error saving result or awarding points:', error.message);
        }
      } else {
        // --- User is a GUEST: Store results temporarily --- 
        setGuestResultData({
          type: mbtiTypeCode,
          percentages: calculatedPercentages,
          testType: testType // Use the current testType state
        });
        // --- End Guest Store --- 
      }
      // --- End Store or Save Result --- 

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
    setGuestResultData(null); // Also clear guest data on retake
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
        return `${dim.name}: ${dominantType} ${Math.round(dominantPercent)}%`;
    }).join('\n');

    // Build dynamic URL with referral code if available
    let resultUrl = window.location.origin;
    // Only add referral code if user is logged in and has one
    if (session && userProfile?.referral_code) {
        resultUrl += `/?ref=${userProfile.referral_code}`;
    } else {
        resultUrl += '/';
    }

    const shareText = `My Crypto Personality type is ${result.name} (${mbtiType})! 🚀\n\n${breakdown}\n\nFind yours: ${resultUrl}\n\n@CheckmateFDN #CryptoMBTI #CryptoPersonality`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank');
  };

  // --- New Auth Handlers ---
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      // Reset all states to initial values
      setSession(null);
      setUserProfile(null);
      setShowResults(false);
      setShowQuiz(false);
      setShowHistoryPage(false);
      setShowLeaderboardPage(false);
      setShowTypesPage(false);
      setMbtiType(null);
      setPercentages({});
      setGuestResultData(null);
      setTestType(null);
      setQuestions([]);
      setAnswers([]);
      setCurrentPageIndex(0);
      setQuestionsPerPage(0);
      setAllQuestionsAnswered(false);
      
      // Clear URL parameters
      window.history.pushState(null, '', window.location.pathname);
      
      console.log('Logged out successfully');
    }
  };

  const handleContinueAsGuest = () => {
    if (pendingTestType) {
      console.log('Continuing as guest for test type:', pendingTestType);
      initiateTest(pendingTestType);
      setPendingTestType(null);
      setShowAuthModal(false);
    } else {
      // Should ideally not happen if modal is shown correctly
      console.warn('Continue as Guest clicked but no pending test type found.');
      setShowAuthModal(false);
    }
  };

  // --- New Function to Save Guest Results --- 
  const saveGuestResult = async (resultToSave) => {
    if (!session?.user || !userProfile?.id) {
      console.error('[saveGuestResult] Cannot save, user not logged in or profile not loaded.');
      return;
    }
    if (!resultToSave) {
        console.warn('[saveGuestResult] No guest result data found to save.');
        return;
    }

    console.log('[saveGuestResult] Attempting to save guest result:', resultToSave);
    try {
      // Check if user already has results (important for referral points)
      const { error: resultsError, count } = await supabase
        .from('results')
        .select('id', { count: 'exact', head: true }) // More efficient count
        .eq('user_id', userProfile.id);
        
      if (resultsError) throw resultsError;  
        
      const isFirstResult = count === 0; // Check if this is the first result
      console.log(`[saveGuestResult] Is this the user's first result? ${isFirstResult}`);

      // Insert the result
      const { error: insertError } = await supabase
        .from('results')
        .insert({
          user_id: userProfile.id,
          mbti_type: resultToSave.type,
          percentages: resultToSave.percentages,
          test_type: resultToSave.testType
        });
      if (insertError) throw insertError;
      console.log('[saveGuestResult] Guest result saved successfully!');

      // Award referral points if applicable (on first result)
      if (isFirstResult && userProfile.referred_by) {
         console.log(`[saveGuestResult] User was referred by ${userProfile.referred_by}. Awarding point.`);
         const { data: referrerData, error: referrerError } = await supabase
            .from('users')
            .select('id, points')
            .eq('referral_code', userProfile.referred_by)
            .single();
            
         if (referrerError && referrerError.code !== 'PGRST116') { // Ignore error if referrer not found (code PGRST116)
             console.error(`[saveGuestResult] Error finding referrer: ${referrerError.message}`);
         } else if (referrerData) {
            const newPoints = (referrerData.points || 0) + 1;
            const { error: updateError } = await supabase
              .from('users')
              .update({ points: newPoints })
              .eq('id', referrerData.id);
              
            if (updateError) {
                console.error(`[saveGuestResult] Error updating referrer points: ${updateError.message}`);
            } else {
                console.log(`[saveGuestResult] Referrer ${userProfile.referred_by} points updated to ${newPoints}`);
            }
         } else {
            console.warn(`[saveGuestResult] Referrer with code ${userProfile.referred_by} not found.`);
         }
      }

      // Only clear guest data after successful save
      setGuestResultData(null);
      console.log('[saveGuestResult] Cleared guestResultData state after successful save.');

    } catch (error) {
      console.error('[saveGuestResult] Error saving guest result or awarding points:', error.message);
      // Don't clear guest data on error
    }
  };

  // --- New Copy Referral Link Function ---
  const [copyButtonText, setCopyButtonText] = useState('Copy Referral Link'); // Updated default text
  const handleCopyReferralLink = (referralCode) => {
    if (!referralCode) return;
    const link = `${window.location.origin}/?ref=${referralCode}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy Referral Link'), 2000); // Updated reset text
      })
      .catch(err => {
        console.error('Failed to copy referral link:', err);
        setCopyButtonText('Error');
        setTimeout(() => setCopyButtonText('Copy Referral Link'), 2000); // Updated reset text
      });
  };
  // --- End New Function ---

  // --- Fetch Previous Results Function ---
  const fetchPreviousResults = async () => {
    if (!session || !userProfile?.id) {
      console.log("Cannot fetch results: User not logged in or profile ID missing.");
      return;
    }
    console.log("Fetching previous results for user ID:", userProfile.id);
    setLoadingPreviousResults(true);
    try {
      const { data, error } = await supabase
        .from('results')
        .select('id, created_at, mbti_type, test_type, percentages') // Fetch necessary data
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false }); // Show newest first

      if (error) throw error;
      
      console.log("Fetched previous results:", data);
      setPreviousResults(data || []); 
    } catch (error) {
      console.error('Error fetching previous results:', error.message);
      setPreviousResults([]); // Reset on error
    } finally {
      setLoadingPreviousResults(false);
    }
  };
  // --- End Fetch Function ---

  // --- Function to view a specific past result (reusing existing logic) ---
  const viewPastResult = (result) => {
    console.log("Viewing past result:", result);
    setMbtiType(result.mbti_type);
    setPercentages(result.percentages || {}); // Ensure percentages is an object
    setTestType(result.test_type); // Set test type for context if needed
    setShowHistoryPage(false); // Hide history page
    setShowResults(true); // Show the results page
    setShowQuiz(false); // Ensure quiz is hidden
    window.history.pushState(null, '', `?results=${result.mbti_type}&history=${result.id}`); // Update URL
  };
  // --- End View Past Result Function ---

  // --- Fetch Leaderboard Function ---
  const fetchLeaderboard = async () => {
    console.log("Fetching leaderboard...");
    setLoadingLeaderboard(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, points')
        .not('points', 'is', null) // Only users with points
        .order('points', { ascending: false })
        .limit(20); // Limit to top 20 for example

      if (error) throw error;

      console.log("Fetched leaderboard data:", data);
      setLeaderboardData(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error.message);
      setLeaderboardData([]); // Reset on error
    } finally {
      setLoadingLeaderboard(false);
    }
  };
  // --- End Fetch Function ---

  // --- Effect to close dropdown on outside click ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the dropdown trigger and the dropdown itself
      const dropdownTrigger = document.getElementById('profile-dropdown-trigger');
      const dropdownMenu = document.getElementById('profile-dropdown-menu');

      if (
        isProfileDropdownOpen &&
        dropdownTrigger && !dropdownTrigger.contains(event.target) &&
        dropdownMenu && !dropdownMenu.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    // Add listener if dropdown is open
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]); // Re-run effect when dropdown state changes
  // --- End Effect ---

  // --- Render Logic --- 

  // Add AuthModal render logic
  const renderAuthModal = () => (
    <AuthModal 
      isOpen={showAuthModal} 
      onClose={() => { 
        console.log('[AuthModal onClose] Closing modal.');
        setShowAuthModal(false); 
        setPendingTestType(null); 
        // Remove the line that clears guestResultData
      }} 
      onContinueAsGuest={handleContinueAsGuest} 
      supabase={supabase}
      setSession={setSession}
      setLoadingProfile={setLoadingProfile}
      fetchUserProfile={fetchUserProfile}
      initialMode={authMode}
      setAuthMode={setAuthMode}
      guestResultData={guestResultData}
      setGuestResultData={setGuestResultData}
      initialReferralCode={initialReferralCode}
    >
      {authMode === 'login' ? (
        <Login 
          supabase={supabase} 
          setSession={setSession}
          setLoadingProfile={setLoadingProfile} 
          setAuthMode={setAuthMode}
        />
      ) : (
        <Register 
          supabase={supabase} 
          setSession={setSession}
          setLoadingProfile={setLoadingProfile} 
          setAuthMode={setAuthMode}
          initialReferralCode={initialReferralCode}
        />
      )}
    </AuthModal>
  );

  // --- Main Render --- 
  // console.log('[App Render] showAuthModal state:', showAuthModal); // <-- REMOVED
  
  // Determine which main component to render based on state
  // --- REMOVE mainContent LOGIC ---

  // Base structure: ErrorBoundary > Container > Auth Area + Modal + Main Content
    return (
    <ErrorBoundary>
      <div className="relative min-h-screen"> 
        {/* Success Messages Overlay */}
        {emailConfirmed && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="p-4 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-600/50 rounded-lg text-center shadow-inner backdrop-blur-sm">
              <p className="text-teal-300 font-semibold mb-2">Account Confirmed! 🎉</p>
              <p className="text-sm text-slate-300">Your account has been successfully verified.</p>
            </div>
          </div>
        )}

        {/* Always Visible User/Auth Area */} 
        <div className="absolute top-4 right-4 z-30">
          {session ? ( 
            // --- Logged-in user view (Dropdown) ---
            <div className="relative">
               {loadingProfile ? (
                   // Simple loading indicator while profile loads
                   <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-full shadow border border-slate-700">
                       <span className="text-xs text-slate-400 italic px-2">Loading...</span>
          </div>
               ) : userProfile ? ( 
                  // Profile loaded - Show Dropdown Trigger
                  <button 
                     id="profile-dropdown-trigger" // ID for outside click detection
                     onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                     className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-full shadow border border-slate-700 text-slate-200 hover:bg-slate-700/70 transition duration-200"
                  >
                    <span className="text-sm font-medium px-1">Hi, {userProfile.username}!</span>
                    {/* Dropdown Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
               ) : (
                   // Profile failed to load - Show retry button
                   <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-full shadow border border-slate-700">
                       <button onClick={() => fetchUserProfile(session.user.id)} disabled={loadingProfile} className="text-xs text-orange-400 hover:text-orange-300 bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-full transition duration-200">
                         {loadingProfile ? 'Loading...' : 'Retry Profile'}
                       </button>
        </div>
               )}

               {/* Dropdown Menu - Render if open and profile exists */}
               {isProfileDropdownOpen && userProfile && (
                  <div 
                     id="profile-dropdown-menu" // ID for outside click detection
                     className="absolute right-0 mt-2 w-56 origin-top-right bg-slate-700/90 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-600/50"
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="profile-dropdown-trigger">
                      {/* Results Button */}
                      <button 
                        onClick={() => { fetchPreviousResults(); setShowHistoryPage(true); setShowLeaderboardPage(false); setIsProfileDropdownOpen(false); }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600/70 transition duration-150" 
                        role="menuitem"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                         Results
                      </button>
                      {/* Referrals Button */}
                      <button 
                        onClick={() => { fetchLeaderboard(); setShowLeaderboardPage(true); setShowHistoryPage(false); setIsProfileDropdownOpen(false); }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600/70 transition duration-150" 
                        role="menuitem"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                         </svg>
                         Referrals
                      </button>
                      {/* Logout Button */}
                       <button 
                         onClick={() => { handleLogout(); setIsProfileDropdownOpen(false); }}
                         className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-600/70 hover:text-red-300 transition duration-150 rounded-b-sm border-t border-slate-600/50 mt-1 pt-2" 
                         role="menuitem"
                       >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Logout
                       </button>
      </div>
                  </div>
               )}
            </div>
          ) : ( 
             // --- Logged-out user view ---
            <button 
               onClick={() => {
                  setAuthMode('login'); // Default to login view
                  setShowAuthModal(true);
               }}
               className="flex items-center gap-1.5 text-sm text-cyan-300 hover:text-cyan-200 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full transition duration-200 shadow"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
               </svg>
               Login / Register
            </button>
          )}
        </div>
        
        {renderAuthModal()} {/* Always render the modal structure; visibility controlled by isOpen prop */} 

        {/* Conditionally render the main content based on the page state */} 
        {showLeaderboardPage ? (
           // --- Leaderboard Page JSX ---
           <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center bg-gradient-to-b from-slate-800 to-slate-900 text-white relative">
             {/* Back Button */}
             <button 
               onClick={() => setShowLeaderboardPage(false)} 
               className="absolute top-6 left-6 z-20 text-sm text-slate-400 hover:text-teal-300 transition duration-200 flex items-center gap-1"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
               </svg>
               Back
             </button>
             
             <h1 className="text-3xl md:text-4xl font-bold mb-8 mt-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
               Referral Leaderboard
            </h1>
            
             {/* User's Referral Info Section */}
             {session && userProfile && (
               <div className="w-full max-w-lg mb-6 bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center">
                 <h3 className="text-lg font-semibold text-cyan-300 mb-3">Your Referral Stats</h3>
                 <p className="text-sm text-slate-300 mb-1">Your Points: <span className="font-bold text-xl text-teal-400">{userProfile.points ?? 0}</span></p>
                 {userProfile.referral_code ? (
                   <div className="mt-3 flex flex-col items-center gap-2">
                     <p className="text-xs text-slate-400">Share your link:</p>
                     <div className="flex items-center gap-2">
                       <span className="text-sm text-slate-300">Referral Code: <span className="font-mono text-teal-400">{userProfile.referral_code}</span></span>
                       <button 
                          onClick={() => handleCopyReferralLink(userProfile.referral_code)}
                          className="flex items-center gap-1.5 text-sm text-cyan-300 hover:text-cyan-200 bg-slate-700 hover:bg-slate-600/80 px-3 py-1.5 rounded-md transition duration-200 whitespace-nowrap shadow"
                          title={`Copy referral link: ${window.location.origin}/?ref=${userProfile.referral_code}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {copyButtonText} 
                       </button>
                     </div>
                   </div>
                 ) : (
                   <p className="text-xs text-slate-500 mt-2">(Referral code not available)</p>
                 )}
                 <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-600/50"> 
                   How it works: Earn 1 point for each friend who signs up using your link and completes their first Crypto MBTI test.
                </p>
              </div>
             )}
 
             {/* Ranked Leaderboard List */}
             <div className="w-full max-w-lg bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg backdrop-blur-sm p-6">
               {loadingLeaderboard ? (
                 <p className="text-center text-slate-400">Loading leaderboard...</p>
               ) : leaderboardData.length === 0 ? (
                 <p className="text-center text-slate-400">No users with referral points yet.</p>
               ) : (
                 <ol className="space-y-3">
                   {leaderboardData.map((user, index) => (
                     <li 
                       key={user.username} // Assuming username is unique for key
                       className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 flex justify-between items-center"
                     >
                       <div className="flex items-center gap-3">
                         <span className="text-sm font-semibold text-slate-400 w-6 text-right">{index + 1}.</span>
                         <span className="font-medium text-slate-200">{user.username}</span>
                </div>
                       <span className="font-bold text-lg text-teal-400">{user.points} pts</span>
                     </li>
                   ))}
                 </ol>
               )}
                </div>

              {/* Footer */}
              <footer className="w-full text-center text-xs text-slate-500 mt-auto pt-8 pb-4 z-10">
                 © 2024 Checkmate Foundation
              </footer>
                </div>
         ) : showHistoryPage ? (
           // --- History Page JSX ---
           <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center bg-gradient-to-b from-slate-800 to-slate-900 text-white relative">
             {/* Back Button */}
             <button 
               onClick={() => setShowHistoryPage(false)} 
               className="absolute top-6 left-6 z-20 text-sm text-slate-400 hover:text-teal-300 transition duration-200 flex items-center gap-1"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
               </svg>
               Back
             </button>
             
             <h1 className="text-3xl md:text-4xl font-bold mb-8 mt-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
               Your Test History
              </h1>

             <div className="w-full max-w-2xl bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg backdrop-blur-sm p-6">
               {loadingPreviousResults ? (
                 <p className="text-center text-slate-400">Loading history...</p>
               ) : previousResults.length === 0 ? (
                 <p className="text-center text-slate-400">You haven't completed any tests yet.</p>
               ) : (
                 <ul className="space-y-4">
                   {previousResults.map((result) => (
                     <li 
                       key={result.id}
                       className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 flex justify-between items-center hover:bg-slate-700/60 transition duration-200"
                     >
                       <div>
                         <span className="font-bold text-lg text-white mr-3">{result.mbti_type}</span>
                         <span className="text-sm text-slate-400 mr-3">({typeDescriptions[result.mbti_type]?.name || 'Unknown Type'})</span>
                         <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${result.test_type === 'lite' ? 'bg-cyan-800/70 text-cyan-200' : 'bg-purple-800/70 text-purple-200'}`}>
                           {result.test_type || 'standard'}
                         </span>
                </div>
                       <div className="text-right">
                          <span className="text-xs text-slate-500 block mb-1">{new Date(result.created_at).toLocaleString()}</span>
                          <button 
                             onClick={() => viewPastResult(result)}
                             className="text-xs text-teal-400 hover:text-teal-300 underline"
                           >
                             View Details
                          </button>
                </div>
                     </li>
                   ))}
                 </ul>
               )}
              </div>

              {/* Footer */}
              <footer className="w-full text-center text-xs text-slate-500 mt-auto pt-8 pb-4 z-10">
                 © 2024 Checkmate Foundation
              </footer>
           </div>
         ) : showTypesPage ? (
           // --- Types Page JSX ---
           <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center bg-gradient-to-b from-slate-800 to-slate-900 text-white relative overflow-hidden">
             {/* Decorative elements */}
             <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-full opacity-30 z-0"></div>
             <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-gradient-to-tr from-cyan-600/10 to-transparent rounded-full opacity-30 z-0"></div>

             {/* Back Button */}
                <button 
               onClick={() => setShowTypesPage(false)} 
               className="absolute top-6 left-6 z-20 text-sm text-slate-400 hover:text-teal-300 transition duration-200 flex items-center gap-1"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
               </svg>
               Back to Home
                </button>

             {/* Main Content Area */}
             <div className="w-full max-w-5xl z-10 mt-16 mb-8 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg backdrop-blur-sm p-6 md:p-10">
               <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
                 Understanding your Crypto MBTI
               </h1>

               {/* Dimensions Section */}
               <div className="mb-12 px-2 md:px-4">
                 <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-300">The Four Dimensions</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                   {dimensions.map((dim, index) => (
                     <div key={index} className="p-5 bg-slate-700/30 rounded-lg border border-slate-600/50">
                       <h3 className="text-xl font-semibold mb-2 text-white flex items-center">
                         {dim.emoji} <span className="ml-2">{dim.name}</span>
                       </h3>
                       <div className="flex justify-between text-sm mb-2">
                         <span className="font-medium text-teal-400">{dim.type1}</span>
                         <span className="font-medium text-cyan-400">{dim.type2}</span>
              </div>
                       {/* Use dimensionSentences which IS defined */}
                       <p className="text-sm text-slate-400">{dimensionSentences[dim.key]?.type1} vs {dimensionSentences[dim.key]?.type2}</p> 
            </div>
                   ))}
          </div>
        </div>

               {/* Types Section */}
               <div className="mb-6">
                 <h2 className="text-2xl font-semibold mb-8 text-center text-cyan-300">The 16 Crypto Personalities</h2>
                  {/* Render types grouped */}
                  <div className="space-y-10">
                    {typeGroups.map(group => (
                      <div key={group.title} className="mb-10 p-6 bg-slate-700/20 border border-slate-600/30 rounded-lg shadow-inner">
                        <h3 className="text-xl font-semibold mb-3 text-center text-teal-300">{group.title}</h3>
                        <p className="text-sm text-slate-400 mb-6 text-center max-w-xl mx-auto">{group.description}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {group.types.map(typeCode => (
                             <div key={typeCode} className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/60 text-center hover:bg-slate-700/60 transition duration-200 cursor-default">
                                <p className="font-bold text-lg text-white">{typeCode}</p>
                                <p className="text-sm text-slate-300">{typeDescriptions[typeCode]?.name || 'Unknown Name'}</p>
                              </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Find Your Type Button */}
                  <div className="text-center mt-12">
                    <button 
                      onClick={() => setShowTypesPage(false)} 
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-300 ease-in-out text-lg"
                    >
                      Find Your Type &rarr;
                    </button>
                  </div>
                </div> {/* Closing tag for the main content area div */} 
             </div> {/* Closing tag for the Types Page JSX container div */} 

             {/* Footer */}
             <footer className="w-full text-center text-xs text-slate-500 mt-auto pb-4 z-10">
               © 2024 Checkmate Foundation | Explore the types
             </footer>
           </div>
         ) : showResults && mbtiType ? (
            // --- Result Screen JSX --- 
            <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 text-white relative">
              {/* Subtle decorative background elements */}
              <div className="absolute top-10 left-10 w-48 h-48 bg-teal-600/10 rounded-full filter blur-3xl opacity-50 z-0"></div>
              <div className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl opacity-40 z-0"></div>
              <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div> {/* Grid pattern */}

              {/* Result Card */}
              <div className="w-full max-w-2xl text-center p-6 md:p-8 bg-slate-800/60 border border-slate-700 rounded-2xl shadow-xl backdrop-blur-md z-10 relative overflow-hidden">
                
                {/* New Result Header Structure */}
                {(() => {
                  const result = typeDescriptions[mbtiType];
                  if (!result) {
                    return <div className="min-h-[150px] flex items-center justify-center text-red-400">Error: Result description not found for type '{mbtiType}'. Please try again.</div>;
                  }
                  return (
                    <div className="mb-8">
                      <p className="text-lg text-slate-400 mb-1">Your crypto personality type is:</p> {/* Size matches tagline, non-italic */}
                      <h2 className="text-3xl font-bold text-white tracking-tight mb-1">
                        {mbtiType} - <span className="text-teal-400">{result.name}</span>
                      </h2>
                      <p className="text-lg text-slate-300 italic mb-5">"{result.tagline}"</p> {/* Increased margin below tagline */} 
                      {/* Optional Image could go here */}
                      {/* {result.image && (
                        <img src={result.image} alt={result.name} className="w-32 h-32 mx-auto my-4 rounded-full border-4 border-teal-500/30 shadow-lg" />
                      )} */}
                    </div>
                  );
                })()}
                
                {(() => { // Immediately invoked function expression (IIFE) to handle conditional logic cleanly
                    const result = typeDescriptions[mbtiType]; 
                    if (!result) {
                      // Error already handled above, return null or minimal content here if needed
                      return null; 
                    }
                    
                    return (
                      <>
                        {/* Detailed Description Section */}
                        {result.detailedDescription && (
                          <div className="my-6 text-left bg-slate-700/20 p-4 rounded-lg border border-slate-600/30">
                            <p className="text-slate-300 text-sm leading-relaxed">{result.detailedDescription}</p>
                          </div>
                        )}

                        {/* Personality Traits Section */}
                        <div className="mt-8 mb-4 pt-6 border-t border-slate-700/50">
                          <h4 className="text-xl font-semibold mb-8 text-cyan-300">Personality Traits</h4>
                          <div className="space-y-4"> {/* Reduced spacing */}
                            {dimensions.map(dim => {
                              const score = percentages[dim.key];
                              // Handle cases where score might be undefined/null initially
                              if (typeof score !== 'number') {
                                return <div key={dim.key}>Loading score for {dim.name}...</div>; // Or some placeholder
                              }
                              const isType1Dominant = score >= 50;
                              const dominantType = isType1Dominant ? dim.type1 : dim.type2;
                              const dominantPercent = isType1Dominant ? Math.round(score) : Math.round(100 - score);
                              const sentenceKey = isType1Dominant ? 'type1' : 'type2';
                              const sentence = dimensionSentences[dim.key]?.[sentenceKey] || ''; // Get sentence

                              // Calculate marker position (0% to 100%)
                              // Inverted logic based on user feedback: position = (100 - score)%
                              const markerPosition = `${100 - score}%`;

                              return (
                                <div key={dim.key} className="text-center relative mb-4"> {/* Removed group/relative, no longer needed for tooltip */}
                                  {/* Top Label: Percentage and Dominant Type */}
                                  <div className="text-lg font-semibold mb-1"> {/* Reduced bottom margin */}
                                    <span className={`${isType1Dominant ? 'text-teal-300' : 'text-cyan-300'}`}>{dominantPercent}%</span>
                                    <span className="text-white ml-1">{dominantType}</span>
                                  </div>
                                  
                                  {/* Description Sentence */}
                                  <p className="text-xs text-slate-400 mb-2">{sentence}</p> 
                                  
                                  {/* Bar Container */}
                                  <div className="relative w-full h-2 bg-slate-700 rounded-full mb-1">
                                    {/* Colored part of the bar - Now always 100% width */}
                                    <div 
                                      className={`absolute top-0 left-0 h-full rounded-full ${
                                        dim.key === 'AB' ? 'bg-gradient-to-r from-teal-400 to-cyan-500' : 
                                        dim.key === 'DP' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                                        dim.key === 'MO' ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 
                                        'bg-gradient-to-r from-purple-400 to-pink-500' // Assuming TN colors
                                      }`}
                                      style={{ width: `100%` }} // Always full width
                                    ></div>
                                    
                                    {/* Marker - Position based on INVERTED score */}
                                    <div 
                                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-500 rounded-full shadow" 
                                      style={{ left: `calc(${markerPosition} - 8px)` }} // Position uses inverted score
                                    ></div>
                                  </div>
                                  
                                  {/* Bottom Labels: Type 1 and Type 2 */}
                                  <div className="flex justify-between text-xs text-slate-400 px-1">
                                    <span>{dim.type1}</span>
                                    <span>{dim.type2}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Guest Prompt */}
                        {!session && guestResultData && (
                          <div className="mt-8 mb-6 p-5 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-600/50 rounded-lg text-center shadow-inner"> {/* Kept existing guest prompt styling */}
                            <p className="font-semibold text-teal-300 mb-2">Enjoy your results?</p>
                            <p className="text-sm text-slate-300 mb-3">Create a free account to save your type, track changes, and get referral points!</p>
                <button 
                  onClick={() => {
                                 console.log("Prompting login from guest result view");
                                 setAuthMode('register'); // Suggest register first
                                 setShowAuthModal(true); 
                                 // Guest data is already in state (guestResultData)
                              }}
                              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-5 rounded-full text-sm transition duration-200 shadow hover:shadow-md"
                            >
                              Create Account to Save
                </button>
                          </div>
                        )}

                        {/* Referral Link Section on Results Page */}
                        {session && userProfile && userProfile.referral_code && (
                          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                            <p className="text-sm text-slate-400 mb-2">Share your referral link to earn points!</p>
                            <div className="flex justify-center items-center">
                              {/* <span className="text-xs font-mono text-teal-300 truncate">{`${window.location.origin}/?ref=${userProfile.referral_code}`}</span> */}
              <button 
                                 onClick={() => handleCopyReferralLink(userProfile.referral_code)}
                                 className="flex items-center gap-1.5 text-sm text-cyan-300 hover:text-cyan-200 bg-slate-700 hover:bg-slate-600/80 px-4 py-2 rounded-md transition duration-200 whitespace-nowrap shadow"
                                 title={`Copy referral link: ${window.location.origin}/?ref=${userProfile.referral_code}`}
                               >
                                 {/* Copy Icon SVG */}
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                 </svg>
                                 {copyButtonText}
              </button>
                            </div>
                          </div>
                        )}

                        {/* Button Group */}
                        <div className={`button-group flex flex-col sm:flex-row justify-center gap-4 ${!session && guestResultData ? 'mt-4' : 'mt-8'} pt-6 border-t border-slate-700/50`}>
                          <button
                            onClick={handleShare}
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-full shadow hover:shadow-lg transform hover:-translate-y-px transition duration-200 ease-in-out"
              >
                Share on X
                          </button>
                          <button
                            onClick={handleRetakeQuiz}
                            className="flex-1 bg-slate-600 hover:bg-slate-500 text-slate-200 font-semibold py-2 px-6 rounded-full shadow hover:shadow-lg transform hover:-translate-y-px transition duration-200 ease-in-out"
                          >
                            Take Test Again
                          </button>
            </div>
                      </>
                    );
                })()} {/* End IIFE */}
          </div>

              {/* Footer */}
              <footer className="w-full text-center text-xs text-slate-500 mt-auto pt-8 pb-4 z-10">
                 © 2024 Checkmate Foundation | <a href="https://checkmate.foundation" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400">checkmate.foundation</a>
              </footer>
        </div>
         ) : showQuiz && questions.length > 0 ? (
            // --- Question Screen JSX ---
            <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center bg-gradient-to-b from-slate-800 to-slate-900 text-white">
               {/* Header & Progress Bar Wrapper - Make Sticky */}
               <div className="w-full max-w-3xl sticky top-0 z-20 bg-slate-800/80 backdrop-blur-sm py-4 mb-6">
                   {/* Header */}
                   <div className="w-full flex justify-between items-center px-2 mb-4">
                       <button onClick={handleRetakeQuiz} className="text-sm text-slate-400 hover:text-teal-300 transition duration-200 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                           Back to Start
                       </button>
                       <h1 className="text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
                           Crypto MBTI - {testType === 'lite' ? 'Lite' : 'Standard'}
                       </h1>
                       {/* Placeholder for potential profile icon/logout */}
                       <div className="w-28 text-right"> {/* Adjusted width for balance */}
                         {/* You could add user info here if needed, but it's also at top right */}
      </div>
                   </div>

                   {/* Progress Bar */}
                   <div className="w-full px-2">
                      <ProgressBar current={answeredCount} total={questions.length} />
                   </div>
               </div>

               {/* Questions Container - Adjust margin-top if needed due to sticky header height */}
               <div className="w-full max-w-3xl px-4 py-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg backdrop-blur-sm mt-0"> {/* Removed explicit mb-8 from progress bar div */} 
                 {questionsOnCurrentPage.map((question, localIndex) => {
                   const globalIndex = startIndex + localIndex;
                   const isActive = globalIndex === firstUnansweredIndex;
                   const isAnswered = answers[globalIndex] !== undefined;
                   const cardId = `question-${globalIndex}`;

  return (
                     <div
                       key={globalIndex}
                       id={cardId}
                       className={`mb-8 p-5 rounded-lg transition-all duration-300 ease-in-out border 
                                   ${isActive ? 'border-teal-500/50 bg-slate-700/40 shadow-md scale-[1.01]' : 'border-transparent'} 
                                   ${isAnswered ? 'opacity-70' : 'opacity-100'}
                                   scroll-mt-28`} // Increased scroll-margin-top from 8 to 28
                     >
                       <p className={`text-lg font-medium mb-5 ${isActive ? 'text-teal-300' : 'text-slate-300'}`}>
                         {/* Question numbering: globalIndex + 1 */}
                         <span className="font-semibold mr-2">{globalIndex + 1}.</span>{question.text}
                       </p>
                       <div className="flex flex-col md:flex-row justify-center items-center space-y-3 md:space-y-0 md:space-x-4">
                         {likertOptions.map((option, index) => {
                           const isSelected = answers[globalIndex] === option.value;
                           return (
              <button
                               key={index}
                               onClick={() => handleAnswer(globalIndex, option.value)}
                               className={`px-4 py-2 rounded-full border text-sm font-medium transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 min-w-[100px] text-center
                                           ${isSelected ? option.selectedClasses : `${option.defaultClasses} ${option.hoverClasses}`}
                                           `}
                             >
                               {option.label}
              </button>
                           );
                         })}
                       </div>
                     </div>
                   );
                 })}

                 {/* Navigation Buttons */}
                 <div className="navigation-buttons flex justify-between items-center mt-6 border-t border-slate-700/50 pt-6">
              <button
                     onClick={handleBack}
                     disabled={currentPageIndex === 0}
                     className="px-6 py-2 rounded-full border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                   >
                     Back
                   </button>
                   <p className="question-number text-sm text-slate-400">
                      Page {currentPageIndex + 1} of {totalPages}
                   </p>
                   <button
                     onClick={handleNext}
                     disabled={!areAllQuestionsOnPageAnswered()}
                     className="px-6 py-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold shadow disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition duration-200 transform hover:scale-105"
                   >
                     {currentPageIndex === totalPages - 1 ? 'View Results' : 'Next'}
              </button>
            </div>
          </div>

               {/* Footer */}
               <footer className="w-full text-center text-xs text-slate-500 mt-auto pt-8 pb-4">
                 © 2024 Checkmate Foundation
               </footer>
        </div>
         ) : (
            // --- Home Screen JSX (Default if no other state matches) ---
            <div className="container mx-auto px-4 min-h-screen flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 text-white relative overflow-hidden">
               <div className="flex-1 flex flex-col">
                 <div className="w-full max-w-xl mx-auto text-center z-10 pt-8 mb-auto relative">
                   <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">Crypto MBTI</h1>
                   <p className="text-lg font-medium text-teal-300 mb-8 text-center">What Shapes Your Crypto Personality?</p>
                   <div className="mb-6 max-w-md mx-auto text-slate-400 text-sm space-y-4 text-left pl-4"> 
                     <div className="space-y-1">
                       <p className="font-medium text-cyan-300">Risk Instinct:</p>
                       <p>Are you a fearless <span className="font-semibold text-teal-400">Ape</span>, or a calculated <span className="font-semibold text-cyan-400">Builder</span>?</p>
                     </div>

                     <div className="space-y-1">
                       <p className="font-medium text-cyan-300">Holding Style:</p>
                       <p>Do you have <span className="font-semibold text-teal-400">Diamond Hands</span> through the dips, or <span className="font-semibold text-cyan-400">Paper Hands</span> ready to exit?</p>
                     </div>

                     <div className="space-y-1">
                       <p className="font-medium text-cyan-300">Chain Loyalty:</p>
                       <p>Are you a loyal <span className="font-semibold text-teal-400">Maxi</span>, or an adventurous <span className="font-semibold text-cyan-400">Omni</span> explorer?</p>
                     </div>

                     <div className="space-y-1">
                       <p className="font-medium text-cyan-300">Asset Identity:</p>
                       <p>Do you vibe with <span className="font-semibold text-teal-400">Tokens</span> for gains, or <span className="font-semibold text-cyan-400">NFTs</span> for culture?</p>
                     </div>
                   </div>

                   <div className="flex flex-col gap-4 items-center mt-8">
                  <button
                       onClick={() => startTestFlow('lite')}
                       className="w-64 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-300 ease-in-out text-lg"
                  >
                       Lite Test (~2 mins)
                  </button>
                  <button 
                       onClick={() => startTestFlow('standard')}
                       className="w-64 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-300 ease-in-out text-lg"
                  >
                       Standard (~5 mins)
                  </button>
                <button 
                       onClick={() => setShowTypesPage(true)}
                       className="mt-4 text-sm text-slate-400 hover:text-teal-300 transition duration-200 underline"
                     >
                       Learn about the 16 Personalities
                </button>
            </div>
          </div>

                 <footer className="w-full text-center text-xs text-slate-500 py-4 z-10">
                   <p className="mb-2">© 2025 Checkmate Foundation. All rights reserved</p>
                   <div className="flex justify-center items-center gap-4">
                     <a 
                       href="https://checkmate.foundation/" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="hover:text-teal-400 transition-colors"
                     >
                       Checkmate Foundation
                     </a>
                     <a 
                       href="https://checkmate.foundation/Checkmate%20Foundation%20-%20Terms%20of%20Use%20(D240513).pdf" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="hover:text-teal-400 transition-colors"
                     >Terms & Conditions</a> 
                     <a 
                       href="https://checkmate.foundation/Checkmate%20Foundation%20-%20Privacy%20Notice%20(D240513).pdf" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="hover:text-teal-400 transition-colors"
                     >Privacy Policy</a> 
        </div>
                 </footer>
      </div>
            </div>
         ) }
        </div>
      </ErrorBoundary>
  );
}