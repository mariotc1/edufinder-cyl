import { QUESTIONS, FAMILIES } from './data';
import {
  AttributeKey,
  AttributeVector,
  FamilyMatch,
  FamilyProfile,
  QuizResult,
  UserProfileResult,
  ATTRIBUTE_DESCRIPTIONS,
  ATTRIBUTE_LABELS,
} from './types';

const ALL_ATTRIBUTES: AttributeKey[] = [
  'tecnologia', 'personas', 'creatividad', 'precision',
  'naturaleza', 'negocio', 'fisico', 'ciencia',
  'comunicacion', 'arte', 'construccion', 'servicio',
];

function emptyVector(): AttributeVector {
  return ALL_ATTRIBUTES.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as AttributeVector);
}

export function buildUserVector(answers: Record<number, string>): AttributeVector {
  const vector = emptyVector();

  for (const question of QUESTIONS) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue;

    const option = question.options.find(o => o.id === selectedOptionId);
    if (!option) continue;

    for (const [attr, weight] of Object.entries(option.weights) as [AttributeKey, number][]) {
      vector[attr] += weight;
    }
  }

  return vector;
}

function normalize(vector: AttributeVector): AttributeVector {
  const max = Math.max(...Object.values(vector), 1);
  const result = emptyVector();
  for (const key of ALL_ATTRIBUTES) {
    result[key] = (vector[key] / max) * 100;
  }
  return result;
}

function scoreFamilyMatch(userVector: AttributeVector, family: FamilyProfile): number {
  const familyAttrs = Object.entries(family.weights) as [AttributeKey, number][];
  const familyMax = Math.max(...Object.values(family.weights), 1);

  let dotProduct = 0;
  let familyMagnitude = 0;
  let userMagnitude = 0;

  for (const [attr, familyWeight] of familyAttrs) {
    const normalizedFamily = familyWeight / familyMax;
    const normalizedUser = userVector[attr] / 100;

    dotProduct += normalizedUser * normalizedFamily;
    familyMagnitude += normalizedFamily * normalizedFamily;
    userMagnitude += normalizedUser * normalizedUser;
  }

  if (familyMagnitude === 0 || userMagnitude === 0) return 0;

  const cosine = dotProduct / (Math.sqrt(familyMagnitude) * Math.sqrt(userMagnitude));
  return Math.round(cosine * 100);
}

function getMatchedTraits(userVector: AttributeVector, family: FamilyProfile): AttributeKey[] {
  const familyAttrs = Object.entries(family.weights) as [AttributeKey, number][];
  const familyTopAttrs = familyAttrs
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([attr]) => attr);

  const sortedUser = [...ALL_ATTRIBUTES].sort((a, b) => userVector[b] - userVector[a]);
  const userTopAttrs = new Set(sortedUser.slice(0, 6));

  return familyTopAttrs.filter(attr => userTopAttrs.has(attr));
}

function buildJustification(matchedTraits: AttributeKey[], family: FamilyProfile): string {
  if (matchedTraits.length === 0) {
    return `${family.nombre} puede abrirte puertas en áreas que quizás aún no conoces.`;
  }

  const labels = matchedTraits.slice(0, 3).map(attr => ATTRIBUTE_LABELS[attr].toLowerCase());

  if (labels.length === 1) {
    return `Encaja con tu perfil de ${labels[0]}.`;
  }
  if (labels.length === 2) {
    return `Encaja con tu ${labels[0]} y tu ${labels[1]}.`;
  }
  return `Conecta con tu ${labels[0]}, tu ${labels[1]} y tu ${labels[2]}.`;
}

function buildUserProfile(rawVector: AttributeVector): UserProfileResult {
  const normalized = normalize(rawVector);

  const sorted = [...ALL_ATTRIBUTES].sort(
    (a, b) => normalized[b] - normalized[a]
  );
  const topAttributes = sorted.slice(0, 4) as AttributeKey[];

  const profileSentences = topAttributes
    .slice(0, 3)
    .map(attr => ATTRIBUTE_DESCRIPTIONS[attr]);

  const workEnvironmentMap: Partial<Record<AttributeKey, string>> = {
    tecnologia: 'entornos digitales y técnicos con herramientas modernas',
    personas: 'entornos con trato humano directo y trabajo en equipo',
    creatividad: 'entornos creativos con libertad para innovar',
    precision: 'entornos estructurados donde el detalle y el orden importan',
    naturaleza: 'entornos al aire libre o relacionados con el medio natural',
    negocio: 'entornos empresariales con gestión y toma de decisiones',
    fisico: 'entornos prácticos donde se trabaja con las manos y el cuerpo',
    ciencia: 'entornos científicos o sanitarios con rigor técnico',
    comunicacion: 'entornos sociales y comunicativos con muchas interacciones',
    arte: 'entornos estéticos y artísticos llenos de creatividad visual',
    construccion: 'entornos de obra, instalación y fabricación física',
    servicio: 'entornos de atención y servicio directo al público',
  };

  const workEnvironment = workEnvironmentMap[topAttributes[0]] ||
    'entornos variados que combinen varios de tus intereses';

  const profileLabelMap: Partial<Record<AttributeKey, string>> = {
    tecnologia: 'Perfil tecnológico y digital',
    personas: 'Perfil social y de ayuda',
    creatividad: 'Perfil creativo e innovador',
    precision: 'Perfil analítico y metódico',
    naturaleza: 'Perfil natural y sostenible',
    negocio: 'Perfil emprendedor y gestor',
    fisico: 'Perfil práctico y manual',
    ciencia: 'Perfil científico y sanitario',
    comunicacion: 'Perfil comunicador y social',
    arte: 'Perfil artístico y visual',
    construccion: 'Perfil técnico y constructor',
    servicio: 'Perfil de servicio y atención',
  };

  const profileLabel = profileLabelMap[topAttributes[0]] || 'Perfil mixto y versátil';

  return { attributes: normalized, topAttributes, profileSentences, workEnvironment, profileLabel };
}

export function runQuiz(answers: Record<number, string>): QuizResult {
  const rawVector = buildUserVector(answers);
  const userProfile = buildUserProfile(rawVector);
  const normalizedVector = userProfile.attributes;

  const scored = FAMILIES.map(family => {
    const score = scoreFamilyMatch(normalizedVector, family);
    const matchedTraits = getMatchedTraits(normalizedVector, family);
    const justification = buildJustification(matchedTraits, family);
    return { family, score, matchedTraits, justification } as FamilyMatch;
  });

  scored.sort((a, b) => b.score - a.score);

  return {
    userProfile,
    matches: scored.slice(0, 3),
    completedAt: Date.now(),
  };
}

export function getTotalQuestions(): number {
  return QUESTIONS.length;
}
