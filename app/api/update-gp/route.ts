import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Aggiorna il Gran Premio di prova con il codice paese dell'Italia
    const { data, error } = await supabase
      .from('grand_prix')
      .update({ 
        country_code: 'IT',
        location: 'Monza, Italia'
      })
      .eq('name', 'prova')
      .select();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Gran Premio aggiornato con successo', 
      data 
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento del Gran Premio:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Errore nell\'aggiornamento', 
      error 
    }, { status: 500 });
  }
} 