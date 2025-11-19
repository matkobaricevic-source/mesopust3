import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { HierarchyRole, UniformItem, Instrument } from '@/types/database';
import { ArrowLeft, Shirt, Music, Disc3, ChevronRight } from 'lucide-react-native';
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

          {uniformItems.length === 0 ? (
            <View style={styles.emptyUniform}>
              <Shirt size={48} color="#d1d5db" />
              <Text style={styles.emptyUniformText}>
                Dijelovi uniforme će uskoro biti dodani
              </Text>
            </View>
          ) : (
            <View>
              <Image
                source={require('@/assets/images/Mesopustar_uiforma.jpg')}
                style={styles.uniformPhoto}
                resizeMode="contain"
              />

              <View style={styles.uniformList}>
                {uniformItems.map((item, index) => (
                  <View key={item.id} style={styles.uniformItem}>
                    <View style={styles.uniformItemHeader}>
                      <View style={styles.uniformItemNumber}>
                        <Text style={styles.uniformItemNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.uniformItemTitle}>
                        {item.item_name_croatian}
                      </Text>
                    </View>
                    {item.item_name && (
                      <Text style={styles.uniformItemSubtitle}>
                        {item.item_name}
                      </Text>
                    )}
                    {item.description_croatian && (
                      <Text style={styles.uniformItemDescription}>
                        {item.description_croatian}
                      </Text>
                    )}
                    {item.additional_info_url && (
                      <TouchableOpacity
                        style={styles.moreInfoButton}
                        onPress={() => router.push(item.additional_info_url as any)}>
                        <Text style={styles.moreInfoButtonText}>Saznaj više</Text>
                        <ChevronRight size={18} color="#dc2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

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
  uniformPhoto: {
    width: '100%',
    height: 500,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
  },
  uniformList: {
    gap: 16,
  },
  uniformItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uniformItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  uniformItemNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uniformItemNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  uniformItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  uniformItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 8,
    marginLeft: 44,
  },
  uniformItemDescription: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginLeft: 44,
    marginBottom: 12,
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    marginLeft: 44,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  moreInfoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginRight: 4,
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
