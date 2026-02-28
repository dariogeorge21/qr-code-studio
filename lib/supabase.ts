import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for your tables
export interface Contact {
  id?: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  created_at?: string;
}

export interface QRCounter {
  id?: number;
  total_generated: number;
  total_downloaded: number;
  updated_at?: string;
}

// Helper functions
export async function submitContact(contact: Contact) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contact])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting contact:', error);
    return { success: false, error };
  }
}

export async function getQRCounter(): Promise<QRCounter | null> {
  try {
    const { data, error } = await supabase
      .from('qr_counter')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching QR counter:', error);
    return null;
  }
}

export async function incrementQRGenerated() {
  try {
    const { data, error } = await supabase.rpc('increment_qr_generated');
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error incrementing QR generated:', error);
    return { success: false, error };
  }
}

export async function incrementQRDownloaded() {
  try {
    const { data, error } = await supabase.rpc('increment_qr_downloaded');
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error incrementing QR downloaded:', error);
    return { success: false, error };
  }
}
