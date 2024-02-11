import { FrameRequest, getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Match, MATCH_EXPIRY } from "@/app/types";
import { kv } from "@vercel/kv";
import { ethers } from "ethers";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let matchId = req.query["id"] as string;
    if (!matchId) {
        return res.status(418).json({ error: 'Missing match ID' });
    }

    let match: Match | null = null;
    try {
        match = await kv.hgetall(`match:${matchId}`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to retrieve match' });
    }

    if (!match) {
        return res.status(499).json({ error: 'Match not found' });
    }

    const body: FrameRequest = req.body;

    const { isValid, message } = await getFrameMessage(body, {
        neynarApiKey: process.env.NEYNAR_API_KEY,
    });

    if (!isValid) {
        return res.status(400).json({ error: 'Invalid frame message' });
    }

    const { input, interactor, liked, recasted } = message;

    if (!input) {
        return res.status(494).json({ error: 'Invalid input' });
    }

    // if (!liked || !recasted) {
    //     return res.json(
    //         getFrameHtmlResponse({
    //             image: `${process.env["HOST"]}/api/image?id=${matchId}&likeAndRecastRequired=true`,
    //         })
    //     )
    // }

    let winners = input.trim().split(',').map((i) => parseInt(i));
    if (winners.length < 1) {
        return res.status(496).json({ error: 'Invalid input' });
    }

    if (match.created_at + MATCH_EXPIRY < Date.now()) {
        return res.status(412).json({ error: 'Match expired' });
    }

    let winnersIds = winners.map((i) => match?.users[i - 1]);

    if (String(interactor.fid) !== match.referee) {
        return res.json(
            getFrameHtmlResponse({
                image: `${process.env["HOST"]}/api/image?id=${matchId}&interactorIsNotReferee=true`,
            })
        )
    }

    // Attest to win
    const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

    // Initialize the sdk with the address of the EAS Schema contract address
    const eas = new EAS(EASContractAddress);

    let production = false// process.env.NODE_ENV === 'production';
    const provider = production ? new ethers.JsonRpcProvider(process.env.RPC_URL) : ethers.getDefaultProvider("sepolia");

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('Private key is missing');
    }

    const signer: ethers.Signer = new ethers.Wallet(privateKey, provider);

    eas.connect(signer as any);

    const schemaUID = "0x062ddd7a7a5e572efd04583673e06fd9c7825308eddcafb95a5d13a809edeeae";
    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder("bytes32 id,string title,string[] tags,uint64 referee,uint64[] players,uint64[] winners");
    const encodedData = schemaEncoder.encodeData([
        { name: "id", value: uuidToBytes32(match.id), type: "bytes32" },
	    { name: "title", value: match.title, type: "string" },
	    { name: "tags", value: [], type: "string[]" },
	    { name: "referee", value: match.referee, type: "uint64" },
	    { name: "players", value: match.users, type: "uint64[]" },
	    { name: "winners", value: match.winners, type: "uint64[]" },
    ]);


    let refereeAddress = interactor.verified_accounts[0];
    if (!refereeAddress) {
        return res.status(497).json({ error: 'Referee must connect wallet to the farcaster' });
    }

    try {
        const tx = await eas.attest({
            schema: schemaUID,
            data: {
                recipient: refereeAddress,
                expirationTime: BigInt(Date.now() + 100 * 60 * 60 * 24 * 365),
                revocable: true,
                data: encodedData,
            },
        });

        const newAttestationUID = await tx.wait();

        console.log("New attestation UID:", newAttestationUID);

        try {
            await kv.hset(`match:${matchId}`, { attestationUID: newAttestationUID });
            await kv.expire(`match:${match.id}`, 0);
        } catch {
            return res.status(588).json({ error: 'Failed to save attestation' });
        }

        return res.json(
            getFrameHtmlResponse({
                image: `${process.env["HOST"]}/api/image?id=${matchId}&attestationUID=${newAttestationUID}`,
            })
        )
    } catch {
        return res.status(589).json({ error: 'Failed to attest' });
    }
}

function uuidToBytes32(uuid: string): string {
    // Basic validation to check length after removing hyphens
    // A UUID without hyphens should have exactly 32 characters
    const cleanedUuid = uuid.replace(/-/g, "");
    if (cleanedUuid.length !== 32) {
        throw new Error("Invalid UUID format");
    }

    return cleanedUuid;
}
