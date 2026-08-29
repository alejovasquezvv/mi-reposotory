import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { useCrop } from '@/context/CropContext';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wheat, CheckCircle, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CROP_META = {
  cafe: { label: 'Café', gradient: ['#5C3D1E', '#8B5E3C'] as [string, string], accent: '#5C3D1E' },
  aguacate_hass: { label: 'Aguacate Hass', gradient: ['#1B5E20', '#388E3C'] as [string, string], accent: '#2D6A2D' },
};

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function HarvestScreen() {
  const { selectedCrop } = useCrop();
  const meta = CROP_META[selectedCrop];

  const [lotName, setLotName] = useState('');
  const [kilos, setKilos] = useState('');
  const [harvestDate, setHarvestDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!lotName.trim()) { setError('Ingresa el nombre del lote.'); return; }
    if (!kilos || isNaN(Number(kilos)) || Number(kilos) <= 0) { setError('Ingresa un valor válido de kilos.'); return; }
    if (!harvestDate) { setError('Ingresa la fecha de cosecha.'); return; }

    setLoading(true);
    setError(null);

    const { error: dbError } = await supabase.from('harvests').insert({
      crop_type: selectedCrop,
      lot_name: lotName.trim(),
      kilos: Number(kilos),
      harvest_date: harvestDate,
      notes: notes.trim() || null,
    });

    setLoading(false);

    if (dbError) {
      setError('No se pudo guardar el registro. Intenta de nuevo.');
      return;
    }

    setSuccess(true);
    setLotName('');
    setKilos('');
    setHarvestDate(today());
    setNotes('');

    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={meta.gradient} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerIcon}>
          <Wheat size={24} color="#FFFFFF" strokeWidth={2} />
        </View>
        <Text style={styles.headerTitle}>Registro de Cosecha</Text>
        <Text style={styles.headerSubtitle}>{meta.label}</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {success && (
            <View style={styles.successBanner}>
              <CheckCircle size={18} color="#16A34A" strokeWidth={2} />
              <Text style={styles.successText}>Cosecha registrada correctamente</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color="#DC2626" strokeWidth={2} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Datos del lote</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre / Número de lote *</Text>
              <TextInput
                style={[styles.input, { borderColor: meta.accent }]}
                placeholder="Ej: Lote A-12"
                placeholderTextColor="#9CA3AF"
                value={lotName}
                onChangeText={setLotName}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Kilos cosechados *</Text>
              <TextInput
                style={[styles.input, { borderColor: meta.accent }]}
                placeholder="Ej: 250"
                placeholderTextColor="#9CA3AF"
                value={kilos}
                onChangeText={setKilos}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Fecha de cosecha *</Text>
              <TextInput
                style={[styles.input, { borderColor: meta.accent }]}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={harvestDate}
                onChangeText={setHarvestDate}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Observaciones</Text>
              <TextInput
                style={[styles.input, styles.textarea, { borderColor: meta.accent }]}
                placeholder="Notas adicionales sobre la cosecha..."
                placeholderTextColor="#9CA3AF"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: meta.accent }, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitText}>Guardar registro</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    flexDirection: 'column',
    gap: 4,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 24, color: '#FFFFFF' },
  headerSubtitle: { fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  scroll: { flex: 1 },
  successBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  successText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#16A34A' },
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#DC2626', flex: 1 },
  card: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: '#1F2937', marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#FAFAFA',
  },
  textarea: { height: 100, paddingTop: 12 },
  submitBtn: {
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  submitDisabled: { opacity: 0.65 },
  submitText: { fontFamily: 'Inter-Bold', fontSize: 16, color: '#FFFFFF', letterSpacing: 0.2 },
});
