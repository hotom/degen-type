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
    
    // For each dimension, the first letter is always the positive type
    // A, D, M, T are positive types
    // B, P, O, N are negative types
    const isPositiveType = question.positiveType === dimension[0];
    const scoreChange = isPositiveType ? answer : -answer;
    
    // Debug logging for MO dimension
    if (dimension === 'MO') {
      console.log(`MO Question ${index + 1}:`, {
        text: question.text,
        positiveType: question.positiveType,
        answer,
        scoreChange,
        currentScore: scores[dimension],
        dimension,
        isPositiveType
      });
    }
    
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

    // Each question can contribute -2 to +2, so the total range is 4
    const maxPossibleScore = numQuestions * 2; // Maximum positive score
    const minPossibleScore = -numQuestions * 2; // Maximum negative score
    const totalScoreRange = maxPossibleScore - minPossibleScore; // Full range from min to max
    
    // Normalize to 0-100 range
    const normalizedScore = Math.round(((scores[dim] - minPossibleScore) / totalScoreRange) * 100);
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