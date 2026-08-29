import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useCrop } from '@/context/CropContext';
import { CropType } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Wheat, Bug, BarChart3, ChevronRight, Leaf, Coffee } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const CROPS: { type: CropType; label: string; emoji: string; gradient: [string, string]; accent: string }[] = [
  {
    type: 'cafe',
    label: 'Café',
    emoji: '☕',
    gradient: ['#5C3D1E', '#8B5E3C'],
    accent: '#5C3D1E',
  },
  {
    type: 'aguacate_hass',
    label: 'Aguacate Hass',
    emoji: '🥑',
    gradient: ['#1B5E20', '#388E3C'],
    accent: '#2D6A2D',
  },
];

const QUICK_ACTIONS = [
  { label: 'Registrar Cosecha', icon: Wheat, route: '/harvest' as const },
  { label: 'Reportar Plaga', icon: Bug, route: '/pests' as const },
  { label: 'Ver Reportes', icon: BarChart3, route: '/reports' as const },
];

export default function HomeScreen() {
  const { selectedCrop, setSelectedCrop } = useCrop();
  const router = useRouter();
  const currentCrop = CROPS.find((c) => c.type === selectedCrop)!;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient
        colors={currentCrop.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.appTitle}>AgroScan</Text>
        <Text style={styles.appSubtitle}>Sistema de campo inteligente</Text>
        <View style={styles.cropBadge}>
          <Text style={styles.cropBadgeText}>{currentCrop.emoji} {currentCrop.label} seleccionado</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Seleccionar cultivo</Text>

        <View style={styles.cropRow}>
          {CROPS.map((crop) => {
            const isSelected = selectedCrop === crop.type;
            return (
              <TouchableOpacity
                key={crop.type}
                style={[styles.cropCard, isSelected && { borderColor: crop.accent, borderWidth: 2.5 }]}
                onPress={() => setSelectedCrop(crop.type)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isSelected ? crop.gradient : ['#F9FAFB', '#F3F4F6']}
                  style={styles.cropCardInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.cropEmoji}>{crop.emoji}</Text>
                  <Text style={[styles.cropLabel, isSelected && styles.cropLabelSelected]}>
                    {crop.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedDot} />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Acciones rápidas</Text>

        <View style={styles.actionsContainer}>
          {QUICK_ACTIONS.map(({ label, icon: Icon, route }) => (
            <TouchableOpacity
              key={route}
              style={styles.actionCard}
              onPress={() => router.push(route)}
              activeOpacity={0.85}
            >
              <View style={[styles.actionIcon, { backgroundColor: currentCrop.gradient[0] + '18' }]}>
                <Icon size={22} color={currentCrop.accent} strokeWidth={2} />
              </View>
              <Text style={styles.actionLabel}>{label}</Text>
              <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Leaf size={20} color={currentCrop.accent} strokeWidth={2} />
          <Text style={styles.infoText}>
            Registra tu cosecha y plagas. Los datos se guardan y sincronizan automáticamente.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  appTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    marginBottom: 16,
  },
  cropBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  cropBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  scroll: { flex: 1 },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#374151',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  cropRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  cropCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cropCardInner: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  cropEmoji: { fontSize: 36 },
  cropLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  cropLabelSelected: { color: '#FFFFFF' },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#374151',
    flex: 1,
    lineHeight: 19,
  },
});
