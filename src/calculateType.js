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

  // Determine the type based on scores
  const firstLetter = scores.AB >= 0 ? 'A' : 'B';  // Risk: Ape vs Builder
  const secondLetter = scores.DP >= 0 ? 'D' : 'P'; // Holding: Diamond vs Paper
  const thirdLetter = scores.MO >= 0 ? 'M' : 'O';  // Chain: Maxi vs Omni
  const fourthLetter = scores.TN >= 0 ? 'T' : 'N'; // Asset: Token vs NFT

  const type = firstLetter + secondLetter + thirdLetter + fourthLetter;

  // Since typeDescriptions is empty now, we don't need to validate against it.
  // We will add the descriptions later.
  // if (!typeDescriptions[type]) {
  //   console.error('Invalid type calculated or description missing:', type);
  //   return null; // Or handle as needed
  // }

  return type;
} 