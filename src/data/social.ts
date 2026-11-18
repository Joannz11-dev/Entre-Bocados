import { Colors } from '../constants/theme';

/**
 * Capa social simulada: personas, dúos y grupos son ficticios.
 * La app lo nombra en pantalla; aquí viven los datos del juego.
 */

export type Persona = {
  id: string;
  name: string;
  age: number;
  color: string;
  bio: string;
  cuisines: string[];
  zone: string;
  budget: string;
  availability: string;
  distance: string;
  /** Ubicación aproximada (ficticia pero coherente) para calcular distancia real con el GPS. */
  coords: { latitude: number; longitude: number };
  opener: string;
  lines: string[];
  planProposal: { title: string; when: string } | null;
  quickReplies: string[];
};

export const PERSONAS: Persona[] = [
  {
    id: 'valentina',
    name: 'Valentina',
    age: 23,
    color: Colors.pink,
    bio: 'Fan del ramen y de los planes improvisados. Si hay gyozas de por medio, ya voy.',
    cuisines: ['Asiática', 'Italiana'],
    zone: 'Usaquén',
    budget: '$$',
    availability: 'Vie. 5pm – 9pm',
    distance: 'A 1.5 km',
    coords: { latitude: 4.7021, longitude: -74.0281 },
    opener: '¡Hola! ¿También te salió este plan?',
    lines: [
      'Me parece perfecto. ¿Sábado o viernes?',
      'Yo con tal de probar cosas nuevas… ¡meto la receta de mi abuela si ganan las pasta!',
      'Hecho. Nos vemos allá, llego con antelación.',
    ],
    planProposal: { title: 'Ramen House', when: 'Sáb. 7pm' },
    quickReplies: ['¡Genial! ¿Vamos por ramen?', '¿Qué horario te sirve?', '¡Confirmado, nos vemos!'],
  },
  {
    id: 'sofia',
    name: 'Sofía',
    age: 25,
    color: Colors.violet,
    bio: 'Cazadora de ajiacos y mercados de domingo. El brunch es sagrado.',
    cuisines: ['Colombiana'],
    zone: 'Chapinero',
    budget: '$$',
    availability: 'Dom. 11am – 2pm',
    distance: 'A 3 km',
    coords: { latitude: 4.6531, longitude: -74.0628 },
    opener: '¡Buenas! Vi que también te van los planes de domingo.',
    lines: [
      '¡Perfecto! A mí me encanta el mercado de los domingos.',
      '¿Les provoca ajiaco o algo más ligero? Yo digo ajiaco y llueve lo que tenga que llover.',
      'Listo, guardo el plan y aviso. ¡Nos vemos ahí!',
    ],
    planProposal: { title: 'Casa Tomillo', when: 'Dom. 1pm' },
    quickReplies: ['¡Vamos por ajiaco!', '¿Domingo a mediodía?', '¡Confirmado!'],
  },
  {
    id: 'dani',
    name: 'Dani',
    age: 27,
    color: Colors.orange,
    bio: 'Parrillero de corazón. Cree que una buena costilla arregla la semana.',
    cuisines: ['Carnes'],
    zone: 'Usaquén',
    budget: '$$$',
    availability: 'Sáb. 12pm – 4pm',
    distance: 'A 2 km',
    coords: { latitude: 4.7098, longitude: -74.0412 },
    opener: '¡Qué más! ¿Ya probaste las costillas de Santa Costilla?',
    lines: [
      '¡Ese plan! Yo llevo la república de los que piden doble.',
      '¿Mediodía o tarde? Yo me uno a lo que salga.',
      'De una, reservo mentalmente y nos vemos.',
    ],
    planProposal: { title: 'Santa Costilla', when: 'Sáb. 1pm' },
    quickReplies: ['¡Yo también voy por costillas!', '¿Sábado al mediodía?', '¡Hecho!'],
  },
  {
    id: 'cami',
    name: 'Cami',
    age: 22,
    color: Colors.green,
    bio: 'Dulcera profesional en el alma. Los postres cuentan como cena, no me discutan.',
    cuisines: ['Postres', 'Café'],
    zone: 'Chapinero',
    budget: '$',
    availability: 'Vie. 7pm – 10pm',
    distance: 'A 4 km',
    coords: { latitude: 4.6665, longitude: -74.0544 },
    opener: '¡Hola! Aviso: mis planes siempre terminan en postre.',
    lines: [
      '¡Perfecto! Yo ya tengo lista la lista de postres por probar.',
      '¿Nos vamos por algo dulce o dulce Y salado primero?',
      'Trato hecho. Si hay torta de la casa, se pide sí o sí.',
    ],
    planProposal: { title: 'La Mesa de Postres', when: 'Vie. 8pm' },
    quickReplies: ['¡Dulce primero!', '¿Este viernes?', '¡Vamos!'],
  },
];

