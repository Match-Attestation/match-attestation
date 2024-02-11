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

    return res.json(
        getFrameHtmlResponse({
            image: `${process.env["HOST"]}/api/image?id=${matchId}&attestationUID=${newAttestationUID}`,
        })
    )
}

