import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Event, UserPhoto } from '@/types/database';
import { Camera, LogIn, LogOut, Send, X, ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernButton } from '@/components/ModernButton';
import { ModernCard } from '@/components/ModernCard';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface PhotoWithEvent extends UserPhoto {
  events: Event;
  user_email?: string;
}

interface EventWithParent extends Event {
  parent?: { title: string } | null;
}

export default function SocialScreen() {
  const { user, signIn, signUp, signOut } = useAuth();
  const [events, setEvents] = useState<EventWithParent[]>([]);
  const [photos, setPhotos] = useState<PhotoWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);

      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          *,
          parent:parent_event_id(title)
        `)
        .order('display_order', { ascending: true });

      setEvents(eventsData || []);

      if (user) {
        const { data: photosData } = await supabase
          .from('user_photos')
          .select('*, events(*)')
          .order('created_at', { ascending: false });

        setPhotos(photosData as PhotoWithEvent[] || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Greška', 'Molimo unesite email i lozinku');
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        Alert.alert('Greška', error.message);
      } else {
        setEmail('');
        setPassword('');
        Alert.alert('Uspjeh', isSignUp ? 'Račun kreiran!' : 'Prijavljeni ste!');
      }
    } catch (err) {
      Alert.alert('Greška', 'Nešto je pošlo po zlu');
    } finally {
      setAuthLoading(false);
    }
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Potrebna dozvola', 'Potrebna je dozvola za pristup fotografijama');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  }

  async function uploadPhoto() {
    if (!selectedImage || !selectedEvent || !user) return;

    setUploading(true);
    try {
      const { error } = await supabase
        .from('user_photos')
        .insert({
          user_id: user.id,
          event_id: selectedEvent,
          image_url: selectedImage,
          caption: caption || null,
        });

      if (error) throw error;

      Alert.alert('Uspjeh', 'Fotografija objavljena!');
      setSelectedImage(null);
      setCaption('');
      setSelectedEvent(null);
      loadData();
    } catch (err) {
      Alert.alert('Greška', 'Nije moguće objaviti fotografiju');
    } finally {
      setUploading(false);
    }
  }

  function isTodayEventDay(): boolean {
    const today = new Date();
    return events.some(event => {
      const eventDate = new Date(event.created_at);
      return (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth()
      );
    });
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/MESOPUSNA-MREZA.png')}
            style={styles.headerLogo}
            resizeMode="cover"
          />
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.authContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.authCard}>
            <LogIn size={48} color="#dc2626" style={styles.authIcon} />
            <Text style={styles.authTitle}>
              {isSignUp ? 'Kreiraj račun' : 'Prijavi se pa slikaj kadi si da si vidimo'}
            </Text>
            <Text style={styles.authSubtitle}>
              Dijeli fotografije s Mesopusta
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Lozinka"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuth}
              disabled={authLoading}>
              {authLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isSignUp ? 'Registriraj se' : 'Prijavi se'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.toggleText}>
                {isSignUp
                  ? 'Već imaš račun? Prijavi se'
                  : 'Nemaš račun? Registriraj se'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const canPostToday = isTodayEventDay();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/MESOPUSNA-MREZA.png')}
          style={styles.headerLogo}
          resizeMode="cover"
        />
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <LogOut size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {canPostToday && (
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Podijeli fotografiju</Text>

            {!selectedImage ? (
              <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                <ImageIcon size={32} color="#9ca3af" />
                <Text style={styles.imagePickerText}>Odaberi fotografiju</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}>
                  <X size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}

            {selectedImage && (
              <>
                <Text style={styles.label}>Odaberi događaj:</Text>
                <View style={styles.eventsList}>
                  {events.map(event => (
                    <TouchableOpacity
                      key={event.id}
                      style={[
                        styles.eventOption,
                        selectedEvent === event.id && styles.eventOptionSelected,
                      ]}
                      onPress={() => setSelectedEvent(event.id)}>
                      <Text
                        style={[
                          styles.eventOptionText,
                          selectedEvent === event.id && styles.eventOptionTextSelected,
                        ]}>
                        {event.parent ? `${event.parent.title} - ${event.title}` : event.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.captionInput}
                  placeholder="Dodaj opis (opcionalno)"
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                />

                <TouchableOpacity
                  style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                  onPress={uploadPhoto}
                  disabled={uploading || !selectedEvent}>
                  {uploading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Send size={20} color="#ffffff" />
                      <Text style={styles.uploadButtonText}>Objavi</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {!canPostToday && (
          <View style={styles.noEventBanner}>
            <Camera size={32} color="#9ca3af" />
            <Text style={styles.noEventText}>
              Dijeljenje fotografija dostupno je samo tijekom dana događaja
            </Text>
          </View>
        )}

        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>
            Nedavne fotografije ({photos.length})
          </Text>

          {photos.length === 0 ? (
            <View style={styles.emptyState}>
              <ImageIcon size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>Još nema objavljenih fotografija</Text>
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {photos.map(photo => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image source={{ uri: photo.image_url }} style={styles.photoImage} />
                  <View style={styles.photoInfo}>
                    <Text style={styles.photoEvent}>{photo.events.title}</Text>
                    {photo.caption && (
                      <Text style={styles.photoCaption}>{photo.caption}</Text>
                    )}
                    <Text style={styles.photoDate}>
                      {new Date(photo.created_at).toLocaleDateString('hr-HR')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
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
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 60,
    paddingBottom: 8,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: fonts.title,
    color: '#111827',
  },
  headerLogo: {
    height: 140,
    width: '100%',
  },
  signOutButton: {
    padding: 8,
    position: 'absolute',
    right: 16,
  },
  content: {
    flex: 1,
  },
  authContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: 600,
  },
  authCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  authIcon: {
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  authButton: {
    width: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 16,
  },
  uploadSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  imagePickerButton: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#dc2626',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  eventsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  eventOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventOptionSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  eventOptionText: {
    color: '#374151',
    fontSize: 14,
  },
  eventOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  captionInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  noEventBanner: {
    backgroundColor: '#f9fafb',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 8,
    borderBottomColor: '#f3f4f6',
  },
  noEventText: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  photosSection: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 12,
  },
  photosGrid: {
    gap: 16,
  },
  photoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  photoImage: {
    width: '100%',
    height: 250,
  },
  photoInfo: {
    padding: 12,
  },
  photoEvent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  photoCaption: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  photoDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
