// ---------- Priority-Scoring Logic ----------
// score = category weight + urgency keywords + community upvotes + photo evidence

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

const URGENT_WORDS = [
  "accident", "fire", "live wire", "electric shock", "sparking", "flood", "collapsed",
  "open manhole", "injured", "child", "children", "school", "hospital", "emergency",
  "urgent", "dangerous", "danger", "death", "snake", "gas leak", "days", "since"
];

function levelFromScore(score) {
  if (score >= 65) return "Critical";
  if (score >= 45) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

function calculatePriority({ category, title = "", description = "", hasPhoto = false, upvotes = 0 }) {
  const text = (title + " " + description).toLowerCase();
  const reasons = [];

  let score = CATEGORY_WEIGHT[category] ?? 10;
  reasons.push(`Category "${category}" base score ${score}`);

  const hits = URGENT_WORDS.filter(w => text.includes(w));
  const urgencyBonus = Math.min(hits.length * 12, 36);
  if (urgencyBonus) {
    score += urgencyBonus;
    reasons.push(`Urgency words (${hits.join(", ")}) +${urgencyBonus}`);
  }

  const voteBonus = Math.min(upvotes * 5, 20);
  if (voteBonus) {
    score += voteBonus;
    reasons.push(`Community reports/upvotes +${voteBonus}`);
  }

  if (hasPhoto) {
    score += 5;
    reasons.push("Photo evidence attached +5");
  }

  score = Math.min(score, 100);
  return { score, level: levelFromScore(score), reasons };
}

module.exports = { calculatePriority, levelFromScore };
