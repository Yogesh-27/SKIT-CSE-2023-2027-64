// ---------- Rule-Based Classification Engine ----------
// Reads the title + description and decides the civic category using
// weighted keyword matching (English + common Hinglish words).

const CATEGORIES = {
  "Roads & Potholes": ["pothole", "road", "crack", "speed breaker", "footpath", "pavement", "bridge", "highway", "gaddha", "sadak", "broken road", "traffic"],
  "Water Supply": ["water supply", "no water", "water", "pipeline", "pipe leak", "tap", "tanker", "contaminated", "dirty water", "paani", "pani", "borewell"],
  "Sanitation & Garbage": ["garbage", "trash", "waste", "dustbin", "dump", "litter", "smell", "stink", "sweeping", "kachra", "kooda", "dirty", "unclean"],
  "Electricity & Street Lights": ["street light", "streetlight", "light", "electric", "power cut", "transformer", "wire", "pole", "bijli", "current", "short circuit", "voltage"],
  "Drainage & Sewage": ["drain", "drainage", "sewer", "sewage", "manhole", "overflow", "waterlogging", "water logging", "flood", "nali", "naala", "blocked drain"],
  "Public Safety": ["accident", "crime", "theft", "fire", "danger", "unsafe", "stray dog", "stray cattle", "open manhole", "collapsed", "harassment", "dark area"],
  "Parks & Public Spaces": ["park", "garden", "playground", "bench", "tree", "fallen tree", "encroachment", "public toilet", "toilet"]
};

function classify(title = "", description = "") {
  // title words count double
  const text = (" " + title + " " + title + " " + description).toLowerCase();
  const scores = {};
  const matchedWords = {};

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    let score = 0;
    const matched = [];
    for (const kw of keywords) {
      const occurrences = text.split(kw).length - 1;
      if (occurrences > 0) {
        // longer (more specific) keywords are worth more
        score += occurrences * (kw.includes(" ") ? 2 : 1);
        matched.push(kw);
      }
    }
    if (score > 0) {
      scores[category] = score;
      matchedWords[category] = matched;
    }
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) {
    return { category: "General Complaint", confidence: 0.3, matchedKeywords: [] };
  }
  const total = ranked.reduce((s, [, v]) => s + v, 0);
  const [bestCategory, bestScore] = ranked[0];
  return {
    category: bestCategory,
    confidence: Math.round((bestScore / total) * 100) / 100,
    matchedKeywords: matchedWords[bestCategory]
  };
}

module.exports = { classify, CATEGORIES };
