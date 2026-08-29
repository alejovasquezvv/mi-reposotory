import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCrop } from '@/context/CropContext';
import { supabase, Harvest, PestReport } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, Wheat, Bug, MapPin, Calendar, Package } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CROP_META = {
  cafe: { label: 'Café', gradient: ['#5C3D1E', '#8B5E3C'] as [string, string], accent: '#5C3D1E' },
  aguacate_hass: { label: 'Aguacate Hass', gradient: ['#1B5E20', '#388E3C'] as [string, string], accent: '#2D6A2D' },
};

const SEVERITY_COLORS: Record<string, { color: string; bg: string }> = {
  baja: { color: '#16A34A', bg: '#F0FDF4' },
  media: { color: '#D97706', bg: '#FFFBEB' },
  alta: { color: '#DC2626', bg: '#FEF2F2' },
};

type Tab = 'harvests' | 'pests';

export default function ReportsScreen() {
  const { selectedCrop } = useCrop();
  const meta = CROP_META[selectedCrop];

  const [activeTab, setActiveTab] = useState<Tab>('harvests');
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [pests, setPests] = useState<PestReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchData() {
    const [hRes, pRes] = await Promise.all([
      supabase
        .from('harvests')
        .select('*')
        .eq('crop_type', selectedCrop)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('pest_reports')
        .select('*')
        .eq('crop_type', selectedCrop)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);
    if (hRes.data) setHarvests(hRes.data);
    if (pRes.data) setPests(pRes.data);
    setLoading(false);
    setRefreshing(false);
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [selectedCrop])
  );

  function onRefresh() {
    setRefreshing(true);
    fetchData();
  }

  const totalKilos = harvests.reduce((acc, h) => acc + h.kilos, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={meta.gradient} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerIcon}>
          <BarChart3 size={24} color="#FFFFFF" strokeWidth={2} />
        </View>
        <Text style={styles.headerTitle}>Reportes</Text>
        <Text style={styles.headerSubtitle}>{meta.label}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{harvests.length}</Text>
            <Text style={styles.statLabel}>Cosechas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalKilos.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Kg totales</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{pests.length}</Text>
            <Text style={styles.statLabel}>Reportes plaga</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'harvests' && { borderBottomColor: meta.accent, borderBottomWidth: 2.5 }]}
          onPress={() => setActiveTab('harvests')}
        >
          <Wheat size={16} color={activeTab === 'harvests' ? meta.accent : '#9CA3AF'} strokeWidth={2} />
          <Text style={[styles.tabText, activeTab === 'harvests' && { color: meta.accent }]}>Cosechas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'pests' && { borderBottomColor: meta.accent, borderBottomWidth: 2.5 }]}
          onPress={() => setActiveTab('pests')}
        >
          <Bug size={16} color={activeTab === 'pests' ? meta.accent : '#9CA3AF'} strokeWidth={2} />
          <Text style={[styles.tabText, activeTab === 'pests' && { color: meta.accent }]}>Plagas</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={meta.accent} size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={meta.accent} />}
        >
          {activeTab === 'harvests' && (
            harvests.length === 0 ? (
              <EmptyState message="No hay registros de cosecha aún." icon={<Wheat size={40} color="#D1D5DB" strokeWidth={1.5} />} />
            ) : (
              harvests.map((h) => (
                <View key={h.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={[styles.recordIcon, { backgroundColor: meta.accent + '18' }]}>
                      <Package size={18} color={meta.accent} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recordTitle}>{h.lot_name}</Text>
                      <View style={styles.recordMeta}>
                        <Calendar size={12} color="#9CA3AF" strokeWidth={2} />
                        <Text style={styles.recordMetaText}>{h.harvest_date}</Text>
                      </View>
                    </View>
                    <View style={[styles.kilosBadge, { backgroundColor: meta.accent }]}>
                      <Text style={styles.kilosText}>{h.kilos} kg</Text>
                    </View>
                  </View>
                  {h.notes ? <Text style={styles.recordNotes}>{h.notes}</Text> : null}
                </View>
              ))
            )
          )}

          {activeTab === 'pests' && (
            pests.length === 0 ? (
              <EmptyState message="No hay reportes de plaga aún." icon={<Bug size={40} color="#D1D5DB" strokeWidth={1.5} />} />
            ) : (
              pests.map((p) => {
                const sev = SEVERITY_COLORS[p.severity] ?? SEVERITY_COLORS.baja;
                return (
                  <View key={p.id} style={styles.recordCard}>
                    <View style={styles.recordHeader}>
                      <View style={[styles.recordIcon, { backgroundColor: sev.bg }]}>
                        <Bug size={18} color={sev.color} strokeWidth={2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recordTitle}>{p.pest_name}</Text>
                        <Text style={styles.recordSubtitle}>{p.lot_name}</Text>
                        <View style={styles.recordMeta}>
                          <Calendar size={12} color="#9CA3AF" strokeWidth={2} />
                          <Text style={styles.recordMetaText}>{p.report_date}</Text>
                        </View>
                      </View>
                      <View style={[styles.severityBadge, { backgroundColor: sev.bg }]}>
                        <Text style={[styles.severityText, { color: sev.color }]}>
                          {p.severity.charAt(0).toUpperCase() + p.severity.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.recordNotes}>{p.description}</Text>
                    {(p.latitude != null && p.longitude != null) && (
                      <View style={styles.coordRow}>
                        <MapPin size={12} color="#9CA3AF" strokeWidth={2} />
                        <Text style={styles.coordText}>
                          {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function EmptyState({ message, icon }: { message: string; icon: React.ReactNode }) {
  return (
    <View style={emptyStyles.container}>
      {icon}
      <Text style={emptyStyles.text}>{message}</Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 64, gap: 12 },
  text: { fontFamily: 'Inter-Regular', fontSize: 15, color: '#9CA3AF' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, gap: 4 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 24, color: '#FFFFFF' },
  headerSubtitle: { fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 16 },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: 16,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: 'Inter-Bold', fontSize: 22, color: '#FFFFFF' },
  statLabel: { fontFamily: 'Inter-Regular', fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 8 },
  tabsRow: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  tabBtn: {
    flex: 1, paddingVertical: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6,
    borderBottomWidth: 2.5, borderBottomColor: 'transparent',
  },
  tabText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#9CA3AF' },
  scroll: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  recordCard: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  recordHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  recordIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recordTitle: { fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#1F2937' },
  recordSubtitle: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#6B7280', marginTop: 1 },
  recordMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  recordMetaText: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#9CA3AF' },
  recordNotes: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#6B7280', marginTop: 10, lineHeight: 19 },
  kilosBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  kilosText: { fontFamily: 'Inter-Bold', fontSize: 13, color: '#FFFFFF' },
  severityBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  severityText: { fontFamily: 'Inter-SemiBold', fontSize: 12 },
  coordRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  coordText: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#9CA3AF' },
});
