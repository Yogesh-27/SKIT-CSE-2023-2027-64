const RULES = [
  {
    category: "roads",
    department: "Roads & Infrastructure",
    keywords: ["pothole", "road", "footpath", "pavement", "street damage", "road damage"]
  },
  {
    category: "sanitation",
    department: "Sanitation",
    keywords: ["garbage", "waste", "litter", "trash", "dump", "dirty"]
  },
  {
    category: "water",
    department: "Water Supply",
    keywords: ["water leakage", "water leak", "pipeline", "water supply", "broken pipe"]
  },
  {
    category: "public_utilities",
    department: "Public Utilities",
    keywords: ["streetlight", "street light", "lamp post", "light outage", "electric pole"]
  },
  {
    category: "drainage",
    department: "Drainage & Sewerage",
    keywords: ["drain", "sewage", "sewer", "blocked drain", "overflow"]
  }
];

const EMERGENCY_KEYWORDS = [
  "accident",
  "fire",
  "dangerous",
  "electrocution",
  "open manhole",
  "life threatening"
];

export function classifyIssue({ title, description }) {
  const text = `${title} ${description}`.toLowerCase();

  let bestRule = null;
  let bestMatches = 0;

  for (const rule of RULES) {
    const matches = rule.keywords.filter((keyword) => text.includes(keyword)).length;

    if (matches > bestMatches) {
      bestMatches = matches;
      bestRule = rule;
    }
  }

  if (!bestRule) {
    return {
      category: "other",
      department: "General Civic Services"
    };
  }

  return {
    category: bestRule.category,
    department: bestRule.department
  };
}

export function calculatePriority({ title, description, latitude, longitude, category }) {
  const text = `${title} ${description}`.toLowerCase();
  let score = 20;

  if (category === "water" || category === "drainage") score += 10;
  if (category === "roads") score += 5;
  if (EMERGENCY_KEYWORDS.some((keyword) => text.includes(keyword))) score += 45;
  if (description.length > 250) score += 5;
  if (latitude != null && longitude != null) score += 10;

  score = Math.min(score, 100);

  const priority = score >= 70 ? "high" : score >= 40 ? "medium" : "low";

  return { priority, priorityScore: score };
}
