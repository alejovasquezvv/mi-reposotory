import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type CropType = 'cafe' | 'aguacate_hass';
export type Severity = 'baja' | 'media' | 'alta';

export interface Harvest {
  id: string;
  crop_type: CropType;
  lot_name: string;
  kilos: number;
  harvest_date: string;
  notes?: string;
  created_at: string;
}

export interface PestReport {
  id: string;
  crop_type: CropType;
  lot_name: string;
  pest_name: string;
  severity: Severity;
  description: string;
  photo_url?: string;
  latitude?: number;
  longitude?: number;
  report_date: string;
  created_at: string;
}
