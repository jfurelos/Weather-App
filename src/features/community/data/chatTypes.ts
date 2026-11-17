export type ChatType = 'general' | 'incidents' | 'landscapes';

export interface ChatRoomDefinition {
  type: ChatType;
  title: string;
  badgeText: string;
  shortDesc: string;
  getDefaultWelcomeMessage: (comarcaName: string) => string;
}

export const COMARCA_CHAT_ROOMS: ChatRoomDefinition[] = [
  {
    type: 'general',
    title: 'General',
    badgeText: 'Tiempo y día a día',
    shortDesc: 'Debate abierto sobre el tiempo actual y las previsiones de la zona.',
    getDefaultWelcomeMessage: (comarcaName: string) =>
      `Conversación general sobre el tiempo, temperaturas y previsiones del día a día en ${comarcaName}.`,
  },
  {
    type: 'incidents',
    title: 'Accidentes y problemas',
    badgeText: 'Incidencias locales',
    shortDesc: 'Alertas rápidas sobre carreteras cortadas, inundaciones o daños por temporal.',
    getDefaultWelcomeMessage: (comarcaName: string) =>
      `Reporta incidencias, accidentes, carreteras cortadas o problemas meteorológicos en ${comarcaName}.`,
  },
  {
    type: 'landscapes',
    title: 'Cielo y Paisajes',
    badgeText: 'Fotos y observaciones',
    shortDesc: 'Comparte atardeceres, nubes espectaculares y vistas del paisaje local.',
    getDefaultWelcomeMessage: (comarcaName: string) =>
      `Comparte tus fotos del cielo, amaneceres, nubes llamativas y paisajes de ${comarcaName}.`,
  },
];

export function getChatRoomDefinition(type: ChatType): ChatRoomDefinition {
  return (
    COMARCA_CHAT_ROOMS.find((room) => room.type === type) || COMARCA_CHAT_ROOMS[0]
  );
}
