import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, Award, Crown, Flag, User } from 'lucide-react-native';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function FormacijaScreen() {
  const router = useRouter();

  const handleFormationRolePress = (roleTitle: string) => {
    router.push(`/role/${encodeURIComponent(roleTitle)}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background.primary, theme.colors.background.secondary]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.text.primary} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Users size={32} color={theme.colors.primary.main} strokeWidth={2} />
              </View>
              <Text style={styles.title}>Formacija mesopustara</Text>
            </View>
          </Animated.View>

          {/* Main Content */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.card}>
            <View style={styles.formationScheme}>
              <Text style={styles.formationHeader}>Formacija u dva reda</Text>

              <Text style={styles.formationExplanation}>
                Formacija je precizno raspoređena: red s ,advitorove ' desne strane predvodi , prvi mesopusni kapitan', dok red s lijeve strane vodi ,drugi kapitan'.{'\n\n'}
                U desnom redu, odmah iza ,kapitana', postrojavaju se ,mesopustari' s instrumentima, jedan iza drugoga, sljedećim redoslijedom: ,mala sopila', ,odgovaralica', ,činele', ,mali bubanj', ,avan' i ,kosa'.{'\n\n'}
                U lijevom redu, također redom, slijede: ,vela sopila', ,vela trumbeta', ,veli bubanj', ,srednji bubanj', ,zvončići' i ,triangul'.{'\n\n'}
                Posljednje mjesto u oba reda uvijek je rezervirano za ,kasire' (blagajnike).{'\n\n'}
                U sredini dvoreda stoji ,advitor' (otprilike između vele ,trumbete' i ,odgovaralice') a iza njega magaziner. Bandiraš stoji između advitora i magazinera od mesopusne nedilje do mesopusne srede (kada ,mesopustari' nose svoje svečane odore) i nosi ,bandiru' (zastavu) i puše po ritmu ,zoge' u ,švikavac' (žviždaljku).{'\n\n'}
                Na ,advitorov' znak „Bubanj i mužika složno udaraj!" ,zasopu sopile' prva dva takta a zatim kreću u korak sa lijevom nogom (lijeva noga je sinkronizirana sa izvedenim tonom ,vele trumbete').{'\n\n'}
                Svi se ,mesopustari' kreću u ritmu ,zoge' čiji tempo dirigira ,advitor', prema naprijed, sa sinkroniziranim korakom bez odstupanja.
              </Text>

              {/* Three columns: Left row, Center, Right row */}
              <View style={styles.formationContainer}>
                {/* Left Row */}
                <View style={styles.formationColumn}>
                  <Text style={styles.formationColumnTitle}>Lijevi Red</Text>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Drugi kapitan')}
                    activeOpacity={0.7}
                  >
                    <Award size={14} color={theme.colors.primary.main} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Drugi kapitan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Kasir')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Kasir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Vela Sopila')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Vela Sopila</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Vela Trumbeta')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Vela Trumbeta</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Veli Bubanj')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Veli Bubanj</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Srednji Bubanj')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Srednji Bubanj</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Zvončići')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Zvončići</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Triangul')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Triangul</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Kosa')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Kosa</Text>
                  </TouchableOpacity>
                </View>

                {/* Center */}
                <View style={styles.formationColumn}>
                  <Text style={styles.formationColumnTitle}>Sredina</Text>
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <TouchableOpacity
                    style={[styles.formationMember, styles.formationLeader]}
                    onPress={() => handleFormationRolePress('Advitor')}
                    activeOpacity={0.7}
                  >
                    <Crown size={16} color={theme.colors.accent.main} strokeWidth={2} />
                    <Text style={styles.formationLeaderText}>Advitor</Text>
                  </TouchableOpacity>
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Bandiraš')}
                    activeOpacity={0.7}
                  >
                    <Flag size={14} color={theme.colors.secondary.main} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Bandiraš</Text>
                  </TouchableOpacity>
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Magaziner')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.formationMemberText}>Magaziner</Text>
                  </TouchableOpacity>
                </View>

                {/* Right Row */}
                <View style={styles.formationColumn}>
                  <Text style={styles.formationColumnTitle}>Desni Red</Text>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Prvi kapitan')}
                    activeOpacity={0.7}
                  >
                    <Award size={14} color={theme.colors.primary.main} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Prvi kapitan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Kasir')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Kasir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Mala Sopila')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Mala Sopila</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Odgovaralica')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Odgovaralica</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Manja Trumbeta')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Manja Trumbeta</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Činele')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Činele</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Mali Bubanj')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Mali Bubanj</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formationMember}
                    onPress={() => handleFormationRolePress('Aran')}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.formationMemberText}>Aran</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.formationFootnote}>
                * Bandiraš stoji između advitora i magazinera od mesopusne nedilje do mesopusne srede
              </Text>
              <Text style={styles.formationFootnote}>
                * Kasiri obavljaju svoju ulogu samo od mesopusne nedilje do mesopusne srede
              </Text>

              <Text style={styles.formationTip}>
                Dodirnite bilo koju ulogu za više informacija
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 32,
    fontFamily: fonts.heading,
    color: theme.colors.text.primary,
  },
  card: {
    backgroundColor: theme.colors.neutral[100],
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  formationScheme: {
    gap: 16,
  },
  formationHeader: {
    fontSize: 20,
    fontFamily: fonts.heading,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  formationExplanation: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  formationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  formationColumn: {
    flex: 1,
    gap: 8,
  },
  formationColumnTitle: {
    fontSize: 12,
    fontFamily: fonts.heading,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formationMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.background.primary,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  formationSpacer: {
    minHeight: 28,
  },
  formationLeader: {
    backgroundColor: theme.colors.accent.main + '15',
    borderWidth: 1,
    borderColor: theme.colors.accent.main + '40',
  },
  formationMemberText: {
    fontSize: 10,
    fontFamily: fonts.body,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  formationLeaderText: {
    fontSize: 10,
    fontFamily: fonts.heading,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  formationFootnote: {
    fontSize: 11,
    fontFamily: fonts.body,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  formationTip: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: 8,
  },
});
