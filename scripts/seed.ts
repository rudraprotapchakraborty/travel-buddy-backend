/**
 * Fills the Travel Buddy database with realistic demo data.
 *
 *   npm run seed          create / refresh the demo data
 *   npm run seed:clear    remove it again
 *
 * Only documents belonging to accounts flagged `isDemo` are ever removed, so
 * real members and their content are never touched. Safe to run repeatedly.
 */
import { connectDB, disconnectDB } from "../src/config/db";
import { env } from "../src/config/env";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../src/config/demo";
import { hashPassword } from "../src/utils/password";
import { User } from "../src/models/User";
import { TravelPlan } from "../src/models/TravelPlan";
import { JoinRequest } from "../src/models/JoinRequest";
import { Review } from "../src/models/Review";
import { ReviewService } from "../src/modules/reviews/review.service";

type Gender = "men" | "women";
const photo = (g: Gender, n: number) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;
const day = 24 * 60 * 60 * 1000;
const inDays = (n: number) => new Date(Date.now() + n * day);

interface Person {
  key: string;
  email: string;
  fullName: string;
  role?: "ADMIN" | "USER";
  bio: string;
  location: string;
  interests: string[];
  visited: string[];
  image: string;
  verified?: boolean;
}

const people: Person[] = [
  {
    key: "admin",
    email: DEMO_ACCOUNTS[0].email,
    fullName: "Aria Admin",
    role: "ADMIN",
    bio: "Keeping the Travel Buddy community friendly and safe.",
    location: "Dhaka, Bangladesh",
    interests: ["community", "photography", "street food"],
    visited: ["Bangladesh", "Nepal", "Thailand", "Japan"],
    image: photo("women", 65),
    verified: true,
  },
  {
    key: "traveler",
    email: "tariq.rahman@travelbuddy.demo",
    fullName: "Tariq Rahman",
    bio: "Weekend hiker, slow-travel fan and terrible at packing light.",
    location: "Chattogram, Bangladesh",
    interests: ["hiking", "coffee", "history"],
    visited: ["India", "Nepal", "Malaysia"],
    image: photo("men", 32),
  },
  {
    key: "host",
    email: DEMO_ACCOUNTS[1].email,
    fullName: "Maya Fernandez",
    bio: "I plan trips with spreadsheets and spontaneity in equal parts. Always up for a new travel buddy.",
    location: "Lisbon, Portugal",
    interests: ["surfing", "food tours", "architecture"],
    visited: ["Portugal", "Spain", "Morocco", "Italy", "Greece"],
    image: photo("women", 44),
    verified: true,
  },
  {
    key: "noah",
    email: "noah.lindqvist@travelbuddy.demo",
    fullName: "Noah Lindqvist",
    bio: "Photographer chasing northern lights and quiet trails.",
    location: "Stockholm, Sweden",
    interests: ["photography", "aurora", "camping"],
    visited: ["Norway", "Iceland", "Finland", "Canada"],
    image: photo("men", 75),
  },
  {
    key: "priya",
    email: "priya.menon@travelbuddy.demo",
    fullName: "Priya Menon",
    bio: "Foodie first, traveller second. Will cross a country for a good dosa.",
    location: "Bengaluru, India",
    interests: ["street food", "markets", "yoga"],
    visited: ["Sri Lanka", "Vietnam", "Thailand", "Indonesia"],
    image: photo("women", 68),
    verified: true,
  },
  {
    key: "lucas",
    email: "lucas.moreau@travelbuddy.demo",
    fullName: "Lucas Moreau",
    bio: "Cyclist and amateur chef. Looking for people who like early starts.",
    location: "Lyon, France",
    interests: ["cycling", "cooking", "wine"],
    visited: ["France", "Switzerland", "Austria", "Croatia"],
    image: photo("men", 11),
  },
  {
    key: "amina",
    email: "amina.yusuf@travelbuddy.demo",
    fullName: "Amina Yusuf",
    bio: "Solo traveller turned group-trip organiser. Budget-friendly all the way.",
    location: "Nairobi, Kenya",
    interests: ["safari", "budget travel", "languages"],
    visited: ["Kenya", "Tanzania", "Egypt", "Morocco"],
    image: photo("women", 21),
  },
  {
    key: "kenji",
    email: "kenji.sato@travelbuddy.demo",
    fullName: "Kenji Sato",
    bio: "Rail pass enthusiast. Ask me about the best ramen in every prefecture.",
    location: "Osaka, Japan",
    interests: ["trains", "ramen", "onsen"],
    visited: ["Japan", "South Korea", "Taiwan", "Vietnam"],
    image: photo("men", 52),
    verified: true,
  },
  {
    key: "sofia",
    email: "sofia.rossi@travelbuddy.demo",
    fullName: "Sofia Rossi",
    bio: "Art history student who plans every trip around a museum.",
    location: "Florence, Italy",
    interests: ["museums", "art", "coffee"],
    visited: ["Italy", "Netherlands", "Belgium", "Czechia"],
    image: photo("women", 12),
  },
  {
    key: "ethan",
    email: "ethan.brooks@travelbuddy.demo",
    fullName: "Ethan Brooks",
    bio: "National parks collector. Van-life weekends and long road trips.",
    location: "Denver, USA",
    interests: ["national parks", "road trips", "climbing"],
    visited: ["USA", "Canada", "Mexico", "Costa Rica"],
    image: photo("men", 85),
  },
];

