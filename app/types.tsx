export type Match = {
  id: string;
  title: string;
  created_at: number;
  users: Array<string>;
  winners: Array<string>;
  referee: string;
  attestationUID: string | null;
};

export const MATCH_EXPIRY = 60 * 60 * 24 * 180; // Expire match after 3 months

export type AttestationJob = {
  id: string;
  encodedData: string;
  referee: string;
};