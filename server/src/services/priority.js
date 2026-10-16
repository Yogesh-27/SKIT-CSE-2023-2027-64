
/**
 * CivicSolve — Priority Scoring Engine
 *
 * Score = category weight
 *       + urgency bonus
 *       + community upvote bonus
 *       + photo evidence bonus
 *
 * Final score: 0–100
 * Priority levels: Low, Medium, High, Critical
 */

const CATEGORY_WEIGHT = {
  "Public Safety": 40,
  "Electricity & Street Lights": 30,
  "Water Supply": 30,
  "Drainage & Sewage": 25,
  "Roads & Potholes": 25,
  "Sanitation & Garbage": 20,
  "Parks & Public Spaces": 10,
  "General Complaint": 10
};

// Higher values represent more severe hazards.
const URGENT_WORDS = [
  { word: "live wire", points: 20 },
  { word: "electric shock", points: 20 },
  { word: "electrocution", points: 20 },
  { word: "gas leak", points: 18 },
  { word: "building collapse", points: 18 },
  { word: "fire", points: 15 },
  { word: "accident", points: 15 },
  { word: "hospital emergency", points: 15 },
  { word: "open manhole", points: 15 },
  { word: "severe flooding", points: 15 },
  { word: "flood", points: 12 },
  { word: "collapsed", points: 12 },
  { word: "injured", points: 12 },
  { word: "trapped", points: 12 },
  { word: "sparking", points: 12 },
  { word: "explosion", points: 15 },
  { word: "death", points: 15 },
  { word: "emergency", points: 12 },
  { word: "snake", points: 8 },
  { word: "dangerous", points: 8 },
  { word: "danger", points: 8 },
  { word: "unsafe", points: 8 },
  { word: "overflow", points: 6 },
  { word: "waterlogging", points: 6 },
  { word: "no water", points: 5 },
  { word: "power outage", points: 5 },
  { word: "street light not working", points: 5 },
  { word: "garbage pile", points: 4 },
  { word: "kachra", points: 4 },
  { word: "bijli", points: 4 },
  { word: "paani", points: 3 },
  { word: "urgent", points: 5 }
];

const PRIORITY_THRESHOLDS = {
  CRITICAL: 75,
  HIGH: 55,
  MEDIUM: 30
};

const MAX_SCORE = 100;
const MAX_URGENCY_BONUS = 40;
const MAX_UPVOTE_BONUS = 20;
const PHOTO_BONUS = 5;

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsPhrase(text, phrase) {
  const normalizedPhrase = normalizeText(phrase);
  const escapedPhrase = normalizedPhrase.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const pattern = new RegExp(
    `(^|\\s)${escapedPhrase.replace(/\s+/g, "\\s+")}(?=$|\\s)`
  );

  return pattern.test(text);
}

function levelFromScore(score) {
  if (score >= PRIORITY_THRESHOLDS.CRITICAL) {
    return "Critical";
  }

  if (score >= PRIORITY_THRESHOLDS.HIGH) {
    return "High";
  }

  if (score >= PRIORITY_THRESHOLDS.MEDIUM) {
    return "Medium";
  }

  return "Low";
}

function calculatePriority({
  category = "General Complaint",
  title = "",
  description = "",
  hasPhoto = false,
  upvotes = 0
} = {}) {
  const normalizedTitle = normalizeText(title);
  const normalizedDescription = normalizeText(description);
  const combinedText = `${normalizedTitle} ${normalizedDescription}`;

  const reasons = [];

  // 1. Category base score
  const categoryWeight =
    CATEGORY_WEIGHT[category] ?? CATEGORY_WEIGHT["General Complaint"];

  let score = categoryWeight;

  reasons.push(`Category "${category}" base score: +${categoryWeight}`);

  // 2. Urgency scoring
  // Each matching phrase is counted only once.
  // The title and description are evaluated together.
  const matchedUrgentWords = URGENT_WORDS.filter(({ word }) =>
    containsPhrase(combinedText, word)
  );

  const rawUrgencyBonus = matchedUrgentWords.reduce(
    (total, item) => total + item.points,
    0
  );

  const urgencyBonus = Math.min(
    rawUrgencyBonus,
    MAX_URGENCY_BONUS
  );

  if (urgencyBonus > 0) {
    score += urgencyBonus;

    reasons.push(
      `Urgency indicators (${matchedUrgentWords
        .map(({ word }) => word)
        .join(", ")}): +${urgencyBonus}`
    );
  }

  // 3. Community upvotes
  const validUpvotes = Number.isFinite(Number(upvotes))
    ? Math.max(0, Math.floor(Number(upvotes)))
    : 0;

  const voteBonus = Math.min(
    validUpvotes * 5,
    MAX_UPVOTE_BONUS
  );

  if (voteBonus > 0) {
    score += voteBonus;
    reasons.push(`Community upvotes (${validUpvotes}): +${voteBonus}`);
  }

  // 4. Photo evidence
  if (hasPhoto === true) {
    score += PHOTO_BONUS;
    reasons.push(`Photo evidence attached: +${PHOTO_BONUS}`);
  }

  // 5. Keep the final score within the supported range
  score = Math.min(MAX_SCORE, Math.max(0, Math.round(score)));

  const level = levelFromScore(score);

  reasons.push(`Final priority score: ${score}/100`);
  reasons.push(`Assigned priority level: ${level}`);

  // 6. Department response deadline (SLA)
  const slaHours = {
    Critical: 6,
    High: 24,
    Medium: 72,
    Low: 168
  }[level];

  return {
    score,
    level,
    reasons,
    matchedUrgentWords: matchedUrgentWords.map(({ word }) => word),
    slaHours
  };
}

module.exports = {
  calculatePriority,
  levelFromScore,
  CATEGORY_WEIGHT,
  URGENT_WORDS,
  PRIORITY_THRESHOLDS
};
