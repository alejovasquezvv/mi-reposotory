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
  Image,
} from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useCrop } from '@/context/CropContext';
import { supabase } from '@/lib/supabase';
import { Severity } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bug, Camera, MapPin, CheckCircle, AlertCircle, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CROP_META = {
  cafe: { label: 'Café', gradient: ['#5C3D1E', '#8B5E3C'] as [string, string], accent: '#5C3D1E' },
  aguacate_hass: { label: 'Aguacate Hass', gradient: ['#1B5E20', '#388E3C'] as [string, string], accent: '#2D6A2D' },
};

const SEVERITY_OPTIONS: { value: Severity; label: string; color: string; bg: string }[] = [
  { value: 'baja', label: 'Baja', color: '#16A34A', bg: '#F0FDF4' },
  { value: 'media', label: 'Media', color: '#D97706', bg: '#FFFBEB' },
  { value: 'alta', label: 'Alta', color: '#DC2626', bg: '#FEF2F2' },
];

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function PestsScreen() {
  const { selectedCrop } = useCrop();
  const meta = CROP_META[selectedCrop];

  const [lotName, setLotName] = useState('');
  const [pestName, setPestName] = useState('');
  const [severity, setSeverity] = useState<Severity>('baja');
  const [description, setDescription] = useState('');
  const [reportDate, setReportDate] = useState(today());
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Se necesita permiso para acceder a las fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Se necesita permiso para usar la cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function getLocation() {
    setLoadingGps(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Se necesita permiso de ubicación.');
        setLoadingGps(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {
      setError('No se pudo obtener la ubicación.');
    }
    setLoadingGps(false);
  }

  async function handleSubmit() {
    if (!lotName.trim()) { setError('Ingresa el nombre del lote.'); return; }
    if (!pestName.trim()) { setError('Ingresa el nombre de la plaga.'); return; }
    if (!description.trim()) { setError('Escribe una descripción.'); return; }

    setLoading(true);
    setError(null);

    const { error: dbError } = await supabase.from('pest_reports').insert({
      crop_type: selectedCrop,
      lot_name: lotName.trim(),
      pest_name: pestName.trim(),
      severity,
      description: description.trim(),
      photo_url: photoUri ?? null,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      report_date: reportDate,
    });

    setLoading(false);

    if (dbError) {
      setError('No se pudo guardar el reporte. Intenta de nuevo.');
      return;
    }

    setSuccess(true);
    setLotName('');
    setPestName('');
    setSeverity('baja');
    setDescription('');
    setReportDate(today());
    setPhotoUri(null);
    setCoords(null);

    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={meta.gradient} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerIcon}>
          <Bug size={24} color="#FFFFFF" strokeWidth={2} />
        </View>
        <Text style={styles.headerTitle}>Reporte de Plagas</Text>
        <Text style={styles.headerSubtitle}>{meta.label}</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {success && (
            <View style={styles.successBanner}>
              <CheckCircle size={18} color="#16A34A" strokeWidth={2} />
              <Text style={styles.successText}>Reporte guardado correctamente</Text>
            </View>
          )}
          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color="#DC2626" strokeWidth={2} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Información del reporte</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Lote *</Text>
              <TextInput
                style={[styles.input, { borderColor: meta.accent }]}
                placeholder="Ej: Lote B-3"
                placeholderTextColor="#9CA3AF"
                value={lotName}
                onChangeText={setLotName}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre de la plaga / enfermedad *</Text>
              <TextInput
                style={[styles.input, { borderColor: meta.accent }]}
                placeholder="Ej: Roya del café, Trips..."
                placeholderTextColor="#9CA3AF"
                value={pestName}
                onChangeText={setPestName}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Severidad *</Text>
              <View style={styles.severityRow}>
                {SEVERITY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.severityBtn,
                      { backgroundColor: severity === opt.value ? opt.color : opt.bg },
                      severity === opt.value && { borderColor: opt.color },
                    ]}
                    onPress={() => setSeverity(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.severityText,
                      { color: severity === opt.value ? '#FFFFFF' : opt.color }
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textarea, { borderColor: meta.accent }]}
                placeholder="Describe los síntomas, área afectada, plantas afectadas..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Fecha del reporte</Text>
              <TextInput
                style={[styles.input, { borderColor: meta.accent }]}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={reportDate}
                onChangeText={setReportDate}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Foto de la plaga</Text>

            {photoUri ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
                <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotoUri(null)}>
                  <X size={16} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoButtons}>
                <TouchableOpacity style={[styles.photoBtn, { borderColor: meta.accent }]} onPress={takePhoto} activeOpacity={0.8}>
                  <Camera size={20} color={meta.accent} strokeWidth={2} />
                  <Text style={[styles.photoBtnText, { color: meta.accent }]}>Cámara</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.photoBtn, { borderColor: meta.accent }]} onPress={pickPhoto} activeOpacity={0.8}>
                  <Camera size={20} color={meta.accent} strokeWidth={2} />
                  <Text style={[styles.photoBtnText, { color: meta.accent }]}>Galería</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ubicación GPS</Text>

            {coords ? (
              <View style={styles.coordsBox}>
                <MapPin size={18} color={meta.accent} strokeWidth={2} />
                <View>
                  <Text style={styles.coordsText}>Lat: {coords.lat.toFixed(6)}</Text>
                  <Text style={styles.coordsText}>Lng: {coords.lng.toFixed(6)}</Text>
                </View>
                <TouchableOpacity onPress={() => setCoords(null)} style={styles.clearCoords}>
                  <X size={16} color="#6B7280" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.gpsBtn, { borderColor: meta.accent }]}
                onPress={getLocation}
                disabled={loadingGps}
                activeOpacity={0.8}
              >
                {loadingGps ? (
                  <ActivityIndicator color={meta.accent} size="small" />
                ) : (
                  <>
                    <MapPin size={18} color={meta.accent} strokeWidth={2} />
                    <Text style={[styles.gpsBtnText, { color: meta.accent }]}>Capturar ubicación GPS</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
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
              <Text style={styles.submitText}>Guardar reporte</Text>
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
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28, gap: 4 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 24, color: '#FFFFFF' },
  headerSubtitle: { fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  scroll: { flex: 1 },
  successBanner: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: '#F0FDF4',
    borderRadius: 12, padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#86EFAC',
  },
  successText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#16A34A' },
  errorBanner: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: '#FEF2F2',
    borderRadius: 12, padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#DC2626', flex: 1 },
  card: {
    margin: 16, marginBottom: 0, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: '#1F2937', marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontFamily: 'Inter-Regular', fontSize: 15, color: '#1F2937', backgroundColor: '#FAFAFA',
  },
  textarea: { height: 100, paddingTop: 12 },
  severityRow: { flexDirection: 'row', gap: 10 },
  severityBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  severityText: { fontFamily: 'Inter-SemiBold', fontSize: 13 },
  photoButtons: { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  photoBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 14 },
  photoPreviewContainer: { position: 'relative' },
  photoPreview: { width: '100%', height: 180, borderRadius: 12 },
  removePhoto: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 6,
  },
  coordsBox: {
    backgroundColor: '#F9FAFB', borderRadius: 10, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  coordsText: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#374151' },
  clearCoords: { marginLeft: 'auto' },
  gpsBtn: {
    borderWidth: 1.5, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  gpsBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 14 },
  submitBtn: {
    margin: 16, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6,
  },
  submitDisabled: { opacity: 0.65 },
  submitText: { fontFamily: 'Inter-Bold', fontSize: 16, color: '#FFFFFF', letterSpacing: 0.2 },
});
