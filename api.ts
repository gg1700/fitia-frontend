export interface Food {
  id: number
  name: string
  portion: string
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  portion_g: number
}

export interface Alias {
  id: number
  alias: string
  food_id: number
  is_learned: boolean
}

export interface MealItem {
  id: number
  meal_id: number
  food_id: number | null
  food_name: string
  quantity: number
  unit: string
  portion_used: string
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface Meal {
  id: number
  datetime: string
  raw_text: string
  notes: string
  items: MealItem[]
  total_kcal: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
}

export interface DailyStats {
  fecha: string
  comidas: {
    id: number
    hora: string
    raw_text: string
    items: number
    kcal: number
  }[]
  total_comidas: number
  total_kcal: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
}

export interface WeeklyDay {
  fecha: string
  comidas: { id: number; hora: string; raw_text: string; items: number; kcal: number }[]
  total_comidas: number
  total_kcal: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
}

export interface WeeklyStats {
  dias: WeeklyDay[]
}

export interface AnalyzeResult {
  food_name: string
  quantity: number
  unit: string
  portion_used: string
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  food_id: number | null
}

export interface AnalyzeResponse {
  results: AnalyzeResult[]
  raw_text: string
}