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

function formatRelativeTime(isoDate?: string | null): string {
  if (!isoDate) return 'Reciente';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays}d`;
}

export async function fetchFeaturedNews(): Promise<FeaturedNews[]> {
  try {
    const { data, error } = await supabase
      .from('official_news')
      .select('id, source, title, content, tag, published_at')
      .order('published_at', { ascending: false })
      .limit(3);

    if (error) {
      console.warn('[newsService] Error leyendo official_news:', error.message);
      return FALLBACK_NEWS;
    }

    if (!data || data.length === 0) {
      return FALLBACK_NEWS;
    }

    return data.map((item) => ({
      id: item.id,
      source: item.source || 'Oficial',
      title: item.title,
      summary: item.content,
      tag: item.tag || 'Aviso',
      timeAgo: formatRelativeTime(item.published_at),
    }));
  } catch (err) {
    console.warn('[newsService] Excepción consultando official_news:', err);
    return FALLBACK_NEWS;
  }
}
