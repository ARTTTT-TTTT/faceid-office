export type ResourceType =
  | { id: string; adminId: string }
  | { id: string; person: { adminId: string } }
  | { id: string; camera: { adminId: string } }
  | null;
