export type AttributeKey =
  | 'tecnologia'
  | 'personas'
  | 'creatividad'
  | 'precision'
  | 'naturaleza'
  | 'negocio'
  | 'fisico'
  | 'ciencia'
  | 'comunicacion'
  | 'arte'
  | 'construccion'
  | 'servicio';

export type AttributeVector = Record<AttributeKey, number>;

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  tecnologia: 'Tecnología',
  personas: 'Orientación a personas',
  creatividad: 'Creatividad',
  precision: 'Precisión y método',
  naturaleza: 'Naturaleza',
  negocio: 'Negocio y gestión',
  fisico: 'Trabajo práctico',
  ciencia: 'Ciencia y salud',
  comunicacion: 'Comunicación',
  arte: 'Arte y diseño',
  construccion: 'Construcción',
  servicio: 'Servicio y atención',
};

export const ATTRIBUTE_EMOJIS: Record<AttributeKey, string> = {
  tecnologia: '💻',
  personas: '🤝',
  creatividad: '🚀',
  precision: '🎯',
  naturaleza: '🌿',
  negocio: '📊',
  fisico: '🔧',
  ciencia: '🔬',
  comunicacion: '💬',
  arte: '🎨',
  construccion: '🏗️',
  servicio: '⭐',
};

export const ATTRIBUTE_DESCRIPTIONS: Record<AttributeKey, string> = {
  tecnologia: 'disfrutas del mundo digital y la resolución de problemas técnicos',
  personas: 'tienes vocación de ayudar y te importa el bienestar de los demás',
  creatividad: 'piensas de forma creativa y disfrutas inventando cosas nuevas',
  precision: 'eres metódico/a y disfrutas de la organización y el detalle',
  naturaleza: 'te sientes atraído/a por el entorno natural y la sostenibilidad',
  negocio: 'tienes mentalidad emprendedora y te interesan los negocios',
  fisico: 'prefieres el trabajo práctico y los resultados tangibles',
  ciencia: 'te fascina la ciencia y el conocimiento aplicado a la realidad',
  comunicacion: 'tienes habilidades sociales y disfrutas expresándote con otros',
  arte: 'tienes sensibilidad estética y te atrae la creación visual',
  construccion: 'te apasiona construir, diseñar e instalar sistemas reales',
  servicio: 'tienes vocación de servicio y disfrutas atendiendo a otras personas',
};

export interface QuestionOption {
  id: string;
  emoji: string;
  text: string;
  weights: Partial<AttributeVector>;
}

export interface Question {
  id: number;
  category: string;
  text: string;
  options: QuestionOption[];
}

export interface FamilyProfile {
  codigo: string;
  nombre: string;
  emoji: string;
  colorFrom: string;
  colorTo: string;
  textColor: string;
  weights: Partial<AttributeVector>;
  tagline: string;
  descripcion: string;
  queAprenderas: string[];
  salidasProfesionales: string[];
  perfilTipico: string;
  ciclosDestacados: string[];
  ventajas: string[];
  nivelRecomendado: string;
  queryParam: string;
}

export interface FamilyMatch {
  family: FamilyProfile;
  score: number;
  matchedTraits: AttributeKey[];
  justification: string;
}

export interface UserProfileResult {
  attributes: AttributeVector;
  topAttributes: AttributeKey[];
  profileSentences: string[];
  workEnvironment: string;
  profileLabel: string;
}

export interface QuizResult {
  userProfile: UserProfileResult;
  matches: FamilyMatch[];
  completedAt: number;
}
