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
import { Category, ContentItem } from '@/types/database';
import { ArrowLeft, FileText, Image as ImageIcon, Music, Video } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const getResponsiveImageHeight = () => {
  if (screenWidth < 375) return 120;
  if (screenWidth < 414) return 150;
  return 160;
};

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCategoryDetails();
  }, [id]);

  async function loadCategoryDetails() {
    try {
      setLoading(true);
      setError(null);

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (categoryError) throw categoryError;
      if (!categoryData) throw new Error('Category not found');

      setCategory(categoryData);

      const { data: contentData, error: contentError } = await supabase
        .from('content_items')
        .select('*')
        .eq('category_id', id)
        .order('display_order', { ascending: true });

      if (contentError) throw contentError;
      setContentItems(contentData || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load category details'
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleExpanded(itemId: string) {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }

  function getMediaIcon(mediaType: string) {
    switch (mediaType) {
      case 'image':
        return <ImageIcon size={20} color="#2563eb" />;
      case 'audio':
        return <Music size={20} color="#2563eb" />;
      case 'video':
        return <Video size={20} color="#2563eb" />;
      default:
        return <FileText size={20} color="#2563eb" />;
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !category) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Category not found'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
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
          {category.title}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          {category.title_local && (
            <Text style={styles.categoryTitleLocal}>
              {category.title_local}
            </Text>
          )}
          <Text style={styles.categoryDescription}>
            {category.description_croatian || category.description}
          </Text>
        </View>

        {contentItems.length === 0 ? (
          <View style={styles.emptyContent}>
            <FileText size={48} color="#d1d5db" />
            <Text style={styles.emptyContentText}>
              No content available yet
            </Text>
          </View>
        ) : (
          <View style={styles.contentList}>
            {contentItems.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              return (
                <View key={item.id} style={styles.contentCard}>
                  <TouchableOpacity
                    style={styles.contentHeader}
                    onPress={() => toggleExpanded(item.id)}
                    activeOpacity={0.7}>
                    {getMediaIcon(item.media_type)}
                    <View style={styles.contentHeaderText}>
                      <Text style={styles.contentTitle}>{item.title}</Text>
                      {item.title_local && (
                        <Text style={styles.contentTitleLocal}>
                          {item.title_local}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.contentBody}>
                      {item.media_url && item.media_type === 'image' && (
                        <Image
                          source={{ uri: item.media_url }}
                          style={styles.contentImage}
                          resizeMode="cover"
                        />
                      )}

                      <Text style={styles.contentBodyText}>{item.body}</Text>

                      {item.historical_context && (
                        <View style={styles.contextSection}>
                          <Text style={styles.contextLabel}>
                            Historical Context
                          </Text>
                          <Text style={styles.contextText}>
                            {item.historical_context}
                          </Text>
                        </View>
                      )}

                      {item.cultural_significance && (
                        <View style={styles.contextSection}>
                          <Text style={styles.contextLabel}>
                            Cultural Significance
                          </Text>
                          <Text style={styles.contextText}>
                            {item.cultural_significance}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
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
    backgroundColor: '#2563eb',
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
  categoryInfo: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 8,
    borderBottomColor: '#f3f4f6',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  categoryTitleLocal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 10,
  },
  categoryDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  emptyContent: {
    padding: 60,
    alignItems: 'center',
  },
  emptyContentText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 16,
  },
  contentList: {
    padding: 16,
    gap: 12,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contentHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  contentTitleLocal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
    marginTop: 2,
  },
  contentBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentImage: {
    width: '100%',
    height: getResponsiveImageHeight(),
    borderRadius: 8,
    marginBottom: 12,
  },
  contentBodyText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  contextSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  contextLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contextText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
});
