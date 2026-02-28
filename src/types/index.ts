export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  isActive: boolean;
  createdAt: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
    dateOfBirth?: string;
    height?: number;
    weight?: number;
    fitnessLevel?: string;
    preferredUnits?: 'metric' | 'imperial';
  };
}

export interface Exercise {
  _id: string;
  name: string;
  description?: string;
  muscleGroups: string[];
  equipment?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
  createdAt: string;
}

export interface WorkoutExercise {
  exercise: Exercise | string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  notes?: string;
}

export interface Workout {
  _id: string;
  title: string;
  date: string;
  durationMinutes?: number;
  notes?: string;
  status: 'planned' | 'completed' | 'skipped';
  exercises: WorkoutExercise[];
  user: string;
  createdAt: string;
}

export interface NutritionLog {
  _id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
  user: string;
  createdAt: string;
}

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  type: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'custom';
  targetValue: number;
  currentValue: number;
  unit?: string;
  deadline?: string;
  status: 'active' | 'achieved' | 'abandoned';
  user: string;
  createdAt: string;
}

export interface ProgressEntry {
  _id: string;
  date: string;
  weight?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicep?: number;
    thigh?: number;
  };
  notes?: string;
  user: string;
  createdAt: string;
}

export interface WorkoutPlan {
  _id: string;
  name: string;
  description?: string;
  weeks: number;
  createdBy: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
