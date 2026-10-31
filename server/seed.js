import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "./src/config/db.js";
import Issue from "./src/models/Issue.js";

/**
 * CivicSolve — Database Seeder
 *
 * Populates the database with realistic civic issue samples for development
 * and demonstration purposes.
 *
 * Usage:  npm run seed          (from the server/ directory)
 *         node seed.js
 *
 * Author: Arun Kumar Yadav (Team Lead) — Database & API Integration
 */

const SEED_ISSUES = [
  // ── Roads & Potholes ─────────────────────────────────────────────────────
  {
    title: "Large pothole near Sindhi Camp bus stand",
    description: "There is a very large and dangerous pothole near Sindhi Camp bus stand on the main road. It is causing accidents every day and two-wheelers have fallen down multiple times. Urgent repair needed.",
    location: { latitude: 26.9124, longitude: 75.7873 },
    upvotes: 14
  },
  {
    title: "Broken road surface outside Jawahar Circle",
    description: "The road surface has completely broken down near Jawahar Circle flyover. Heavy vehicles have made it worse. The gaddha is over 1 foot deep and waterlogging happens during rain.",
    location: { latitude: 26.8845, longitude: 75.8034 }
  },
  {
    title: "No speed breakers near Government school Mansarovar",
    description: "There are no speed breakers on the road in front of Government school in Mansarovar sector 8. Children cross this road daily and vehicles drive at high speed. Very unsafe situation.",
    location: { latitude: 26.8521, longitude: 75.7611 },
    upvotes: 7
  },

  // ── Water Supply ─────────────────────────────────────────────────────────
  {
    title: "Water pipeline burst on MI Road",
    description: "A large water pipeline has burst on MI Road near Ajmeri Gate. Water is overflowing onto the road causing traffic jam and wastage. No water supply to nearby houses. Paani ki line toot gayi hai.",
    location: { latitude: 26.9205, longitude: 75.8074 },
    upvotes: 22,
    imageUrl: null
  },
  {
    title: "No water supply for 3 days in Vaishali Nagar",
    description: "Our entire locality in Vaishali Nagar C-scheme has not received water for the last 3 days. The tanker also does not come. Elderly residents and small children are suffering. Please restore water supply immediately.",
    location: { latitude: 26.8892, longitude: 75.7592 },
    upvotes: 31
  },
  {
    title: "Dirty and contaminated water from tap in Shyam Nagar",
    description: "The water coming from the tap in Shyam Nagar area is dirty brown in colour and has a bad smell. It is not drinkable and even causes skin irritation. This has been going on for 1 week.",
    location: { latitude: 26.9337, longitude: 75.7891 }
  },

  // ── Sanitation & Garbage ─────────────────────────────────────────────────
  {
    title: "Garbage not collected for 5 days in Raja Park",
    description: "The garbage collection vehicle has not come to Raja Park for 5 days. Waste is piling up near the dustbin area and the smell is unbearable. Dogs are spreading the kachra on the road. Request immediate collection.",
    location: { latitude: 26.9028, longitude: 75.8121 },
    upvotes: 18
  },
  {
    title: "Illegal garbage dump near Tonk Road flyover",
    description: "People have started dumping garbage illegally near the Tonk Road flyover underpass. The area has become a dump yard. It is creating a health hazard for residents nearby. The area smells terrible especially in mornings.",
    location: { latitude: 26.8765, longitude: 75.8234 },
    upvotes: 9
  },

  // ── Electricity & Street Lights ──────────────────────────────────────────
  {
    title: "Street light not working for 2 weeks in Malviya Nagar",
    description: "5 street lights on the main road in Malviya Nagar sector 6 have not been working for the past 2 weeks. The area is completely dark at night and residents fear theft and accidents. Bijli department has not responded.",
    location: { latitude: 26.8612, longitude: 75.8165 },
    upvotes: 12
  },
  {
    title: "Dangerous live wire hanging on road near Civil Lines",
    description: "A live electric wire has fallen and is hanging low on the road near Civil Lines metro station. It is very dangerous and can cause electrocution. The wire is sparking at night. Urgent action required immediately.",
    location: { latitude: 26.9283, longitude: 75.8112 },
    upvotes: 45,
    imageUrl: null
  },
  {
    title: "Power cut every day for 6 hours in Jhotwara",
    description: "There is an unscheduled power cut every day for 6 hours in Jhotwara residential colony near New Sanganer Road. This is not in the schedule. Transformer seems to be overloaded. Businesses and homes are badly affected.",
    location: { latitude: 26.9631, longitude: 75.7711 },
    upvotes: 27
  },

  // ── Drainage & Sewage ────────────────────────────────────────────────────
  {
    title: "Open manhole on road near Kartarpura industrial area",
    description: "There is an open manhole in the middle of the road near Kartarpura industrial area. The cover has been missing for over a week. It is extremely dangerous for two-wheelers, especially at night. Open nali with no cover.",
    location: { latitude: 26.9521, longitude: 75.7564 },
    upvotes: 8,
    imageUrl: null
  },
  {
    title: "Sewage overflow on road in Pratap Nagar colony",
    description: "The sewage drain is overflowing in Pratap Nagar colony near sector D. Sewage water has spread across the road and into some houses. The smell is unbearable. This has happened 3 times this month due to a blocked drain.",
    location: { latitude: 26.8401, longitude: 75.7892 },
    upvotes: 16
  },
  {
    title: "Waterlogging near Sanganer Airport road underpass",
    description: "The underpass near Sanganer Airport road floods completely even during light rain. Vehicles get stuck and have to turn back. The drainage system is completely blocked. This happens every monsoon but nobody fixes it.",
    location: { latitude: 26.8246, longitude: 75.8021 },
    upvotes: 33
  },

  // ── Public Safety ────────────────────────────────────────────────────────
  {
    title: "Stray dogs attacking people near Gopalpura bypass",
    description: "A large group of stray dogs have attacked 3 people near Gopalpura bypass in the last week. One child was bitten badly and required hospital treatment. The dogs are very aggressive especially in the evening. Very dangerous situation.",
    location: { latitude: 26.8712, longitude: 75.7698 },
    upvotes: 28
  },
  {
    title: "Unsafe boundary wall near Jaipur railway station",
    description: "The old boundary wall near the back entrance of Jaipur railway station is cracked and looks ready to collapse. Hundreds of people walk past this wall daily. A large portion has already fallen. Emergency repair needed.",
    location: { latitude: 26.9189, longitude: 75.7987 },
    upvotes: 19
  },

  // ── Parks & Public Spaces ────────────────────────────────────────────────
  {
    title: "Fallen tree blocking footpath in Central Park",
    description: "A large tree has fallen across the footpath in Central Park near Jawaharlal Nehru Marg. It has been lying there for 3 days and nobody has removed it. Pedestrians are being forced to walk on the road. Please remove it urgently.",
    location: { latitude: 26.9045, longitude: 75.8098 },
    upvotes: 5
  },
  {
    title: "Broken benches and damaged play equipment in Sector 5 park",
    description: "Most benches in the Sector 5 park are broken and the children's play equipment swings and slide are damaged. Children have been injured. The park is in very poor condition and needs immediate maintenance.",
    location: { latitude: 26.8934, longitude: 75.7845 }
  },

  // ── General Complaint ────────────────────────────────────────────────────
  {
    title: "Noise pollution from loudspeakers at night near temple",
    description: "Loudspeakers at the temple near our colony have been playing very loud music from 11 PM to 3 AM daily. Patients and students are unable to sleep. We have complained verbally but nobody listens.",
    location: { latitude: 26.8823, longitude: 75.7712 },
    upvotes: 11
  }
];