interface PlanSeed {
  owner: string;
  destination: string;
  start: number; // days from now
  length: number;
  type: "SOLO" | "COUPLE" | "FAMILY" | "FRIENDS";
  min: number;
  max: number;
  description: string;
  isPublic?: boolean;
  status?: "PLANNED" | "COMPLETED" | "CANCELLED";
}

const plans: PlanSeed[] = [
  { owner: "host", destination: "Lisbon & Sintra, Portugal", start: 12, length: 7, type: "FRIENDS", min: 700, max: 1100, description: "Seven days of pastel de nata, tram 28 and a day trip to Sintra's palaces. Looking for two relaxed companions who enjoy walking and good food." },
  { owner: "host", destination: "Algarve Coast, Portugal", start: 60, length: 5, type: "COUPLE", min: 600, max: 900, description: "Beach hopping and cliff walks along the Algarve. Hiring a small car; happy to split fuel." },
  { owner: "traveler", destination: "Kathmandu & Annapurna Base Camp, Nepal", start: 35, length: 12, type: "FRIENDS", min: 800, max: 1300, description: "Annapurna Base Camp trek in the shoulder season. Moderate fitness needed. Guide and permits split between us." },
  { owner: "traveler", destination: "Cox's Bazar, Bangladesh", start: 20, length: 4, type: "FRIENDS", min: 150, max: 300, description: "Long weekend at the world's longest natural beach. Sunrise walks, seafood and a trip to Inani." },
  { owner: "noah", destination: "Tromsø, Norway", start: 80, length: 6, type: "SOLO", min: 1200, max: 2000, description: "Northern lights photography trip. Open to joining a small group for a chase tour to share the cost." },
  { owner: "noah", destination: "Lofoten Islands, Norway", start: 120, length: 8, type: "FRIENDS", min: 1500, max: 2400, description: "Fishing villages, midnight sun and gentle hikes. Campervan shared between up to four people." },
  { owner: "priya", destination: "Hanoi to Ho Chi Minh City, Vietnam", start: 45, length: 14, type: "SOLO", min: 900, max: 1500, description: "North to south by train and bus, eating my way through every region. Flexible plan, open to company." },
  { owner: "priya", destination: "Kyoto & Osaka, Japan", start: 95, length: 9, type: "COUPLE", min: 1800, max: 2800, description: "Temples, tea houses and takoyaki. Booking a ryokan for two nights. Slow pace, lots of photography." },
  { owner: "lucas", destination: "Dolomites, Italy", start: 70, length: 7, type: "FRIENDS", min: 900, max: 1500, description: "Cycling and via ferrata in the Dolomites. Intermediate riders welcome; e-bike rental possible." },
  { owner: "lucas", destination: "Provence Lavender Route, France", start: 150, length: 5, type: "COUPLE", min: 700, max: 1200, description: "Lavender fields, markets and a wine tasting day. Easy driving, relaxed mornings." },
  { owner: "amina", destination: "Masai Mara, Kenya", start: 55, length: 5, type: "FAMILY", min: 1000, max: 1800, description: "Family-friendly safari with a reputable operator. Two spare seats in our vehicle to split the cost." },
  { owner: "amina", destination: "Zanzibar, Tanzania", start: 100, length: 6, type: "FRIENDS", min: 650, max: 1000, description: "Stone Town, spice farms and quiet beaches in the north. Budget guesthouses, ferry from Dar es Salaam." },
  { owner: "kenji", destination: "Hokkaido Winter, Japan", start: 140, length: 8, type: "FRIENDS", min: 1400, max: 2200, description: "Powder snow, onsen and seafood markets. Rail pass for the group, ski rental on arrival." },
  { owner: "sofia", destination: "Amsterdam & Rotterdam, Netherlands", start: 40, length: 4, type: "SOLO", min: 500, max: 800, description: "Museum-hopping long weekend: Rijksmuseum, Van Gogh and Rotterdam's modern architecture." },
  { owner: "ethan", destination: "Utah National Parks, USA", start: 90, length: 10, type: "FRIENDS", min: 900, max: 1400, description: "Arches, Zion, Bryce and Canyonlands in one road trip. Camping mostly; two seats in the 4x4." },
  { owner: "ethan", destination: "Patagonia Torres del Paine, Chile", start: 170, length: 9, type: "FRIENDS", min: 1800, max: 2600, description: "The W trek with refugio bookings. Looking for experienced hikers comfortable with changing weather." },
  { owner: "host", destination: "Marrakech & Sahara, Morocco", start: -45, length: 6, type: "FRIENDS", min: 700, max: 1000, description: "Souks, a desert night under the stars and a hammam. A wonderful trip with a great group.", status: "COMPLETED" },
  { owner: "traveler", destination: "Sundarbans, Bangladesh", start: -30, length: 3, type: "FRIENDS", min: 200, max: 350, description: "Boat safari through the mangrove forest. Great wildlife and an even better crew.", status: "COMPLETED" },
  { owner: "noah", destination: "Private Reykjavik Notes", start: 200, length: 3, type: "SOLO", min: 400, max: 700, description: "A private draft only visible to its owner.", isPublic: false },
];

