
export interface ImageState {
  original: string | null;
  modified: string | null;
  loading: boolean;
  error: string | null;
}

export interface RedecorationRequest {
  image: string; // base64
  prompt: string;
}
