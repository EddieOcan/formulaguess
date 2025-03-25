import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/app/env';

// Aggiunto per supportare l'export statico
export const dynamic = "force-static";

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

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