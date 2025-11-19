import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { HierarchyRole, UniformItem, Instrument } from '@/types/database';
import { ArrowLeft, Shirt, Music, Disc3, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { getImageSource } from '@/lib/imageUtils';

export default function UniformDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [role, setRole] = useState<HierarchyRole | null>(null);
  const [uniformItems, setUniformItems] = useState<UniformItem[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<UniformItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUniformDetails();
  }, [id]);

  async function loadUniformDetails() {
    try {
      setLoading(true);
      setError(null);

      const { data: roleData, error: roleError } = await supabase
        .from('hierarchy_roles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (roleError) throw roleError;
      if (!roleData) throw new Error('Role not found');

      setRole(roleData);

      const { data: uniformData, error: uniformError } = await supabase
        .from('uniform_items')
        .select('*')
        .eq('role_id', id)
        .order('display_order', { ascending: true });

      if (uniformError) throw uniformError;
      setUniformItems(uniformData || []);

      if (roleData.title_croatian === 'Mesopustar') {
        const { data: instrumentsData, error: instrumentsError } = await supabase
          .from('instruments')
          .select('*')
          .eq('participant_id', roleData.participant_id)
          .order('display_order', { ascending: true });

        if (instrumentsError) throw instrumentsError;
        setInstruments(instrumentsData || []);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load uniform details'
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  const handleItemPress = (item: UniformItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const getUniformPartPosition = (itemName: string) => {
    const positions: Record<string, { top: string; left: string }> = {
      'Rapčinac / Kapa': { top: '14%', left: '50%' },
      'Kokarda / Ukras od male trake trobojnice': { top: '42%', left: '38%' },
      'Mala gora / Mala tustika': { top: '42%', left: '62%' },
      'Bela košulja / Bijela košulja': { top: '38%', left: '50%' },
      'Škura plava jaketa / Tamno plavi sako': { top: '50%', left: '50%' },
      'Kurdela / Mala traka trobojnica': { top: '32%', left: '50%' },
      'Široka trobojnica / Široka traka trobojnica': { top: '48%', left: '28%' },
      'Bele gaće / Bijele hlače': { top: '70%', left: '50%' },
      'Crne postole / Crne cipele': { top: '94%', left: '50%' },
    };
    return positions[itemName] || { top: '50%', left: '50%' };
  };

  if (error || !role) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Uloga nije pronađena'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Natrag</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}>
          <View style={styles.backButtonCircle}>
            <ArrowLeft size={22} color="#000000" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {role.title_croatian}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.roleInfo}>
          <Text style={styles.roleTitleCroatian}>{role.title_croatian}</Text>
          {role.description_croatian && (
            <Text style={styles.roleDescription}>
              {role.description_croatian}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uniforma</Text>
          <Text style={styles.sectionSubtitle}>
            Dodirnite dijelove uniforme za više informacija
          </Text>

          {uniformItems.length === 0 ? (
            <View style={styles.emptyUniform}>
              <Shirt size={48} color="#d1d5db" />
              <Text style={styles.emptyUniformText}>
                Dijelovi uniforme će uskoro biti dodani
              </Text>
            </View>
          ) : (
            <View style={styles.visualUniformContainer}>
              <View style={styles.uniformBackground}>
                <Image
                  source={require('@/assets/images/Mesopustar_uiforma.jpg')}
                  style={styles.uniformPhoto}
                  resizeMode="cover"
                />
                <View style={styles.overlay} />

                {uniformItems.map((item) => {
                  const position = getUniformPartPosition(item.item_name_croatian);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.uniformHotspot,
                        { top: position.top, left: position.left },
                      ]}
                      onPress={() => handleItemPress(item)}
                      activeOpacity={0.7}>
                      <View style={styles.hotspotPulse} />
                      <View style={styles.hotspotDot} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.uniformLegend}>
                <Text style={styles.legendTitle}>Dijelovi uniforme:</Text>
                {uniformItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.legendItem}
                    onPress={() => handleItemPress(item)}>
                    <View style={styles.legendDot} />
                    <Text style={styles.legendText}>
                      {index + 1}. {item.item_name_croatian}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>

              {selectedItem && (
                <View style={styles.modalBody}>
                  <View style={styles.modalIconContainer}>
                    <Shirt size={32} color="#dc2626" />
                  </View>
                  <Text style={styles.modalTitle}>
                    {selectedItem.item_name_croatian}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedItem.item_name}
                  </Text>
                  {selectedItem.description_croatian && (
                    <Text style={styles.modalDescription}>
                      {selectedItem.description_croatian}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </Modal>

        {role.title_croatian === 'Mesopustar' && instruments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instrumenti</Text>
            <Text style={styles.sectionSubtitle}>
              {instruments.length} {instruments.length === 1 ? 'instrument' : 'instrumenata'}
            </Text>

            <View style={styles.instrumentsGrid}>
              {instruments.map((instrument) => (
                <View key={instrument.id} style={styles.instrumentCard}>
                  {instrument.image_url && (
                    <Image
                      source={{ uri: instrument.image_url }}
                      style={styles.instrumentImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.instrumentContent}>
                    <View style={styles.instrumentHeader}>
                      <Disc3 size={18} color="#dc2626" />
                      <Text style={styles.instrumentName}>
                        {instrument.name_croatian}
                      </Text>
                    </View>
                    {instrument.description_croatian && (
                      <Text style={styles.instrumentDescription}>
                        {instrument.description_croatian}
                      </Text>
                    )}
                    {instrument.playing_technique_croatian && (
                      <View style={styles.techniqueBadge}>
                        <Music size={14} color="#dc2626" />
                        <Text style={styles.techniqueBadgeText}>
                          {instrument.playing_technique_croatian}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  headerBackButton: {
    marginRight: 8,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 100,
  },
  roleInfo: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 8,
    borderBottomColor: '#f3f4f6',
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  roleTitleCroatian: {
    fontSize: 20,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 12,
  },
  roleDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  emptyUniform: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  emptyUniformText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
    textAlign: 'center',
  },
  visualUniformContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  uniformBackground: {
    position: 'relative',
    width: '100%',
    height: 600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uniformPhoto: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  uniformHotspot: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  hotspotPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  hotspotDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#dc2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  uniformLegend: {
    padding: 20,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc2626',
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modalBody: {
    alignItems: 'center',
    paddingTop: 20,
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
    textAlign: 'center',
  },
  instrumentsGrid: {
    gap: 16,
  },
  instrumentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instrumentImage: {
    width: '100%',
    height: 200,
  },
  instrumentContent: {
    padding: 16,
  },
  instrumentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instrumentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 8,
    flex: 1,
  },
  instrumentNameEnglish: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  instrumentDescription: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 8,
  },
  techniqueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  techniqueBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 6,
  },
});
