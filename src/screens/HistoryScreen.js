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
import { colors, categoryBackgrounds } from '../theme/colors';
import { typography, spacing, radii } from '../theme/typography';
import CategoryTag from '../components/CategoryTag';
import { useAppStore } from '../store/useAppStore';
import { formatFriendlyDate } from '../utils/date';

const TABS = [
  { id: 'week', label: 'Últimos 7 días' },
  { id: 'favorites', label: 'Favoritos' },
];

export default function HistoryScreen({ navigation }) {
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
    const bg = categoryBackgrounds[item.category] || colors.pinkSoft;
    return (
      <View style={[styles.card, { backgroundColor: bg }]}>
        <View style={styles.cardHeader}>
          <CategoryTag category={item.category} size="sm" />
          <Pressable
            onPress={() => toggleFavorite(item.id)}
            hitSlop={10}
            style={styles.heartBtn}
          >
            <Text style={[styles.heart, isFavorite && styles.heartActive]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.message}>{item.text}</Text>
        <Text style={styles.date}>{formatFriendlyDate(item.date)}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.warmWhite }}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={10}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Tu historial</Text>
            <Text style={styles.subtitle}>
              Guarda los mensajes que te hacen bien
            </Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              style={[styles.tab, tab === t.id && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
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
              <Text style={styles.emptyTitle}>
                {tab === 'favorites'
                  ? 'Aún no tienes favoritos'
                  : 'Tu historial está vacío'}
              </Text>
              <Text style={styles.emptyBody}>
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
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: colors.darkText,
  },
  title: {
    fontFamily: typography.extraBold,
    fontSize: typography.sizes.xxl,
    color: colors.darkText,
  },
  subtitle: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.sm,
    color: colors.muted,
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
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.darkText,
  },
  tabText: {
    fontFamily: typography.bold,
    fontSize: typography.sizes.sm,
    color: colors.darkText,
  },
  tabTextActive: {
    color: colors.warmWhite,
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
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    fontSize: 18,
    color: colors.mutedLight,
  },
  heartActive: {
    color: '#E11D74',
  },
  message: {
    fontFamily: typography.semiBold,
    fontSize: typography.sizes.md,
    color: colors.darkText,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  date: {
    fontFamily: typography.medium,
    fontSize: typography.sizes.xs,
    color: colors.muted,
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
    color: colors.darkText,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontFamily: typography.regular,
    fontSize: typography.sizes.sm,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