const reviews: { from: string; to: string; plan?: string; rating: number; comment: string }[] = [
  { from: "traveler", to: "host", plan: "Marrakech & Sahara, Morocco", rating: 5, comment: "Maya planned everything beautifully and kept the group relaxed. Would travel with her again in a heartbeat." },
  { from: "priya", to: "host", plan: "Marrakech & Sahara, Morocco", rating: 5, comment: "Organised, funny and great with the bargaining in the souks." },
  { from: "kenji", to: "host", rating: 4, comment: "Reliable and communicative. Our pace differed a little but we had a great time." },
  { from: "host", to: "traveler", plan: "Sundarbans, Bangladesh", rating: 5, comment: "Tariq knows exactly how to find the best local guides. Calm, kind and always on time." },
  { from: "amina", to: "traveler", rating: 4, comment: "Easy-going companion with plenty of stories. Packs far too many snacks, which was a bonus." },
  { from: "ethan", to: "traveler", rating: 5, comment: "Great hiking partner. Patient on the steep parts and honest about what he wanted from the trip." },
  { from: "host", to: "priya", rating: 5, comment: "Priya found the best food in every city and shared everything. A joy to travel with." },
  { from: "lucas", to: "noah", rating: 5, comment: "Noah's photographs are stunning and he knows how to stay warm. Quiet, thoughtful, great company." },
  { from: "sofia", to: "kenji", rating: 4, comment: "Kenji's rail knowledge saved us hours. Very punctual." },
  { from: "kenji", to: "amina", rating: 5, comment: "Amina negotiated every price like a pro and kept our budget on track." },
  { from: "noah", to: "ethan", rating: 4, comment: "Solid road-trip driver and a good sense of humour on long stretches." },
  { from: "amina", to: "lucas", rating: 3, comment: "Lovely person, but the early starts were tougher than advertised." },
];

