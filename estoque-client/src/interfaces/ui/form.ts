export interface VForm {
  validate: () => Promise<{ valid: boolean }>
  reset: () => void
}

