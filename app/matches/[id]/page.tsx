import { kv } from "@vercel/kv";
import { Match } from "@/app/types";
import { DecideMatchWinnerForm } from "@/app/form";
import { MatchAttestationLogo } from "@/app/page";
import { Metadata, ResolvingMetadata } from "next";
import { getFrameMetadata } from "@coinbase/onchainkit";

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
    let match: Match | null = await kv.hgetall(`match:${id}`);

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

  const fcMetadata = getFrameMetadata({
    buttons: [{ action: "post", label: "Attest match" }],
    image: {
      src: `${process.env["HOST"]}/api/image?id=${id}`,
      aspectRatio: "1:1",
    },
    input: {
      text: "Comma separated list of winners",
    },
    postUrl: `${process.env["HOST"]}/api/attest?id=${id}`,
  });

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
  const match = await getMatch(params.id);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
        <div className="flex justify-center items-center bg-black rounded-full w-16 sm:w-24 h-16 sm:h-24 my-8">
          <MatchAttestationLogo className="h-16 sm:h-24 p-3 mb-1" />
        </div>
        <h1 className="text-lg sm:text-2xl font-bold mb-2">
          Farcaster Match attestation
        </h1>
        <h2 className="text-md sm:text-xl mx-4">
          Create a Match with up to 20 People / Teams
        </h2>
        <div
          className="flex flex-wrap items-center justify-around my-8 w-full bg-white rounded-md shadow-xl h-full border border-gray-100"
          style={{ width: "36rem", maxWidth: "90dvw" }}
        >
          <DecideMatchWinnerForm match={match} />
        </div>
      </main>
    </div>
  );
}
