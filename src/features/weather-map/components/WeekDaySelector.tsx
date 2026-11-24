import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { FONT_DISPLAY_SEMIBOLD } from '@/shared/theme/typography';
import { DayOption } from '../services/bulletinsApi';

interface Props {
  days: DayOption[];
  selectedIndex: number;
  onSelectDay: (index: number) => void;
}

export const WeekDaySelector: React.FC<Props> = ({
  days,
  selectedIndex,
  onSelectDay,
}) => {
  const { isDark, theme, colors } = useThemeStore();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day) => {
          const isSelected = day.index === selectedIndex;
          const inactiveBg = isDark ? colors.card : colors.surface;
          return (
            <TouchableOpacity
              key={day.index}
              activeOpacity={0.78}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.pillActiveBg : inactiveBg,
                  borderColor: isSelected ? 'transparent' : colors.subcardBorder,
                  borderWidth: 1,
                },
                isSelected ? theme.shadows.pillActive : theme.shadows.subcard,
              ]}
              onPress={() => onSelectDay(day.index)}
            >
              <Typography
                variant="bodyMedium"
                style={{
                  fontFamily: FONT_DISPLAY_SEMIBOLD,
                  color: isSelected ? colors.pillActiveText : colors.textPrimary,
                  fontWeight: '600',
                  fontSize: 14,
                }}
              >
                {day.label}
              </Typography>
              <Typography
                variant="caption"
                style={{
                  color: isSelected ? colors.pillActiveText : colors.textSecondary,
                  fontSize: 10.5,
                  opacity: isSelected ? 0.92 : 0.88,
                }}
              >
                {day.dateFormatted}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingVertical: 3,
    paddingRight: 4,
  },
  chip: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 76,
    gap: 2,
  },
});
