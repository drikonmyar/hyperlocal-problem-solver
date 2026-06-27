import { Issue, Citizen, Badge, PredictiveInsight } from "../types";

export const INITIAL_CITIZENS: Citizen[] = [
  {
    id: "user-current",
    name: "Alex Rivera",
    xp: 650,
    reportedCount: 4,
    verifiedCount: 12,
    badges: [
      {
        id: "badge-1",
        name: "First Reporter",
        description: "Successfully logged your first hyperlocal community issue.",
        icon: "AlertTriangle",
        unlockedAt: "2026-05-10T14:30:00Z"
      },
      {
        id: "badge-2",
        name: "Hawk Eye",
        description: "Verified 10 other citizen reports correctly.",
        icon: "Eye",
        unlockedAt: "2026-06-01T09:15:00Z"
      }
    ]
  },
  {
    id: "user-2",
    name: "Elena Rostova",
    xp: 1200,
    reportedCount: 9,
    verifiedCount: 24,
    badges: [
      {
        id: "badge-1",
        name: "First Reporter",
        description: "Successfully logged your first hyperlocal community issue.",
        icon: "AlertTriangle",
        unlockedAt: "2026-04-12T11:00:00Z"
      },
      {
        id: "badge-2",
        name: "Hawk Eye",
        description: "Verified 10 other citizen reports correctly.",
        icon: "Eye",
        unlockedAt: "2026-05-02T16:20:00Z"
      },
      {
        id: "badge-3",
        name: "Civic Pillar",
        description: "Achieved over 1,000 community impact points.",
        icon: "Award",
        unlockedAt: "2026-06-15T18:40:00Z"
      }
    ]
  },
  {
    id: "user-3",
    name: "Marcus Vance",
    xp: 950,
    reportedCount: 6,
    verifiedCount: 18,
    badges: [
      {
        id: "badge-1",
        name: "First Reporter",
        description: "Successfully logged your first hyperlocal community issue.",
        icon: "AlertTriangle",
        unlockedAt: "2026-05-01T10:00:00Z"
      },
      {
        id: "badge-3",
        name: "Civic Pillar",
        description: "Achieved over 1,000 community impact points.",
        icon: "Award",
        unlockedAt: "2026-06-25T11:30:00Z"
      }
    ]
  },
  {
    id: "user-4",
    name: "Siddharth Mehta",
    xp: 450,
    reportedCount: 3,
    verifiedCount: 8,
    badges: [
      {
        id: "badge-1",
        name: "First Reporter",
        description: "Successfully logged your first hyperlocal community issue.",
        icon: "AlertTriangle",
        unlockedAt: "2026-06-10T15:22:00Z"
      }
    ]
  }
];

export const ALL_BADGES: Omit<Badge, 'unlockedAt'>[] = [
  {
    id: "badge-1",
    name: "First Reporter",
    description: "Logged your first community issue to help neighbors.",
    icon: "AlertTriangle"
  },
  {
    id: "badge-2",
    name: "Hawk Eye",
    description: "Verified 10 other citizen reports correctly.",
    icon: "Eye"
  },
  {
    id: "badge-3",
    name: "Civic Pillar",
    description: "Reached 1,000+ community impact points.",
    icon: "Award"
  },
  {
    id: "badge-4",
    name: "Elite Solver",
    description: "Your reports led to 5 resolved city works.",
    icon: "CheckCircle"
  }
];

