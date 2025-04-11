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
    
    scores[dimension] += isPositive ? answer : -answer;
  });

  // First letter: D or B
  const firstLetter = scores.DB >= 0 ? 'D' : 'B';
  
  // Second letter: T or V or H
  let secondLetter;
  if (firstLetter === 'D') {
    // Degens can be Traders (T) or Visionaries (V)
    secondLetter = scores.TV >= 0 ? 'T' : 'V';
  } else {
    // Builders can be HODLers (H), Traders (T), or Visionaries (V)
    if (Math.abs(scores.HE) > Math.abs(scores.TV)) {
      secondLetter = scores.HE >= 0 ? 'H' : 'T';
    } else {
      secondLetter = scores.TV >= 0 ? 'T' : 'V';
    }
  }
  
  // Third letter: H, E, V, or O
  let thirdLetter;
  if (firstLetter === 'D') {
    // Degens use HE score directly
    thirdLetter = scores.HE >= 0 ? 'H' : 'E';
  } else if (secondLetter === 'H') {
    // Builder HODLers use TV score for VO
    thirdLetter = scores.TV >= 0 ? 'V' : 'O';
  } else if (secondLetter === 'T') {
    // Builder Traders use HE score for HV
    thirdLetter = scores.HE >= 0 ? 'H' : 'V';
  } else {
    // Builder Visionaries use HE score for HE
    thirdLetter = scores.HE >= 0 ? 'H' : 'E';
  }
  
  // Fourth letter: M or O
  const fourthLetter = scores.OM >= 0 ? 'M' : 'O';

  const type = firstLetter + secondLetter + thirdLetter + fourthLetter;

  // Verify the type exists in our descriptions
  if (!typeDescriptions[type]) {
    console.error('Invalid type calculated:', type);
    return null;
  }

  return type;
} 