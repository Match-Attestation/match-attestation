"use server";

import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";
import { Match, MATCH_EXPIRY } from "./types";
import { redirect } from "next/navigation";

export async function saveMatch(match: Match) {
  await kv.hset(`match:${match.id}`, match);
  await kv.expire(`match:${match.id}`, MATCH_EXPIRY);
  await kv.zadd("matches_by_date", {
    score: Number(match.created_at),
    member: match.id,
  });

  revalidatePath("/matches");
  redirect(`/matches/${match.id}`);
}

// TODO: Rework to work with the new API
export async function attestMatch(match: Match, winnerId: string) {
  await kv.hset(`match:${match.id}`, { winner: winnerId });

  revalidatePath(`/matches/${match.id}`);
  redirect(`/matches/${match.id}?results=true`);
}

export async function redirectToMatches() {
  redirect("/matches");
}
