import { supabase } from '@/shared/api/supabaseClient';

export interface FeaturedNews {
  id: string;
  source: string;
  title: string;
  summary: string;
  tag: string;
  timeAgo: string;
}

const FALLBACK_NEWS: FeaturedNews[] = [
  {
    id: '1',
    source: 'AEMET',
    title: 'Aviso especial por frente atlántico en el noroeste peninsular',
    summary: 'Se prevén acumulados significativos de precipitación en Galicia y rachas superiores a 70 km/h en costas cantábricas.',
    tag: 'Aviso Naranja',
    timeAgo: 'Hace 1h',
  },
  {
    id: '2',
    source: 'Meteocat / AEMET',
    title: 'Estabilidad térmica en el arco mediterráneo y Baleares',
    summary: 'Temperaturas suaves con predominio de cielos despejados y viento flojo de levante.',
    tag: 'Previsión',
    timeAgo: 'Hace 3h',
  },
];

export async function fetchFeaturedNews(): Promise<FeaturedNews[]> {
  try {
    // Intentar consultar noticias desde Supabase si existe la tabla
    const { data, error } = await supabase
      .from('official_news')
      .select('id, source, title, content, published_at')
      .order('published_at', { ascending: false })
      .limit(3);

    if (error || !data || data.length === 0) {
      return FALLBACK_NEWS;
    }

    return data.map((item) => ({
      id: item.id,
      source: item.source || 'Oficial',
      title: item.title,
      summary: item.content,
      tag: 'Aviso',
      timeAgo: 'Reciente',
    }));
  } catch {
    return FALLBACK_NEWS;
  }
}
