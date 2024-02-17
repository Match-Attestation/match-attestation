export type UserProfile = {
  display_name: string;
  fid: string;
  pfp_url: string;
};
export type Match = {
  id: string;
  title: string;
  created_at: number;
  users: Array<UserProfile | null>;
  winners: Array<string>;
  referee: string;
};

export const MATCH_EXPIRY = 60 * 60 * 24 * 180; // Expire match after 3 months
