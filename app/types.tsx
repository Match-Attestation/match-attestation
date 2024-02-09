export type Match = {
  id: string;
  title: string;
  created_at: number;
  users: Array<string>;
  winner: string;
  referee: string;
};

export const MATCH_EXPIRY = 60 * 60 * 24 * 180; // Expire polls after 3 months
