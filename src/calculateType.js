import { questions, typeDescriptions } from './data';

export function calculateMBTI(answers) {
  // Initialize scores for each dimension
  const scores = {
    AB: 0, // Risk: A (Ape) vs B (Builder)
    DP: 0, // Holding: D (Diamond) vs P (Paper)
    MO: 0, // Chain: M (Maxi) vs O (Omni)
    TN: 0  // Asset: T (Token) vs N (NFT)
  };

  // Calculate scores based on Likert scale values (-2 to +2)
  answers.forEach((answer, index) => {
    if (answer === undefined || index >= questions.length) return; // Skip unanswered or out-of-bounds questions
    
    const question = questions[index];
    if (!question) return; // Skip if question is somehow undefined
    
    const dimension = question.type; // e.g., "AB", "DP", "MO", "TN"
    // Determine which type is considered "positive" for scoring
    // E.g., for AB axis, A is positive, B is negative
    const positiveTypeValue = dimension[0]; // A, D, M, T

    // If the question's positiveType matches the first letter of the dimension,
    // add the answer directly. Otherwise, invert the answer.
    const scoreChange = question.positiveType === positiveTypeValue ? answer : -answer;
    
    // Check if the dimension exists in scores before updating
    if (scores.hasOwnProperty(dimension)) {
      scores[dimension] += scoreChange;
    } else {
      console.warn(`Dimension "${dimension}" not found in scores object for question index ${index}`);
    }
  });

  // Calculate relevant max scores for proper normalization
  const dimensionQuestionCounts = {
    AB: questions.filter(q => q.type === 'AB').length,
    DP: questions.filter(q => q.type === 'DP').length,
    MO: questions.filter(q => q.type === 'MO').length,
    TN: questions.filter(q => q.type === 'TN').length
  };

  const normalizedScores = {};

  // Calculate normalized percentages (0-100) for each dimension
  Object.keys(scores).forEach(dim => {
    const numQuestions = dimensionQuestionCounts[dim];
    if (numQuestions === 0) {
      normalizedScores[dim] = 50; // Default to neutral
      return;
    }

    const maxPossibleScore = numQuestions * 2; // Max positive swing
    const totalScoreRange = maxPossibleScore * 2; // Full range from min to max
    
    // Normalize to 0-100 range
    const normalizedScore = Math.round(((scores[dim] + maxPossibleScore) / totalScoreRange) * 100);
    normalizedScores[dim] = normalizedScore;
  });

  console.log("Raw scores:", scores);
  console.log("Normalized scores (0-100):", normalizedScores);

  // CRITICAL: Determine the type based on normalized scores instead of raw scores
  // This ensures consistency with the displayed percentages in the UI
  const firstLetter = normalizedScores.AB >= 50 ? 'A' : 'B';  // Risk: Ape (>50%) vs Builder (<50%)
  const secondLetter = normalizedScores.DP >= 50 ? 'D' : 'P'; // Holding: Diamond (>50%) vs Paper (<50%)
  const thirdLetter = normalizedScores.MO >= 50 ? 'M' : 'O';  // Chain: Maxi (>50%) vs Omni (<50%)
  const fourthLetter = normalizedScores.TN >= 50 ? 'T' : 'N'; // Asset: Token (>50%) vs NFT (<50%)

  const type = firstLetter + secondLetter + thirdLetter + fourthLetter;
  console.log("Final type:", type);

  return {
    type, 
    normalizedScores // Return the normalized scores to help with debugging
  };
} 