// ---------- Preprocessing Pipeline: validation + de-duplication ----------

function validateReport(body) {
  const errors = [];
  const title = (body.title || "").trim();
  const description = (body.description || "").trim();
  const lat = parseFloat(body.lat);
  const lng = parseFloat(body.lng);

  if (title.length < 5) errors.push("Title must be at least 5 characters.");
  if (title.length > 100) errors.push("Title must be at most 100 characters.");
  if (description.length < 15) errors.push("Description must be at least 15 characters.");
  if (description.length > 1000) errors.push("Description must be at most 1000 characters.");
  if (Number.isNaN(lat) || lat < -90 || lat > 90) errors.push("Valid latitude is required (-90 to 90).");
  if (Number.isNaN(lng) || lng < -180 || lng > 180) errors.push("Valid longitude is required (-180 to 180).");

  return {
    valid: errors.length === 0,
    errors,
    clean: {
      title,
      description,
      lat,
      lng,
      address: (body.address || "").trim().slice(0, 200),
      reporterName: (body.reporterName || "Anonymous").trim().slice(0, 60) || "Anonymous"
    }
  };
}

// Haversine formula - distance between two GPS points in metres
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DUPLICATE_RADIUS_M = 50;

// Same category + within 50 m + still open  => duplicate
function findDuplicate(existingIssues, category, lat, lng) {
  return existingIssues.find(
    i =>
      !i.duplicateOf &&
      i.category === category &&
      !["Resolved", "Rejected"].includes(i.status) &&
      distanceMeters(lat, lng, i.location.lat, i.location.lng) <= DUPLICATE_RADIUS_M
  );
}

module.exports = { validateReport, findDuplicate, distanceMeters, DUPLICATE_RADIUS_M };
