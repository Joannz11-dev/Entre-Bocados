import React from 'react';
import { Text } from 'react-native';
import { DUOS } from '../data/social';
import { DuoCard } from './(tabs)/connect';
import { HonestNote, Rise, Screen } from '../components/kit/ui';
import { Type } from '../constants/theme';

export default function Duos() {
  return (
    <Screen back title="Dúos disponibles">
      <Rise>
        <Text style={Type.display}>Parejas con planes en común</Text>
        <Text style={Type.body}>Dúos que buscan compañía para su próximo bocado. Conecta y proponles plan.</Text>
      </Rise>
      {DUOS.map((duo, i) => (
        <Rise key={duo.id} delay={100 + i * 70}>
          <DuoCard duo={duo} />
        </Rise>
      ))}
      <Rise delay={400}>
        <HonestNote tone="violet">Dúos ficticios de la demo: nadie real se conecta aquí.</HonestNote>
      </Rise>
    </Screen>
  );
}
