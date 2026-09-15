import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';

import { Badge, Button, Card, Screen, TextField, Toast } from '@/components/ui';
import { useOnboarding } from '@/providers/onboarding-provider';
import { useSession } from '@/providers/session-provider';
import { useTheme } from '@/providers/theme-provider';
import { spacing } from '@/theme/tokens';

export default function OnboardingScreen() {
  const { complete } = useOnboarding();
  const session = useSession();
  const { connectInstance } = session;
  const { colors, resolvedColorMode } = useTheme();
  const { connect } = useLocalSearchParams<{ connect?: string }>();
  const handledDeepLink = useRef<string | null>(null);
  const [domain, setDomain] = useState('');
  const [pairingCode, setPairingCode] = useState('');

  useEffect(() => {
    if (!connect || handledDeepLink.current === connect) return;
    handledDeepLink.current = connect;
    setDomain(connect);
    void connectInstance(connect);
  }, [connect, connectInstance]);

  const confirm = async () => {
    const connected = await session.confirmInstanceConnection(pairingCode);
    if (!connected) return;
    await complete();
    router.replace('/login' as Href);
  };

  return (
    <Screen scroll>
      <View style={styles.content}>
        <Image accessibilityIgnoresInvertColors accessibilityLabel="Neta" resizeMode="contain" source={resolvedColorMode === 'dark' ? require('../../../assets/logo/lightLogoLong.png') : require('../../../assets/logo/blackLogoLong.png')} style={styles.logo} />
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Çalışma alanına bağlan.</Text>
        <Text style={[styles.lead, { color: colors.textMuted }]}>Self-hosted Neta domainini gir veya yöneticinin verdiği <Text style={styles.strong}>neta://connect</Text> QR bağlantısını okut.</Text>
        {!session.pendingInstance ? (
          <Card style={styles.form}>
            <TextField
              autoCapitalize="none"
              autoCorrect={false}
              editable={!session.isBusy}
              keyboardType="url"
              label="Neta domaini veya QR bağlantısı"
              onChangeText={setDomain}
              onSubmitEditing={() => void session.connectInstance(domain)}
              placeholder="neta.ornek.com"
              returnKeyType="go"
              value={domain}
            />
            <Button disabled={!domain.trim()} loading={session.isBusy} onPress={() => void connectInstance(domain)}>Instance’ı doğrula</Button>
            <Text style={[styles.hint, { color: colors.textMuted }]}>Telefon kamerasıyla Neta QR kodunu taradığında bu ekran otomatik olarak doğrulamayı başlatır. Giriş bilgileri keşif isteğine eklenmez.</Text>
          </Card>
        ) : (
          <Card style={styles.form}>
            <View style={styles.row}><Badge tone="success">Doğrulandı</Badge><Text style={[styles.origin, { color: colors.textMuted }]}>{session.pendingInstance.origin}</Text></View>
            <Text style={[styles.workspace, { color: colors.text }]}>{session.pendingInstance.workspaceName}</Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>Instance kimliği: {session.pendingInstance.instanceId}</Text>
            <TextField
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!session.isBusy}
              label="Owner pairing kodu (isteğe bağlı)"
              onChangeText={setPairingCode}
              placeholder="10 karakterli kod"
              value={pairingCode}
            />
            <Button loading={session.isBusy} onPress={() => void confirm()}>Bu instance’a bağlan</Button>
            <Button disabled={session.isBusy} onPress={session.cancelInstanceConnection} variant="secondary">Geri dön</Button>
          </Card>
        )}
        {session.error ? <Toast message={session.error.message} tone="danger" /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: spacing.lg, justifyContent: 'center', paddingVertical: spacing.xl },
  form: { gap: spacing.md },
  hint: { fontSize: 14, lineHeight: 21 },
  lead: { fontSize: 18, lineHeight: 27 },
  logo: { height: 52, width: 150 },
  origin: { flex: 1, fontSize: 13, textAlign: 'right' },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  strong: { fontWeight: '800' },
  title: { fontSize: 36, fontWeight: '900', letterSpacing: -1.1, lineHeight: 42 },
  workspace: { fontSize: 24, fontWeight: '900' },
});