export type Duo = {
  id: string;
  a: string;
  b: string;
  aColor: string;
  bColor: string;
  cuisine: string;
  zone: string;
  when: string;
  budget: string;
  note: string;
};

export const DUOS: Duo[] = [
  { id: 'duo-mau-vale', a: 'Mau', b: 'Vale', aColor: Colors.violetDeep, bColor: Colors.pinkDeep, cuisine: 'Italiana', zone: 'Chapinero', when: 'Sáb. 8pm', budget: '$$', note: 'Buscan la pasta perfecta de la ciudad.' },
  { id: 'duo-sami-nico', a: 'Sami', b: 'Nico', aColor: Colors.orangeDeep, bColor: Colors.greenDeep, cuisine: 'Asiática', zone: 'Usaquén', when: 'Vie. 7pm', budget: '$$', note: 'Coleccionan ramen y gyozas por Bogotá.' },
  { id: 'duo-teo-lu', a: 'Teo', b: 'Lu', aColor: Colors.pinkDeep, bColor: Colors.amberDeep, cuisine: 'Colombiana', zone: 'La Candelaria', when: 'Dom. 1pm', budget: '$', note: 'Turistas de la tabla: menú del día siempre.' },
];

export type GroupMock = {
  id: string;
  name: string;
  cuisine: string;
  budget: string;
  when: string;
  members: number;
  memberColors: string[];
  note: string;
};

export const GROUPS: GroupMock[] = [
  { id: 'g-rameneros', name: 'Rameneros del viernes', cuisine: 'Asiática', budget: '$20k – $40k', when: 'Vie. 7pm – 9pm', members: 4, memberColors: [Colors.pinkDeep, Colors.violetDeep, Colors.orangeDeep, Colors.greenDeep], note: 'Un caldo distinto por semana. Se divide la cuenta y las sobras no existen.' },
  { id: 'g-pizza', name: 'Pizza Fridays', cuisine: 'Italiana', budget: '$30k – $50k', when: 'Sáb. 8pm', members: 5, memberColors: [Colors.violetDeep, Colors.pinkDeep, Colors.amberDeep, Colors.orangeDeep, Colors.greenDeep], note: 'Masa napoletana o parrilla, y una votación muy seria.' },
  { id: 'g-brunch', name: 'Brunch Club', cuisine: 'Colombiana', budget: '$15k – $30k', when: 'Dom. 11am', members: 3, memberColors: [Colors.greenDeep, Colors.pinkDeep, Colors.violetDeep], note: 'Domingo, huevos pericos y chismes del semestre.' },
];

/** Hilo de chat: respuestas guionizadas, una por mensaje del usuario. */
export function threadKey(kind: 'persona' | 'duo' | 'grupo', id: string) {
  return `${kind}:${id}`;
}

export function displayName(kind: 'persona' | 'duo' | 'grupo', id: string): string {
  if (kind === 'persona') return PERSONAS.find(p => p.id === id)?.name ?? 'Invitado';
  if (kind === 'duo') {
    const d = DUOS.find(x => x.id === id);
    return d ? `${d.a} y ${d.b}` : 'Dúo';
  }
  return GROUPS.find(g => g.id === id)?.name ?? 'Grupo';
}

export function botScript(kind: 'persona' | 'duo' | 'grupo', id: string): string[] {
  if (kind === 'persona') return PERSONAS.find(p => p.id === id)?.lines ?? [];
  if (kind === 'duo') {
    const d = DUOS.find(x => x.id === id);
    return d
      ? [`¡Hola! Somos ${d.a} y ${d.b}. Vimos que coincidimos en ${d.cuisine.toLowerCase()}.`, '¡De una! ¿Les parece la hora que propusimos?', '¡Listo! Nos vemos ahí, gracias por sumarnos.']
      : [];
  }
  const g = GROUPS.find(x => x.id === id);
  return g
    ? [`¡Bienvenid@ a ${g.name}! Somos ${g.members} y siempre cabe uno más.`, 'La regla es una: llegar con hambre y sin drama con la cuenta.', '¡Hecho! Te apuntamos para ' + g.when + '.']
    : [];
}
