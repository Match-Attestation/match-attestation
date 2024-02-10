import { kv } from "@vercel/kv";
import { Match } from "@/app/types";
import { DecideMatchWinnerForm } from "@/app/form";
import Head from "next/head";
import { Metadata, ResolvingMetadata } from "next";

async function getMatch(id: string): Promise<Match> {
  let nullMatch: Match = {
    id: "",
    created_at: 0,
    title: "No match found",
    users: [],
    winners: [],
    referee: "",
  };

  try {
    console.log(id);

    let match: Match | null = await kv.hgetall(`match:${id}`);

    console.log(match);

    if (!match) {
      return nullMatch;
    }
    return match;
  } catch (error) {
    console.error(error);
    return nullMatch;
  }
}

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id;
  const match = await getMatch(id);

  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["HOST"]}/api/attest?id=${id}`,
    "fc:frame:image": `${process.env["HOST"]}/api/image?id=${id}`,
    "fc:frame:input:text": "Comma separated list of winners",
    "fc:frame:button:1": "Attest",
  };

  return {
    title: match.title,
    openGraph: {
      title: match.title,
      images: [`/api/image?id=${id}`],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(process.env["HOST"] || ""),
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const poll = await getMatch(params.id);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
          <DecideMatchWinnerForm match={poll} />
        </main>
      </div>
    </>
  );
}
