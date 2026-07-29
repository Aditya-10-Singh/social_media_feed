// AI Content Moderator Module
// Scans post text and comments for inappropriate content, toxicity, or harassment

const TOXIC_PATTERNS = [
  /\b(hate|kill|murder|attack|harass|abuse|idiot|stupid|threat|racist)\b/i,
  /\b(scam|phishing|crypto-giveaway|free-money-now|click-here-fast)\b/i
];

export const checkContentSafety = (text) => {
  if (!text || typeof text !== 'string') {
    return { isSafe: true, flagged: false, toxicityScore: 0, reason: null };
  }

  let toxicityScore = 0;
  const matchedReasons = [];

  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(text)) {
      toxicityScore += 0.45;
      matchedReasons.push('Contains flagged key terms or hostile language');
    }
  }

  // Check ALL CAPS spamming
  const words = text.split(/\s+/).filter(w => w.length > 2);
  if (words.length >= 4) {
    const capsCount = words.filter(w => w === w.toUpperCase() && /[A-Z]/.test(w)).length;
    if (capsCount / words.length > 0.75) {
      toxicityScore += 0.2;
      matchedReasons.push('Excessive capitalization (spam indicator)');
    }
  }

  const flagged = toxicityScore >= 0.4;
  return {
    isSafe: !flagged,
    flagged,
    toxicityScore: Math.min(1.0, toxicityScore),
    reason: flagged ? matchedReasons.join('; ') : null
  };
};
