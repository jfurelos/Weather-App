import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Star,
  MessageSquare,
  AlertTriangle,
  Camera,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { COMARCA_CHAT_ROOMS, ChatType } from '../data/chatTypes';
import { useComarcasForumStore } from '../store/useComarcasForumStore';
import { RootStackParamList } from '@/app/navigation/types';

type ComarcaDetailRouteProp = RouteProp<RootStackParamList, 'ComarcaDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ComarcaDetailScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ComarcaDetailRouteProp>();

  const { comarcaId, comarcaName, provinceName } = route.params;

  const {
    isFavorite,
    toggleFavoriteComarca,
    favoriteLimitMessage,
    clearFavoriteLimitMessage,
  } = useComarcasForumStore();
  const favorite = isFavorite(comarcaId);

  const handleOpenChat = (chatType: ChatType) => {
    navigation.navigate('ChatConversation', {
      comarcaId,
      comarcaName,
      provinceName,
      chatType,
    });
  };

  const getChatIcon = (type: ChatType) => {
    switch (type) {
      case 'general':
        return <MessageSquare size={22} color={colors.primary} />;
      case 'incidents':
        return <AlertTriangle size={22} color={colors.warning} />;
      case 'landscapes':
        return <Camera size={22} color={colors.rain} />;
    }
  };

  const getBadgeTone = (type: ChatType) => {
    switch (type) {
      case 'general':
        return 'brand' as const;
      case 'incidents':
        return 'warning' as const;
      case 'landscapes':
        return 'rain' as const;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header superior */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.roundBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver al listado de comarcas"
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Typography variant="caption" color="secondary">
            PROVINCIA DE {provinceName.toUpperCase()}
          </Typography>
          <Typography variant="h3" numberOfLines={1}>
            {comarcaName}
          </Typography>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.roundBtn,
            {
              backgroundColor: favorite ? '#FEF3C7' : colors.surface,
              borderColor: favorite ? '#F59E0B' : colors.border,
            },
          ]}
          onPress={() =>
            toggleFavoriteComarca({
              id: comarcaId,
              provinceId: '',
              provinceName,
              name: comarcaName,
              description: '',
              activeCount: 1,
            })
          }
          accessibilityLabel="Marcar favorita"
        >
          <Star
            size={18}
            color={favorite ? '#F59E0B' : colors.textSecondary}
            fill={favorite ? '#F59E0B' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {favoriteLimitMessage && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={clearFavoriteLimitMessage}
            style={{
              backgroundColor: colors.warning + '18',
              borderColor: colors.warning,
              borderWidth: 1,
              borderRadius: spacing.borderRadiusMd,
              padding: spacing.md,
            }}
          >
            <Typography variant="captionMedium" style={{ color: colors.textPrimary }}>
              {favoriteLimitMessage} (Pulsa para cerrar)
            </Typography>
          </TouchableOpacity>
        )}

        <View style={styles.intro}>
          <Typography variant="hero" style={styles.introTitle}>
            Chats de {comarcaName}
          </Typography>
          <Typography variant="body" color="secondary">
            Todas las comarcas disponen de exactamente tres canales de debate especializados. Selecciona en cuál deseas participar:
          </Typography>
        </View>

        {/* Las 3 tarjetas de chats */}
        <View style={styles.cardsList}>
          {COMARCA_CHAT_ROOMS.map((chat) => (
            <TouchableOpacity
              key={chat.type}
              activeOpacity={0.8}
              onPress={() => handleOpenChat(chat.type)}
            >
              <Card style={styles.chatCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconAndTitle}>
                    <View style={[styles.iconBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      {getChatIcon(chat.type)}
                    </View>
                    <View style={styles.titles}>
                      <Typography variant="h2">{chat.title}</Typography>
                      <Badge label={chat.badgeText} tone={getBadgeTone(chat.type)} />
                    </View>
                  </View>

                  <ChevronRight size={20} color={colors.textSecondary} />
                </View>

                <Typography variant="body" color="secondary" style={styles.chatDesc}>
                  {chat.getDefaultWelcomeMessage(comarcaName)}
                </Typography>

                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <Typography variant="captionMedium" style={{ color: colors.primary, fontWeight: '700' }}>
                    Abrir conversación en directo
                  </Typography>
                  <ChevronRight size={14} color={colors.primary} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
  },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    gap: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.base,
  },
  intro: {
    gap: 4,
    marginBottom: spacing.xs,
  },
  introTitle: {
    fontSize: 24,
  },
  cardsList: {
    gap: spacing.md,
  },
  chatCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    gap: 4,
    flex: 1,
  },
  chatDesc: {
    lineHeight: 20,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    marginTop: 2,
  },
});
