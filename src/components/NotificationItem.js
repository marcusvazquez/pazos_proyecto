import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { typography, radii, spacing } from '../theme/typography';
import { formatTime } from '../utils/date';
import { iconForHour, labelForHour } from '../utils/schedule';
import { useTheme } from '../theme/ThemeContext';

export default function NotificationItem({ slot, onChange, onDelete }) {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) return;
    onChange({
      hour: selectedDate.getHours(),
      minute: selectedDate.getMinutes(),
    });
  };

  const date = new Date();
  date.setHours(slot.hour);
  date.setMinutes(slot.minute);

  const icon = slot.icon || iconForHour(slot.hour);
  const label = slot.label || labelForHour(slot.hour);
  const accent = theme.accents.afirmaciones;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          shadowColor: theme.isNeon ? accent : '#000',
          shadowOpacity: theme.isNeon ? 0.3 : 0.05,
        },
        !slot.enabled && styles.cardDisabled,
        theme.isNeon && { borderWidth: 1, borderColor: accent },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.emojiWrap, { backgroundColor: theme.accentBg.afirmaciones }]}>
          <Text style={styles.emoji}>{icon}</Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
          <Pressable onPress={() => setShowPicker(true)}>
            <Text
              style={[
                styles.time,
                { color: theme.text },
                !slot.enabled && { color: theme.textSoft },
              ]}
            >
              {formatTime(slot.hour, slot.minute)}
            </Text>
          </Pressable>
        </View>

        {onDelete && (
          <Pressable
            onPress={onDelete}
            hitSlop={12}
            style={[styles.deleteBtn, { backgroundColor: theme.accentBg.afirmaciones }]}
          >
            <Text style={[styles.deleteIcon, { color: theme.text }]}>🗑️</Text>
          </Pressable>
        )}

        <Switch
          value={slot.enabled}
          onValueChange={(v) => onChange({ enabled: v })}
          trackColor={{ false: theme.border, true: theme.accents.afirmaciones }}
          thumbColor={theme.isDark || theme.isNeon ? theme.text : '#FFFFFF'}
          ios_backgroundColor={theme.border}
        />
      </View>

      {showPicker && (
        <>
          {Platform.OS === 'ios' ? (
            <View style={styles.pickerIOS}>
              <DateTimePicker
                value={date}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
                textColor={theme.text}
              />
              <Pressable
                style={[styles.doneBtn, { backgroundColor: theme.accents.afirmaciones }]}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.doneText}>Listo</Text>
              </Pressable>
            </View>
          ) : (
            <DateTimePicker
              value={date}
              mode="time"
              is24Hour
              display="default"
              onChange={onTimeChange}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  label: {
    fontFamily: typography.medium,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  time: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.xl,
    marginTop: 2,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 16,
  },
  pickerIOS: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  doneBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  doneText: {
    fontFamily: typography.bold,
    color: '#1E1B2E',
    fontSize: typography.sizes.md,
  },
});