async function seed() {
  try {
    await connectDatabase();
    console.log("🌱 Starting database seed...");

    // Clear existing seeded data
    await Issue.deleteMany({});
    console.log("🗑️  Cleared existing issues.");

    // Dynamically import the classification engine
    const { classifyIssue, calculatePriority } = await import(
      "./src/services/classificationEngine.js"
    );

    const documents = SEED_ISSUES.map((raw) => {
      const { title, description, location, upvotes = 0, imageUrl = null } = raw;
      const classification = classifyIssue({ title, description });
      const priority = calculatePriority({
        title,
        description,
        category: classification.category,
        hasPhoto:  Boolean(imageUrl),
        upvotes
      });

      return {
        title,
        description,
        location,
        imageUrl,
        upvotes,
        ...classification,
        ...priority,
        status: "submitted",
        history: [
          {
            status: "submitted",
            note:   "Seeded issue — auto-classified and prioritised.",
            at:     new Date()
          }
        ]
      };
    });

    // Randomly assign some issues to different statuses for demo
    const statuses = ["submitted", "in_review", "assigned", "in_progress", "resolved"];
    documents.forEach((doc, index) => {
      if (index < 3)  doc.status = "resolved";
      else if (index < 6)  doc.status = "in_progress";
      else if (index < 9)  doc.status = "assigned";
      else if (index < 12) doc.status = "in_review";
    });

    const inserted = await Issue.insertMany(documents);
    console.log(`✅ Seeded ${inserted.length} civic issues successfully.`);
    console.log("\nCategory breakdown:");
    const counts = {};
    inserted.forEach((i) => { counts[i.category] = (counts[i.category] || 0) + 1; });
    Object.entries(counts).forEach(([cat, count]) => console.log(`   ${cat}: ${count}`));

  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Database connection closed.");
  }
}

seed();
