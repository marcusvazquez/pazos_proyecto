import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { typography, radii, spacing } from '../theme/typography';
import { formatTime } from '../utils/date';

const SLOT_EMOJI = {
  morning: '🌅',
  afternoon: '☀️',
  night: '🌙',
};

export default function NotificationItem({ slot, onChange }) {
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

  return (
    <View style={[styles.card, !slot.enabled && styles.cardDisabled]}>
      <View style={styles.row}>
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{SLOT_EMOJI[slot.id] || '✨'}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>{slot.label}</Text>
          <Pressable onPress={() => setShowPicker(true)}>
            <Text style={[styles.time, !slot.enabled && styles.timeDisabled]}>
              {formatTime(slot.hour, slot.minute)}
            </Text>
          </Pressable>
        </View>

        <Switch
          value={slot.enabled}
          onValueChange={(v) => onChange({ enabled: v })}
          trackColor={{ false: colors.border, true: colors.pink }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.border}
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
                textColor={colors.darkText}
              />
              <Pressable
                style={styles.doneBtn}
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
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.pinkSoft,
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
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  time: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.xl,
    color: colors.darkText,
    marginTop: 2,
  },
  timeDisabled: {
    color: colors.mutedLight,
  },
  pickerIOS: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  doneBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
  },
  doneText: {
    fontFamily: typography.bold,
    color: colors.darkText,
    fontSize: typography.sizes.md,
  },
});
