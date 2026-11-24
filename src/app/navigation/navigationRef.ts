import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';
import { useHomeStore } from '@/features/home/store/useHomeStore';
import { useClaudyStore } from '@/features/claudy/store/useClaudyStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navega directamente a la pestaña Inicio y solicita el desplazamiento
 * suave hacia el recomendador de ropa ("¿Qué me pongo hoy?").
 */
export function navigateToHomeOutfitRecommender(): void {
  // Asegurar que la app haya salido del welcome gate y cierre modales bloqueantes
  const profileStore = useProfileStore.getState();
  if (!profileStore.hasEnteredApp) {
    profileStore.continueAsGuest();
  }

  const claudyStore = useClaudyStore.getState();
  if (claudyStore.isGreetingVisible) {
    claudyStore.dismissGreeting();
  }
  if (claudyStore.isCustomizerVisible) {
    claudyStore.closeCustomizer();
  }

  useHomeStore.getState().requestScrollToOutfit();

  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', { screen: 'Home' });
  }
}
