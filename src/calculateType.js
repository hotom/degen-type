import { questions, typeDescriptions } from './data';

export function calculateMBTI(answers) {
  // Initialize scores for each dimension
  const scores = {
    DB: 0, // D vs B (Degen vs Builder)
    TV: 0, // T vs V (Trader vs Visionary)
    HE: 0, // H vs E (HODLer vs Exit Liquidity)
    OM: 0  // O vs M (Omni-Chain vs Maxi)
  };

  // Calculate scores based on Likert scale values (-2 to +2)
  answers.forEach((answer, index) => {
    if (answer === undefined) return; // Skip unanswered questions
    
    const question = questions[index];
    const dimension = question.type; // e.g., "DB", "TV", etc.
    const isPositive = question.positiveType === dimension[0]; // e.g., "D" in "DB"
    
    // Add the answer value to the appropriate dimension
    // If positiveType is first letter (e.g., "D" in "DB"), add directly
    // If positiveType is second letter (e.g., "B" in "DB"), subtract
    scores[dimension] += isPositive ? answer : -answer;
  });

  // Determine the type based on scores
  const type = (
    (scores.DB >= 0 ? 'D' : 'B') +
    (scores.TV >= 0 ? 'T' : 'V') +
    (scores.HE >= 0 ? 'H' : 'E') +
    (scores.OM >= 0 ? 'M' : 'O')
  );

  // Verify the type exists in our descriptions
  if (!typeDescriptions[type]) {
    console.error('Invalid type calculated:', type);
    return null;
  }

  return type;
} 