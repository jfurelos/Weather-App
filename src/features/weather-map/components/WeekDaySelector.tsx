import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
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
  const { colors } = useThemeStore();

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
              activeOpacity={0.7}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onSelectDay(day.index)}
            >
              <Typography
                variant="bodyMedium"
                style={{
                  color: isSelected ? '#FFFFFF' : colors.textPrimary,
                  fontWeight: isSelected ? '700' : '500',
                }}
              >
                {day.label}
              </Typography>
              <Typography
                variant="caption"
                style={{
                  color: isSelected ? '#FFFFFF' : colors.textSecondary,
                  fontSize: 10,
                  opacity: isSelected ? 0.9 : 0.8,
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
    marginVertical: spacing.xs,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    gap: 2,
  },
});
