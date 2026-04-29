export const VALID_AREAS = [
  'ADMINISTRACION',
  'TECNOLOGIA',
  'RECURSOS_HUMANOS',
  'GESTION',
  'BIOLOGIA',
  'QUIMICA',
] as const

export type AppArea = (typeof VALID_AREAS)[number]
