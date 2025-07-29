export interface SupabaseUploadResult {
  path: string;
  id: string;
  fullPath: string;
}

export interface MagicUser {
  issuer: string;
  email: string;
  getIdToken: () => Promise<string>;
}
