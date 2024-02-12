import { FrameRequest, getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Match, MATCH_EXPIRY } from "@/app/types";
import { kv } from "@vercel/kv";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const matchId = req.query.id as string | undefined;
    if (!matchId) {
        return res.status(400).json({ error: 'Missing match ID' });
    }

    let match: Match | null;
    try {
        match = await kv.hgetall(`match:${matchId}`);
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to retrieve match' });
    }

    if (match.attestationUID) {
        return res.status(400).json({ error: 'Match already attested' });
    }

    const body: FrameRequest = req.body;
    const { isValid, message } = await getFrameMessage(body, {
        neynarApiKey: process.env.NEYNAR_API_KEY,
    });

    if (!isValid) {
        return res.status(400).json({ error: 'Invalid frame message' });
    }

    if (!message.input) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    // if (!liked || !recasted) {
    //     return res.json(
    //         getFrameHtmlResponse({
    //             image: `${process.env["HOST"]}/api/image?id=${matchId}&likeAndRecastRequired=true`,
    //         })
    //     )
    // }

    const winners = message.input.trim().split(',').map(Number).filter(n => !isNaN(n));
    if (winners.length < 1) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    if (match.created_at + MATCH_EXPIRY < Date.now()) {
        return res.status(410).json({ error: 'Match expired' });
    }

    const winnersIds = winners.map(i => match?.users[i - 1]);
    if (String(message.interactor.fid) !== match.referee) {
        return res.json(getFrameHtmlResponse({
            image: `${process.env.HOST}/api/image?id=${matchId}&interactorIsNotReferee=true`,
        }));
    }

    const refereeAddress = message.interactor.verified_accounts[0];
    if (!refereeAddress) {
        return res.status(400).json({ error: 'Referee must connect wallet to the farcaster' });
    }

    const schemaEncoder = new SchemaEncoder("string id,string title,string[] tags,string referee,string[] players,string[] winners");
    const encodedData = schemaEncoder.encodeData([
        { name: "id", value: match.id, type: "string" },
        { name: "title", value: match.title, type: "string" },
        { name: "tags", value: [], type: "string[]" }, // TODO: Add tags to match
        { name: "referee", value: match.referee, type: "string" },
        { name: "players", value: match.users, type: "string[]" },
        { name: "winners", value: winnersIds, type: "string[]" }, // Use calculated winnersIds
    ]);

    try {
        await kv.hset(`attestJob:${matchId}`, { id: matchId, data: encodedData, referee: refereeAddress });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to save attestation' });
    }

    return res.json(getFrameHtmlResponse({
        image: `${process.env.HOST}/api/image?id=${matchId}&resultsAreBeingAttested=true`,
    }));
}
