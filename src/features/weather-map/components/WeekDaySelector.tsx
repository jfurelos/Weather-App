import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { DISPLAY_FONT } from '@/shared/theme/typography';
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
  const { themeId, theme, colors } = useThemeStore();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day) => {
          const isSelected = day.index === selectedIndex;
          return (
            <TouchableOpacity
              key={day.index}
              activeOpacity={0.78}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.pillActiveBg : colors.pillBg,
                  borderColor:
                    themeId === 'ilustrada'
                      ? '#28323E'
                      : isSelected
                        ? colors.border
                        : colors.subcardBorder,
                  borderWidth: themeId === 'ilustrada' ? 1.5 : 1,
                },
                isSelected && theme.shadows.pillActive,
              ]}
              onPress={() => onSelectDay(day.index)}
            >
              <Typography
                variant="bodyMedium"
                style={{
                  fontFamily: DISPLAY_FONT,
                  color: isSelected ? colors.pillActiveText : colors.textPrimary,
                  fontWeight: isSelected ? '700' : '600',
                  fontSize: 13.5,
                }}
              >
                {day.label}
              </Typography>
              <Typography
                variant="caption"
                style={{
                  color: isSelected ? colors.pillActiveText : colors.textSecondary,
                  fontSize: 10.5,
                  opacity: isSelected ? 0.9 : 0.85,
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
    borderRadius: spacing.borderRadiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 74,
    gap: 1,
  },
});