export const INITIAL_ISSUES: Issue[] = [
  {
    id: "issue-1",
    title: "Deep Pothole on Broadway",
    description: "A very deep pothole has opened up right in the middle of Broadway Blvd. It's about 15 inches wide and several inches deep. It has already caused two vehicle tire bursts today. Commuters are swerving dangerously to avoid it.",
    category: "Pothole",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80",
    location: {
      lat: 40.7135,
      lng: -74.0085,
      address: "245 Broadway Blvd, Central District"
    },
    status: "Reported",
    priority: "High",
    reporterId: "user-2",
    reporterName: "Elena Rostova",
    createdAt: "2026-06-25T14:22:00Z",
    updatedAt: "2026-06-25T14:22:00Z",
    upvotes: 24,
    upvotedBy: ["user-current", "user-3", "user-4"],
    aiTags: ["Road Safety", "Vehicle Hazard", "Commute Block"],
    safetyAdvice: "Slow down when approaching the intersection. Avoid swerving into oncoming traffic; seek alternative lanes early.",
    verifications: [
      {
        userId: "user-current",
        userName: "Alex Rivera",
        approved: true,
        comment: "Can confirm, almost ruined my sedan's suspension on this. It's extremely dangerous at night.",
        createdAt: "2026-06-25T15:10:00Z"
      },
      {
        userId: "user-3",
        userName: "Marcus Vance",
        approved: true,
        comment: "Very deep! Placed a temporary traffic cone near it, but it needs a proper asphalt patch immediately.",
        createdAt: "2026-06-25T16:05:00Z"
      }
    ],
    comments: [
      {
        id: "c1",
        userId: "user-4",
        userName: "Siddharth Mehta",
        text: "Reported this on the municipal website too, but got no response. Glad to see it tracked here with votes!",
        createdAt: "2026-06-25T18:30:00Z"
      }
    ]
  },
  {
    id: "issue-2",
    title: "Major Water Main Pipe Leak",
    description: "Large volume of clean water is continuously bubbling up from beneath the pavement near Oakwood Elementary. The sidewalk is starting to shift and there is minor localized flooding in the bicycle lane.",
    category: "Water Leakage",
    imageUrl: "https://images.unsplash.com/photo-1542013936693-8848e5744430?auto=format&fit=crop&w=600&q=80",
    location: {
      lat: 40.7102,
      lng: -74.0021,
      address: "102 Oakwood Road, Suburban Blocks"
    },
    status: "Verified",
    priority: "High",
    reporterId: "user-3",
    reporterName: "Marcus Vance",
    createdAt: "2026-06-26T08:15:00Z",
    updatedAt: "2026-06-26T10:30:00Z",
    upvotes: 18,
    upvotedBy: ["user-2", "user-current"],
    aiTags: ["Utility Malfunction", "Sidewalk Flooding", "Resource Waste"],
    safetyAdvice: "Exercise caution while walking. Sidewalk structural integrity might be compromised due to subterranean washouts.",
    verifications: [
      {
        userId: "user-current",
        userName: "Alex Rivera",
        approved: true,
        comment: "Still leaking as of 10 AM. Ground feels spongy.",
        createdAt: "2026-06-26T10:00:00Z"
      },
      {
        userId: "user-2",
        userName: "Elena Rostova",
        approved: true,
        comment: "The water volume is increasing. We need the utility company here ASAP.",
        createdAt: "2026-06-26T10:30:00Z"
      }
    ],
    comments: []
  },
  {
    id: "issue-3",
    title: "Damaged Lamppost #14",
    description: "The street lamppost outside the community park entrance is flickering and humming, then shuts off entirely. The surrounding pedestrian crosswalk is completely dark, creating an unsafe spot for children and night runners.",
    category: "Damaged Streetlight",
    imageUrl: "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&w=600&q=80",
    location: {
      lat: 40.7168,
      lng: -74.0042,
      address: "Parkside Lane (Park West Entrance)"
    },
    status: "In Progress",
    priority: "Medium",
    reporterId: "user-current",
    reporterName: "Alex Rivera",
    createdAt: "2026-06-24T21:05:00Z",
    updatedAt: "2026-06-26T14:00:00Z",
    upvotes: 9,
    upvotedBy: ["user-3"],
    aiTags: ["Public Lighting", "Night Safety", "Park Security"],
    safetyAdvice: "Use your smartphone flashlight when crossing. Stay in groups if navigating this segment after dusk.",
    verifications: [
      {
        userId: "user-3",
        userName: "Marcus Vance",
        approved: true,
        comment: "Verified. Walked past last night and it was pitch black. Reported to maintenance.",
        createdAt: "2026-06-25T01:30:00Z"
      }
    ],
    comments: [
      {
        id: "c2",
        userId: "admin",
        userName: "City Works Dept",
        text: "Work order #9942 issued. Engineering team scheduled to replace the faulty LED driver ballast on Friday.",
        createdAt: "2026-06-26T14:00:00Z"
      }
    ]
  },
  {
    id: "issue-4",
    title: "Overflowing Industrial Bin",
    description: "Commercial bin in the alley behind the market has been overflowing with packaging waste and rotten organic material. It's attracting pests, blocking the fire escape corridor, and creating a heavy odor.",
    category: "Waste Management",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
    location: {
      lat: 40.7151,
      lng: -74.0125,
      address: "Market Alley 3, Commercial Hub"
    },
    status: "Resolved",
    priority: "Medium",
    reporterId: "user-4",
    reporterName: "Siddharth Mehta",
    createdAt: "2026-06-23T11:40:00Z",
    updatedAt: "2026-06-25T16:50:00Z",
    upvotes: 14,
    upvotedBy: ["user-current", "user-2", "user-3"],
    aiTags: ["Sanitation", "Hygiene Control", "Odor Complaint"],
    safetyAdvice: "Avoid walking through the narrow alley path until cleared. Use the front market boulevard instead.",
    resolutionNotes: "Sanitation squad cleared the entire bin corridor and issued a warning notice to the adjacent grocer regarding waste sorting guidelines.",
    verifications: [
      {
        userId: "user-current",
        userName: "Alex Rivera",
        approved: true,
        comment: "Completely cleared now! Great work.",
        createdAt: "2026-06-25T16:50:00Z"
      }
    ],
    comments: []
  },
  {
    id: "issue-5",
    title: "Broken Playground Safety Mat",
    description: "The protective rubber tiles beneath the jungle gym are torn and detached, exposing the hard concrete base. Two kids fell and scraped themselves yesterday due to the uneven trip hazard.",
    category: "Public Infrastructure",
    imageUrl: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=600&q=80",
    location: {
      lat: 40.7118,
      lng: -74.0098,
      address: "Pine Hills Children Playground"
    },
    status: "Reported",
    priority: "High",
    reporterId: "user-2",
    reporterName: "Elena Rostova",
    createdAt: "2026-06-27T07:10:00Z",
    updatedAt: "2026-06-27T07:10:00Z",
    upvotes: 8,
    upvotedBy: ["user-current", "user-4"],
    aiTags: ["Playground Safety", "Pedestrian Trip", "Parks Maintenance"],
    safetyAdvice: "Steer toddlers away from the jungle gym swing quadrant until the padding is re-glued.",
    verifications: [],
    comments: []
  }
];

export const MAP_CENTER = { lat: 40.7135, lng: -74.0065 };
export const MAP_BOUNDS = {
  latMin: 40.7090,
  latMax: 40.7180,
  lngMin: -74.0140,
  lngMax: -74.0000
};
