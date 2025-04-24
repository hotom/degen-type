import { typeDescriptions } from './data';

export function calculateMBTI(answers, testQuestions) {
  // Initialize scores for each dimension
  const scores = {
    AB: 0, // Risk: A (Ape) vs B (Builder)
    DP: 0, // Holding: D (Diamond) vs P (Paper)
    MO: 0, // Chain: M (Maxi) vs O (Omni)
    TN: 0  // Asset: T (Token) vs N (NFT)
  };

  // Make sure we have questions to iterate over
  if (!testQuestions || testQuestions.length === 0) {
    return { type: 'ERROR', normalizedScores: { AB: 50, DP: 50, MO: 50, TN: 50 } };
  }

  // Calculate scores based on Likert scale values (-2 to +2)
  answers.forEach((answer, index) => {
    // Skip unanswered or if index is out of bounds for the actual test questions
    if (answer === undefined || index >= testQuestions.length) return; 
    
    // Use the question from the passed testQuestions array
    const question = testQuestions[index]; 
    if (!question) return; // Skip if question is somehow undefined
    
    const dimension = question.type; // e.g., "AB", "DP", "MO", "TN"
    
    // For each dimension, the first letter is always the positive type
    // A, D, M, T are positive types
    // B, P, O, N are negative types
    const isPositiveType = question.positiveType === dimension[0];
    const scoreChange = isPositiveType ? answer : -answer;
    
    // Check if the dimension exists in scores before updating
    if (scores.hasOwnProperty(dimension)) {
      scores[dimension] += scoreChange;
    }
  });

  // Calculate relevant max scores based on the actual questions used
  const dimensionQuestionCounts = {
    AB: testQuestions.filter(q => q.type === 'AB').length,
    DP: testQuestions.filter(q => q.type === 'DP').length,
    MO: testQuestions.filter(q => q.type === 'MO').length,
    TN: testQuestions.filter(q => q.type === 'TN').length
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
    // Ensure totalScoreRange is not zero to avoid division by zero
    if (totalScoreRange === 0) {
       normalizedScores[dim] = 50; // Default to neutral if range is zero (e.g., only one question type was present)
       return;
    }
    const normalizedScore = Math.round(((scores[dim] - minPossibleScore) / totalScoreRange) * 100);
    normalizedScores[dim] = normalizedScore;
  });

  // Determine the type based on normalized scores
  const firstLetter = normalizedScores.AB >= 50 ? 'A' : 'B';  // Risk: Ape (>50%) vs Builder (<50%)
  const secondLetter = normalizedScores.DP >= 50 ? 'D' : 'P'; // Holding: Diamond (>50%) vs Paper (<50%)
  const thirdLetter = normalizedScores.MO >= 50 ? 'M' : 'O';  // Chain: Maxi (>50%) vs Omni (<50%)
  const fourthLetter = normalizedScores.TN >= 50 ? 'T' : 'N'; // Asset: Token (>50%) vs NFT (<50%)

  const type = firstLetter + secondLetter + thirdLetter + fourthLetter;

  return {
    type, 
    normalizedScores
  };
} 