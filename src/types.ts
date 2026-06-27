export interface Citizen {
  id: string;
  name: string;
  email?: string;
  password?: string;
  role?: "citizen" | "official";
  xp: number;
  badges: Badge[];
  verifiedCount: number;
  reportedCount: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  unlockedAt: string;
}

export type IssueCategory =
  | "Pothole"
  | "Water Leakage"
  | "Damaged Streetlight"
  | "Waste Management"
  | "Public Infrastructure"
  | "Other";
export type IssueStatus =
  "Reported" | "Verified" | "Rejected" | "Unsure" | "In Progress" | "Resolved";
export type IssuePriority = "Low" | "Medium" | "High" | "Critical";

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
}

export interface IssueVerification {
  userId: string;
  userName: string;
  approved: boolean; // true = verified, false = disputed
  comment?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  imageUrl?: string;
  location: LocationCoordinates;
  status: IssueStatus;
  priority: IssuePriority;
  reporterId: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
  verifications: IssueVerification[];
  comments: Comment[];
  upvotes: number;
  upvotedBy: string[]; // userIds
  aiTags: string[];
  safetyAdvice?: string;
  resolutionNotes?: string;
  inProgressDetails?: {
    officialId: string;
    officialName: string;
    workId: string;
    eta: string;
  };
  resolvedBy?: {
    officialId: string;
    officialName: string;
  };
}

export interface AIAnalysisResult {
  title: string;
  category: IssueCategory;
  priority: IssuePriority;
  aiTags: string[];
  safetyAdvice: string;
}

export interface PredictiveInsight {
  id: string;
  title: string;
  description: string;
  riskScore: number; // 1-100
  potentialImpact: string;
  recommendedAction: string;
  category: IssueCategory;
  predictedLocation: string;
  triggerFactor: string; // Weather, Infrastructure Age, Historical Cluster
}
