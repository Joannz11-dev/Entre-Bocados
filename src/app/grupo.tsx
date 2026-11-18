import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDemo } from '../state/demo';
import { Colors, FontNames, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../constants/theme';
import { GROUPS, type GroupMock } from '../data/social';
import { FeedbackPill, HonestNote, Rise, TopInset, VioletButton } from '../components/kit/ui';
import { Confetti } from '../components/kit/confetti';
import { haptic } from '../lib/haptics';

export default function Grupo() {
  const { data, update, addPlan } = useDemo();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);

  const join = (group: GroupMock) => {
    if (data.joinedGroups.includes(group.id)) {
      router.push({ pathname: '/chat', params: { thread: `grupo:${group.id}` } });
      return;
    }
    haptic.success();
    update({ joinedGroups: [...data.joinedGroups, group.id] });
    addPlan({ title: group.name, when: group.when, status: 'pendiente', source: 'grupo', note: `Grupo demo · ${group.cuisine} · ${group.budget}` });
    setBurst(b => b + 1);
    setFeedback(`¡Estás dentro de ${group.name}! Plan guardado`);
    setTimeout(() => setFeedback(null), 2600);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.inner, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]}>
        <TopInset />
        <Rise>
          <Text style={Type.display}>Encuentra un grupo</Text>
          <Text style={Type.body}>Sal con nuevas personas: grupos con cocina, presupuesto y hora ya acordados.</Text>
        </Rise>

        {GROUPS.map((group, i) => (
          <Rise key={group.id} delay={100 + i * 80}>
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.avatars}>
                  {group.memberColors.slice(0, 4).map((c, idx) => (
                    <View key={idx} style={[styles.avatar, { backgroundColor: c, marginLeft: idx ? -9 : 0 }]}>
                      <Text style={styles.avatarText}>{String.fromCharCode(65 + (i * 3 + idx) % 26)}</Text>
                    </View>
                  ))}
                  {group.members > 4 && (
                    <View style={[styles.avatar, { backgroundColor: Colors.creamDeep, marginLeft: -9 }]}>
                      <Text style={[styles.avatarText, { color: Colors.inkSoft }]}>+{group.members - 4}</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.countChip]}>
                  <Text style={styles.countText}>{group.members} personas</Text>
                </View>
              </View>
              <View style={{ gap: 3 }}>
                <Text style={styles.name}>{group.name}</Text>
                <Text style={Type.body}>{group.note}</Text>
              </View>
              <View style={styles.chips}>
                <View style={[styles.chip, { backgroundColor: Colors.pinkSoft }]}>
                  <Feather name="coffee" size={11} color={Colors.pinkDeep} />
                  <Text style={[styles.chipText, { color: Colors.pinkDeep }]}>{group.cuisine}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: Colors.amberSoft }]}>
                  <Feather name="dollar-sign" size={11} color={Colors.amberDeep} />
                  <Text style={[styles.chipText, { color: Colors.amberDeep }]}>{group.budget}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: Colors.greenSoft }]}>
                  <Feather name="clock" size={11} color={Colors.greenDeep} />
                  <Text style={[styles.chipText, { color: Colors.greenDeep }]}>{group.when}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  {data.joinedGroups.includes(group.id) ? (
                    <VioletButton title="Hablar con el grupo" icon="message-circle" onPress={() => join(group)} />
                  ) : (
                    <VioletButton title="Unirme al grupo" icon="user-plus" onPress={() => join(group)} />
                  )}
                </View>
              </View>
            </View>
          </Rise>
        ))}

        <Rise delay={400}>
          <HonestNote tone="violet">Grupos ficticios de la demo: nadie real se reúne aquí, pero el plan queda guardado en tu dispositivo.</HonestNote>
        </Rise>
      </View>
      <Confetti burst={burst} count={20} />
      <FeedbackPill message={feedback} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  inner: { flex: 1, paddingHorizontal: Spacing.l, paddingTop: 18, gap: Spacing.m, paddingBottom: 48 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.sheet, padding: Spacing.l, gap: 10, ...Shadow.card },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.white },
  avatarText: { fontFamily: FontNames.displayHeavy, fontSize: 16, color: Colors.white },
  countChip: { backgroundColor: Colors.cream, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  countText: { fontFamily: FontNames.label, fontSize: 11.5, color: Colors.inkSoft },
  name: { fontFamily: FontNames.display, fontSize: 19, color: Colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontFamily: FontNames.label, fontSize: 11 },
});
