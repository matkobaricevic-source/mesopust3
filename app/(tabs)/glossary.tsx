import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { MapPin, Calendar as CalendarIcon, Heart } from 'lucide-react-native';
import { fonts } from '@/constants/fonts';

export default function InfoScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mesopust</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={24} color="#a855f7" />
            <Text style={styles.sectionTitle}>Lokacija</Text>
          </View>
          <Text style={styles.sectionText}>
            <Text style={styles.bold}>Novi Vinodolski</Text> je povijesni grad na
            hrvatskom Jadranu gdje se Mesopust slavi već generacijama, predstavljajući
            važan dio lokalne kulturne baštine.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarIcon size={24} color="#a855f7" />
            <Text style={styles.sectionTitle}>Što je Mesopust?</Text>
          </View>
          <Text style={styles.sectionText}>
            Mesopust je tradicionalna karnevalska proslava koja obilježava
            razdoblje prije korizme u kršćanskom kalendaru. Riječ "Mesopust" dolazi
            od "meso" i "pustiti", što se odnosi na oproštaj od mesa prije posta.
          </Text>
        </View>


        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={24} color="#a855f7" />
            <Text style={styles.sectionTitle}>Kulturni značaj</Text>
          </View>
          <Text style={styles.sectionText}>
            Tradicija Mesopusta čuva hrvatsku kulturnu baštinu i okuplja
            zajednicu. Povezuje mlađe generacije s njihovim precima kroz
            glazbu, ples i tradicionalne običaje. Slavlje prikazuje regionalni
            identitet i čuva priče i tradicije Novog Vinodolskog.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Doživite živu tradiciju Mesopusta
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5ff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  headerContent: {
    width: '100%',
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: fonts.title,
    color: '#7c3aed',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 0,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 12,
  },
  sectionTextCroatian: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  bold: {
    fontWeight: '700',
    color: '#111827',
  },
  participantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  participantTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  participantText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 8,
  },
  participantTextCroatian: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  footerTextCroatian: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
