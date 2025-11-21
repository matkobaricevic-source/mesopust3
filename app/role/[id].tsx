import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Shirt, ChevronDown, ChevronUp } from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';

interface HierarchyRole {
  id: string;
  participant_id: string;
  title: string;
  title_croatian: string;
  description: string;
  description_croatian: string;
  display_order: number;
  participants?: {
    image_url: string | null;
  };
}

interface UniformItem {
  id: string;
  role_id: string;
  item_name: string;
  item_name_croatian: string;
  description: string;
  description_croatian: string;
  image_url: string | null;
  display_order: number;
  additional_info_url: string | null;
}

export default function RoleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [role, setRole] = useState<HierarchyRole | null>(null);
  const [uniformItems, setUniformItems] = useState<UniformItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [expandedUniformItems, setExpandedUniformItems] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    loadRoleDetails();
  }, [id]);

  async function loadRoleDetails() {
    try {
      setLoading(true);
      setError(null);

      const { data: roleData, error: roleError } = await supabase
        .from('hierarchy_roles')
        .select('*, participants!hierarchy_roles_participant_id_fkey(image_url)')
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load role');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  if (error || !role) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Role not found'}</Text>
        <ModernButton onPress={() => router.back()}>Natrag</ModernButton>
      </View>
    );
  }

  const description = role.description_croatian || role.description;
  const shouldTruncate = description && description.length > 200;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {role.participants?.image_url && getImageSource(role.participants.image_url) ? (
            <Image
              source={getImageSource(role.participants.image_url)!}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={theme.colors.accent.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.heroImage, styles.heroImagePlaceholder]}
            >
              <Shirt size={80} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
            </LinearGradient>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.heroGradient}
          />

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <BlurView intensity={20} tint="dark" style={styles.backButtonBlur}>
              <ArrowLeft size={24} color={theme.colors.text.inverse} strokeWidth={2} />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <Animated.Text entering={FadeIn.delay(100)} style={styles.heroTitle}>
              {role.title_croatian || role.title}
            </Animated.Text>
          </View>
        </View>

        <View style={styles.content}>
          {description && (
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <ModernCard style={styles.descriptionCard}>
                <Text
                  style={styles.description}
                  numberOfLines={!isDescriptionExpanded && shouldTruncate ? 6 : undefined}
                >
                  {description}
                </Text>
                {shouldTruncate && (
                  <TouchableOpacity
                    style={styles.readMoreButton}
                    onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  >
                    <Text style={styles.readMoreText}>
                      {isDescriptionExpanded ? 'Prikaži manje' : 'Prikaži više'}
                    </Text>
                  </TouchableOpacity>
                )}
              </ModernCard>
            </Animated.View>
          )}

          {uniformItems.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <View style={styles.sectionHeader}>
                <Shirt size={24} color={theme.colors.primary.main} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Dijelovi odore ({uniformItems.length})</Text>
              </View>
              {uniformItems.map((item, index) => {
                const isExpanded = expandedUniformItems.has(item.id);
                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.delay(300 + index * 50).springify()}
                    style={styles.cardWrapper}
                  >
                    <ModernCard>
                      <TouchableOpacity
                        onPress={() => {
                          const newSet = new Set(expandedUniformItems);
                          if (isExpanded) {
                            newSet.delete(item.id);
                          } else {
                            newSet.add(item.id);
                          }
                          setExpandedUniformItems(newSet);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.uniformItemHeader}>
                          <Text style={styles.uniformItemTitle}>
                            {item.item_name_croatian || item.item_name}
                          </Text>
                          {isExpanded ? (
                            <ChevronUp size={18} color={theme.colors.text.tertiary} strokeWidth={2} />
                          ) : (
                            <ChevronDown size={18} color={theme.colors.text.tertiary} strokeWidth={2} />
                          )}
                        </View>
                        {isExpanded && item.description_croatian && (
                          <View style={styles.uniformItemContent}>
                            <Text style={styles.uniformItemDescription}>
                              {item.description_croatian}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </ModernCard>
                  </Animated.View>
                );
              })}
            </Animated.View>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.lg,
  },
  errorText: {
    ...theme.typography.body1,
    color: theme.colors.error.main,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroContainer: {
    position: 'relative',
    height: 400,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.lg,
  },
  heroTitle: {
    ...theme.typography.display,
    fontSize: 32,
    color: theme.colors.text.inverse,
    fontFamily: fonts.title,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  descriptionCard: {
    padding: theme.spacing.lg,
  },
  description: {
    ...theme.typography.body1,
    color: theme.colors.text.secondary,
    lineHeight: 26,
  },
  readMoreButton: {
    marginTop: theme.spacing.md,
  },
  readMoreText: {
    ...theme.typography.body2,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  cardWrapper: {
    marginBottom: theme.spacing.md,
  },
  uniformItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  uniformItemTitle: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  uniformItemContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
  uniformItemDescription: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 100,
  },
});