const requests: { plan: string; from: string; status: "PENDING" | "ACCEPTED" | "REJECTED"; message: string }[] = [
  { plan: "Lisbon & Sintra, Portugal", from: "traveler", status: "PENDING", message: "Hi Maya! I will be in Lisbon that week and would love to join the Sintra day trip." },
  { plan: "Lisbon & Sintra, Portugal", from: "priya", status: "ACCEPTED", message: "Food tour lover here. Happy to share a rental for the day trips." },
  { plan: "Kathmandu & Annapurna Base Camp, Nepal", from: "ethan", status: "ACCEPTED", message: "Experienced hiker, completed the Torres del Paine W trek last year." },
  { plan: "Kathmandu & Annapurna Base Camp, Nepal", from: "sofia", status: "REJECTED", message: "I would love to join, though I have not done a trek this long before." },
  { plan: "Cox's Bazar, Bangladesh", from: "host", status: "PENDING", message: "Visiting family in Dhaka that week. Could I tag along for the weekend?" },
  { plan: "Hanoi to Ho Chi Minh City, Vietnam", from: "kenji", status: "PENDING", message: "I know the northern train routes well and can join for the first week." },
  { plan: "Dolomites, Italy", from: "traveler", status: "PENDING", message: "Intermediate rider, I would love to try via ferrata with a group." },
  { plan: "Dolomites, Italy", from: "host", status: "PENDING", message: "Strong hiker, intermediate on a road bike. Would love to join for the via ferrata days." },
  { plan: "Hokkaido Winter, Japan", from: "host", status: "ACCEPTED", message: "I have wanted to see Hokkaido in winter for years. Happy to share a rental car." },
  { plan: "Utah National Parks, USA", from: "noah", status: "ACCEPTED", message: "I can drive part of the way and bring photography gear for sunrise stops." },
];

async function clearDemo() {
  const demoUsers = await User.find({ isDemo: true }).select("_id");
  const ids = demoUsers.map((u) => u._id);
  const planIds = await TravelPlan.distinct("_id", { user: { $in: ids } });
  const [p, j, r, u] = await Promise.all([
    TravelPlan.deleteMany({ user: { $in: ids } }),
    JoinRequest.deleteMany({
      $or: [{ requester: { $in: ids } }, { host: { $in: ids } }, { travelPlan: { $in: planIds } }],
    }),
    Review.deleteMany({
      $or: [{ reviewer: { $in: ids } }, { reviewee: { $in: ids } }, { travelPlan: { $in: planIds } }],
    }),
    User.deleteMany({ _id: { $in: ids } }),
  ]);
  console.log(
    `Removed ${u.deletedCount} demo users, ${p.deletedCount} plans, ${j.deletedCount} requests, ${r.deletedCount} reviews`
  );
}

async function seed() {
  await clearDemo();

  const password = await hashPassword(DEMO_PASSWORD);
  const byKey: Record<string, any> = {};
  for (const p of people) {
    byKey[p.key] = await User.create({
      email: p.email,
      password,
      fullName: p.fullName,
      role: p.role ?? "USER",
      bio: p.bio,
      currentLocation: p.location,
      travelInterests: p.interests,
      visitedCountries: p.visited,
      profileImageUrl: p.image,
      emailVerified: true,
      isDemo: true,
      isVerified: Boolean(p.verified),
      subscriptionStatus: p.verified ? "ACTIVE" : "NONE",
      subscriptionPlan: p.verified ? "YEARLY" : undefined,
      subscriptionEndAt: p.verified ? inDays(300) : undefined,
    });
  }

  const planByDestination: Record<string, any> = {};
  for (const p of plans) {
    planByDestination[p.destination] = await TravelPlan.create({
      user: byKey[p.owner]._id,
      destination: p.destination,
      startDate: inDays(p.start),
      endDate: inDays(p.start + p.length),
      budgetMin: p.min,
      budgetMax: p.max,
      travelType: p.type,
      description: p.description,
      isPublic: p.isPublic ?? true,
      status: p.status ?? "PLANNED",
    });
  }

  for (const r of requests) {
    const plan = planByDestination[r.plan];
    await JoinRequest.create({
      travelPlan: plan._id,
      requester: byKey[r.from]._id,
      host: plan.user,
      status: r.status,
      message: r.message,
    });
  }

  for (const r of reviews) {
    await Review.create({
      reviewer: byKey[r.from]._id,
      reviewee: byKey[r.to]._id,
      travelPlan: r.plan ? planByDestination[r.plan]?._id : undefined,
      rating: r.rating,
      comment: r.comment,
    });
  }
  for (const key of new Set(reviews.map((r) => r.to))) {
    await ReviewService.recalculateRating(String(byKey[key]._id));
  }

  console.log(
    `Seeded ${people.length} users, ${plans.length} plans, ${requests.length} join requests, ${reviews.length} reviews`
  );
  console.log(`Database: ${env.MONGODB_DB}`);
  console.log("Test logins (password for all):", DEMO_PASSWORD);
  for (const a of DEMO_ACCOUNTS) console.log(`  ${a.label.padEnd(9)} ${a.email}`);
}

(async () => {
  try {
    await connectDB();
    if (process.argv[2] === "clear") await clearDemo();
    else await seed();
  } catch (err) {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
})();
