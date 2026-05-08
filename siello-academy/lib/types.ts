export type ScoutingStatus =
  | 'ELITE_POTENTIAL'
  | 'FOLLOW'
  | 'PASS'
  | 'SIGN_NOW'
  | 'INITIAL_FILTER'
  | 'PENDING';

export type Position =
  | 'Portero'
  | 'Defensa Central'
  | 'Lateral Derecho'
  | 'Lateral Izquierdo'
  | 'Mediocentro Defensivo'
  | 'Mediocentro'
  | 'Mediocentro Ofensivo'
  | 'Extremo Derecho'
  | 'Extremo Izquierdo'
  | 'Delantero Centro'
  | 'Segunda Punta';

export type DominantFoot = 'Diestro' | 'Zurdo' | 'Ambidiestro';

export interface SuggestedTeam {
  club: string;
  category: string;
  observations: string;
  estimatedLevel: string;
}

export interface CoreScores {
  tecnica: number;
  tactica: number;
  fisico: number;
  mentalidad: number;
  intensidad: number;
  tomaDecisiones: number;
  potencial: number;
  adaptabilidad: number;
  juegoSinBalon: number;
  juegoConBalon: number;
}

export interface DetailedAttributes {
  // Físico
  velocidad: number;
  potencia: number;
  resistencia: number;
  aceleracion: number;
  saltoCabeceo: number;
  // Técnico
  controlPase: number;
  tecnicaDominio: number;
  regate: number;
  finalizacion: number;
  centros: number;
  // Mental
  liderazgo: number;
  presionTrasPerdida: number;
  concienciaEspacial: number;
  lecturaJuego: number;
  personalidad: number;
  tomaDedecisiones: number;
  // Táctico
  posicionamiento: number;
  equilibrioDefensivo: number;
  transiciones: number;
  presionAlta: number;
  coberturas: number;
  lecturaEspacios: number;
}

export interface ScoutingReport {
  id: string;
  createdAt: string;
  updatedAt: string;
  language: 'es' | 'en';

  // Player info
  playerName: string;
  dateOfBirth: string;
  nationality: string;
  position: string;
  dominantFoot: DominantFoot | string;
  height: string;
  weight: string;
  currentClub: string;
  evaluationDate: string;
  playerPhoto: string;
  clubLogo: string;

  // Scores
  overallScore: number;
  scoutingStatus: ScoutingStatus;
  coreScores: CoreScores;
  attributes: DetailedAttributes;

  // Text sections
  executiveSummary: string;
  playerContext: string;
  technicalObservations: string;
  tacticalObservations: string;
  physicalObservations: string;
  mentalityBehavior: string;
  roleFit: string;
  finalConclusion: string;
  finalRecommendation: string;

  // Team suggestions
  suggestedTeams: SuggestedTeam[];
}

export const DEFAULT_REPORT: Omit<ScoutingReport, 'id' | 'createdAt' | 'updatedAt'> = {
  language: 'es',
  playerName: '',
  dateOfBirth: '',
  nationality: '',
  position: '',
  dominantFoot: 'Diestro',
  height: '',
  weight: '',
  currentClub: '',
  evaluationDate: new Date().toISOString().split('T')[0],
  playerPhoto: '',
  clubLogo: '',
  overallScore: 0,
  scoutingStatus: 'PENDING',
  coreScores: {
    tecnica: 5,
    tactica: 5,
    fisico: 5,
    mentalidad: 5,
    intensidad: 5,
    tomaDecisiones: 5,
    potencial: 5,
    adaptabilidad: 5,
    juegoSinBalon: 5,
    juegoConBalon: 5,
  },
  attributes: {
    velocidad: 5,
    potencia: 5,
    resistencia: 5,
    aceleracion: 5,
    saltoCabeceo: 5,
    controlPase: 5,
    tecnicaDominio: 5,
    regate: 5,
    finalizacion: 5,
    centros: 5,
    liderazgo: 5,
    presionTrasPerdida: 5,
    concienciaEspacial: 5,
    lecturaJuego: 5,
    personalidad: 5,
    tomaDedecisiones: 5,
    posicionamiento: 5,
    equilibrioDefensivo: 5,
    transiciones: 5,
    presionAlta: 5,
    coberturas: 5,
    lecturaEspacios: 5,
  },
  executiveSummary: '',
  playerContext: '',
  technicalObservations: '',
  tacticalObservations: '',
  physicalObservations: '',
  mentalityBehavior: '',
  roleFit: '',
  finalConclusion: '',
  finalRecommendation: '',
  suggestedTeams: [],
};
