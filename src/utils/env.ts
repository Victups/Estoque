export function getApiBaseUrl (): string {
  // Em desenvolvimento, usa json-server local
  // Em produção, pode usar uma variável de ambiente
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005'
}
