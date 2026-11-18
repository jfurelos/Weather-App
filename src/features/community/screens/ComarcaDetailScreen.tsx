import React from 'react';
import {
  View,
  StyleSheet,
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
} from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/ScreenBackground';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { getGlassStyle } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import { COMARCA_CHAT_ROOMS, ChatType } from '../data/chatTypes';
import { useComarcasForumStore } from '../store/useComarcasForumStore';
import { RootStackParamList } from '@/app/navigation/types';

type ComarcaDetailRouteProp = RouteProp<RootStackParamList, 'ComarcaDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ComarcaDetailScreen: React.FC = () => {
  const { theme, colors } = useThemeStore();
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
    <ScreenBackground>
      {/* Header superior */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.border,
            borderBottomWidth: theme.metrics.windowBorderWidth,
          },
          getGlassStyle(theme),
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.roundBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.subcardBorder,
              borderWidth: theme.metrics.subcardBorderWidth,
            },
          ]}
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
              backgroundColor: favorite ? colors.gold : colors.card,
              borderColor: favorite ? colors.border : colors.subcardBorder,
              borderWidth: theme.metrics.subcardBorderWidth,
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
            color={favorite ? '#28323E' : colors.textSecondary}
            fill={favorite ? '#28323E' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {favoriteLimitMessage && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={clearFavoriteLimitMessage}
            style={{
              backgroundColor: colors.gold,
              borderColor: colors.border,
              borderWidth: theme.metrics.subcardBorderWidth,
              borderRadius: spacing.borderRadiusMd,
              padding: spacing.md,
            }}
          >
            <Typography variant="captionMedium" style={{ color: '#28323E', fontWeight: '700' }}>
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
                    <View
                      style={[
                        styles.iconBox,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.subcardBorder,
                          borderWidth: theme.metrics.subcardBorderWidth,
                        },
                      ]}
                    >
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
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
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
});
