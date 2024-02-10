import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Match, MATCH_EXPIRY } from "@/app/types";
import { kv } from "@vercel/kv";
import { ethers } from "ethers";
import { EAS, Offchain, SchemaEncoder, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";

import { NextRequest, NextResponse } from 'next/server';

async function getResponse(req: NextRequest) {
    let matchId = req.nextUrl.searchParams.get('id');
    if (!matchId) {
        return NextResponse.json({ error: 'Missing match ID' }, { status: 400 });
    }

    let match: Match | null = await kv.get(matchId);
    if (!match) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const body: FrameRequest = await req.json();

    const { isValid, message } = await getFrameMessage(body, {
        neynarApiKey: process.env.NEYNAR_API_KEY,
    });

    if (!isValid) {
        return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const { input, fid } = message;

    let winners = input.trim().split(',').map((i) => parseInt(i));
    if (winners.length < 1) {
        return NextResponse.json({ error: 'Invalid winners' }, { status: 400 });
    }

    if (match.created_at + MATCH_EXPIRY < Date.now()) {
        return NextResponse.json({ error: 'Match expired' }, { status: 400 });
    }

    let winnersIds = winners.map((i) => match.users[i]);

    // Attest to win
    const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

    // Initialize the sdk with the address of the EAS Schema contract address
    const eas = new EAS(EASContractAddress);

    // Gets a default provider (in production use something else like infura/alchemy)
    const provider = ethers.getDefaultProvider(
        "sepolia"
    );

    // Connects an ethers style provider/signingProvider to perform read/write functions.
    // MUST be a signer to do write operations!
    eas.connect(provider);

    return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
    return getResponse(req);
}