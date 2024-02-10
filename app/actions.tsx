"use server";

import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";
import { Match, MATCH_EXPIRY } from "./types";
import { redirect } from "next/navigation";

export async function saveMatch(match: Match) {
  await kv.hset(`match:${match.id}`, match);
  await kv.expire(`match:${match.id}`, MATCH_EXPIRY);

  revalidatePath("/matches");
  redirect(`/matches/${match.id}`);
}
