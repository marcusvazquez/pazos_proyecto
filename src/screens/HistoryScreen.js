import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography, spacing, radii } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import CategoryTag from '../components/CategoryTag';
import { useAppStore } from '../store/useAppStore';
import { formatFriendlyDate } from '../utils/date';

const TABS = [
  { id: 'week', label: 'Últimos 7 días' },
  { id: 'favorites', label: 'Favoritos' },
];

export default function HistoryScreen({ navigation }) {
  const theme = useTheme();
  const history = useAppStore((s) => s.history);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const getRecentHistory = useAppStore((s) => s.getRecentHistory);
  const [tab, setTab] = useState('week');

  const data = useMemo(() => {
    if (tab === 'favorites') {
      return history.filter((h) => favorites.includes(h.id));
    }
    return getRecentHistory(7);
  }, [tab, history, favorites]);

  const renderItem = ({ item }) => {
    const isFavorite = favorites.includes(item.id);
    const accent = theme.accents[item.category] || theme.accents.afirmaciones;
    const bg = theme.accentBg[item.category] || theme.accentBg.afirmaciones;
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: bg },
          theme.isNeon && { borderWidth: 1, borderColor: accent, ...theme.glow.forAccent(accent) },
        ]}
      >
        <View style={styles.cardHeader}>
          <CategoryTag category={item.category} size="sm" showCustomIcon={!!item.custom} />
          <Pressable
            onPress={() => toggleFavorite(item.id)}
            hitSlop={10}
            style={[
              styles.heartBtn,
              {
                backgroundColor:
                  theme.isDark || theme.isNeon
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.65)',
              },
            ]}
          >
            <Text style={[styles.heart, { color: isFavorite ? accent : theme.textSoft }]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>
        <Text
          style={[
            styles.message,
            { color: theme.text },
            theme.isNeon && theme.glow.textGlow,
          ]}
        >
          {item.text}
        </Text>
        <Text style={[styles.date, { color: theme.textMuted }]}>
          {formatFriendlyDate(item.date)}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={theme.statusBar} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: theme.card }]}
            hitSlop={10}
          >
            <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>Tu historial</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Guarda los mensajes que te hacen bien
            </Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: active ? theme.text : theme.card,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: active ? theme.bg : theme.text },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={data}
          keyExtractor={(item, idx) => `${item.id}-${item.date}-${idx}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>
                {tab === 'favorites' ? '💜' : '🌸'}
              </Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {tab === 'favorites'
                  ? 'Aún no tienes favoritos'
                  : 'Tu historial está vacío'}
              </Text>
              <Text style={[styles.emptyBody, { color: theme.textMuted }]}>
                {tab === 'favorites'
                  ? 'Guarda con el corazón los mensajes que quieras recordar.'
                  : 'Cuando recibas tus primeros mensajes, aparecerán aquí.'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
  },
  title: {
    fontFamily: typography.extraBold,
    fontSize: typography.sizes.xxl,
  },
  subtitle: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
  },
  tabText: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.sm,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  card: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heartBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    fontSize: 18,
  },
  message: {
    fontFamily: typography.semiBold,
    fontSize: typography.sizes.md,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  date: {
    fontFamily: typography.medium,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 1.5,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.lg,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
