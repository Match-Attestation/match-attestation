import { FrameRequest, getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Match, MATCH_EXPIRY } from "@/app/types";
import { kv } from "@vercel/kv";
import { ethers } from "ethers";
import { EAS, Offchain, SchemaEncoder, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";

import { NextRequest, NextResponse } from 'next/server';
import { SignerOrProvider } from '@ethereum-attestation-service/eas-sdk/dist/transaction';

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

    const { input, interactor, liked, recasted } = message;

    if (!input) {
        return NextResponse.json({ error: 'Missing input' }, { status: 400 });
    }

    if (!liked || !recasted) {
        return new NextResponse(
            getFrameHtmlResponse({
                image: '/images/you_must_like_and_recast.png',
            })
        )
    }

    let winners = input.trim().split(',').map((i) => parseInt(i));
    if (winners.length < 1) {
        return NextResponse.json({ error: 'Invalid winners' }, { status: 400 });
    }

    if (match.created_at + MATCH_EXPIRY < Date.now()) {
        return NextResponse.json({ error: 'Match expired' }, { status: 400 });
    }

    let winnersIds = winners.map((i) => match?.users[i - 1]);

    // Attest to win
    const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

    // Initialize the sdk with the address of the EAS Schema contract address
    const eas = new EAS(EASContractAddress);

    // Gets a default provider (in production use something else like infura/alchemy)
    const provider = ethers.getDefaultProvider(
        "sepolia"
    );

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('Private key is missing');
    }

    const signer: ethers.Signer = new ethers.Wallet(privateKey, provider);

    eas.connect(signer as any);

    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder("bytes32 id,string title,bytes32 referee,bytes32[] players,bytes32[] winnners");
    const encodedData = schemaEncoder.encodeData([
        { name: "id", value: match.id, type: "bytes32" },
        { name: "title", value: match.title, type: "string" },
        { name: "referee", value: match.referee, type: "bytes32" },
        { name: "players", value: match.users, type: "bytes32[]" },
        { name: "winnners", value: winnersIds, type: "bytes32[]" }
    ]);
    const schemaUID = "0xf0146b763d066465cb2fa39a158ff83843875282abb607cb053c11cadc60fc4a";

    const tx = await eas.attest({
        schema: schemaUID,
        data: {
            recipient: "0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165",
            expirationTime: BigInt(Date.now() + 100 * 60 * 60 * 24 * 365),
            revocable: true,
            data: encodedData,
        },
    });

    const newAttestationUID = await tx.wait();

    console.log("New attestation UID:", newAttestationUID);

    if (String(interactor.fid) === match.referee) {
        await kv.set(matchId, { ...match, winners: winnersIds });
    }

    return new NextResponse(
        getFrameHtmlResponse({
            // FIXME: actual image url
            image: '/images/attested.png',
        })
    )
}

export async function POST(req: NextRequest) {
    return getResponse(req);
}