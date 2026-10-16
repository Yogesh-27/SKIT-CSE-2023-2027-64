// CivicSolve's single rule-based classification and priority engine.
// Title matches count twice. Supports common English and Hinglish terms.
export const CATEGORIES = {
  "Roads & Potholes": ["pothole", "road damage", "broken road", "speed breaker", "footpath", "pavement", "bridge", "highway", "gaddha", "sadak", "road", "crack"],
  "Water Supply": ["water leakage", "water leak", "no water", "water supply", "pipeline", "broken pipe", "contaminated water", "dirty water", "paani", "pani", "borewell", "tap", "tanker", "water"],
  "Sanitation & Garbage": ["garbage collection", "garbage", "trash", "waste", "dustbin", "dump", "litter", "stink", "kachra", "kooda", "unclean", "sanitation"],
  "Electricity & Street Lights": ["street light", "streetlight", "power cut", "live wire", "electric pole", "short circuit", "voltage", "bijli", "current", "transformer", "electricity", "light"],
  "Drainage & Sewage": ["blocked drain", "waterlogging", "water logging", "open manhole", "sewage", "sewer", "drainage", "drain", "nali", "naala", "overflow", "flood"],
  "Public Safety": ["accident", "crime", "theft", "fire", "electrocution", "unsafe", "stray dog", "stray cattle", "collapsed", "harassment", "danger", "hospital emergency"],
  "Parks & Public Spaces": ["fallen tree", "public toilet", "playground", "encroachment", "park", "garden", "bench", "tree", "toilet"],
  "General Complaint": []
};

const CATEGORY_WEIGHT = {
  "Roads & Potholes": 25, "Water Supply": 30, "Sanitation & Garbage": 20,
  "Electricity & Street Lights": 30, "Drainage & Sewage": 25,
  "Public Safety": 40, "Parks & Public Spaces": 10, "General Complaint": 10
};
const URGENCY_RULES = [
  ["live wire", 20], ["electrocution", 20], ["hospital", 15], ["accident", 15],
  ["fire", 15], ["open manhole", 15], ["emergency", 15], ["injured", 12],
  ["sparking", 12], ["collapsed", 12], ["flood", 12], ["dangerous", 10],
  ["urgent", 8], ["unsafe", 8], ["school", 5], ["child", 5]
];
const DEPARTMENTS = {
  "Roads & Potholes": "Public Works Department (PWD)",
  "Water Supply": "Water Supply Department (PHED)",
  "Sanitation & Garbage": "Municipal Sanitation Department",
  "Electricity & Street Lights": "Electricity Department (DISCOM)",
  "Drainage & Sewage": "Sewerage & Drainage Department",
  "Public Safety": "Police / Disaster Management Cell",
  "Parks & Public Spaces": "Horticulture & Parks Department",
  "General Complaint": "Municipal Help Desk"
};
const SLA_HOURS = { critical: 6, high: 24, medium: 72, low: 168 };

function normalize(value = "") {
  return String(value).toLocaleLowerCase("en-IN").replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
}

export function classifyIssue({ title = "", description = "" } = {}) {
  const normalizedTitle = normalize(title);
  const normalizedDescription = normalize(description);
  const allText = `${normalizedTitle} ${normalizedDescription}`;
  const scores = [];
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    let score = 0;
    const matchedKeywords = [];
    for (const keyword of keywords) {
      const kw = normalize(keyword);
      // Count phrase/word occurrences without matching fragments inside unrelated words.
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
      const pattern = new RegExp("(^|\\s)" + escaped + "(?=$|\\s)", "g");
      const titleMatches = (normalizedTitle.match(pattern) || []).length;
      const descriptionMatches = (normalizedDescription.match(pattern) || []).length;
      const count = titleMatches * 2 + descriptionMatches;
      if (count > 0) {
        score += count * (kw.includes(" ") ? 2 : 1);
        matchedKeywords.push(keyword);
      }
    }
    if (score > 0) scores.push({ category, score, matchedKeywords });
  }
  scores.sort((a, b) => b.score - a.score || b.category.localeCompare(a.category));
  const best = scores[0];
  if (!best) return { category: "General Complaint", department: DEPARTMENTS["General Complaint"], confidence: 0.3, matchedKeywords: [] };
  const total = scores.reduce((sum, item) => sum + item.score, 0);
  return {
    category: best.category,
    department: DEPARTMENTS[best.category],
    confidence: Math.round((best.score / total) * 100) / 100,
    matchedKeywords: best.matchedKeywords
  };
}

export function calculatePriority({ title = "", description = "", category = "General Complaint", hasPhoto = false, upvotes = 0 } = {}) {
  const text = normalize(`${title} ${description}`);
  let score = CATEGORY_WEIGHT[category] ?? CATEGORY_WEIGHT["General Complaint"];
  const reasons = [`Category base score +${score}`];
  const urgencyHits = URGENCY_RULES.filter(([word]) => {
    const escaped = normalize(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    const pattern = new RegExp("(^|\\s)" + escaped + "(?=$|\\s)");
    return pattern.test(text);
  });
  const urgencyBonus = Math.min(urgencyHits.reduce((sum, [, points]) => sum + points, 0), 40);
  if (urgencyBonus) {
    score += urgencyBonus;
    reasons.push(`Urgency indicators (${urgencyHits.map(([word]) => word).join(", ")}) +${urgencyBonus}`);
  }
  const voteBonus = Math.min(Math.max(0, Number(upvotes) || 0) * 5, 20);
  if (voteBonus) { score += voteBonus; reasons.push(`Community upvotes +${voteBonus}`); }
  if (hasPhoto) { score += 5; reasons.push("Photo evidence +5"); }
  score = Math.min(100, Math.max(0, Math.round(score)));
  const priority = score >= 75 ? "critical" : score >= 55 ? "high" : score >= 30 ? "medium" : "low";
  const slaHours = SLA_HOURS[priority];
  return {
    priority, priorityScore: score, priorityReasons: reasons,
    slaHours, dueBy: new Date(Date.now() + slaHours * 3600000).toISOString()
  };
}

export function routeDepartment(category) {
  return DEPARTMENTS[category] ?? DEPARTMENTS["General Complaint"];
}

export function haversineMeters(a, b) {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
