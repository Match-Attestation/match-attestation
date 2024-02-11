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

    let refereeAddress = interactor.verified_accounts[0];
    if (!refereeAddress) {
        return res.status(497).json({ error: 'Referee must connect wallet to the farcaster' });
    }
    
    const schemaEncoder = new SchemaEncoder("string id,string title,string[] tags,string referee,string[] players,string[] winners");
    const encodedData = schemaEncoder.encodeData([
        { name: "id", value: match.id, type: "string" },
	    { name: "title", value: match.title, type: "string" },
	    { name: "tags", value: [], type: "string[]" },
	    { name: "referee", value: match.referee, type: "string" },
	    { name: "players", value: match.users, type: "string[]" },
	    { name: "winners", value: match.winners, type: "string[]" },
    ]);

    try {
        kv.hset(`attestJob:${matchId}`, { data: encodedData, referee: refereeAddress });
    } catch {
        return res.status(588).json({ error: 'Failed to save attestation' });
    }

    return res.json(getFrameHtmlResponse({
        image: `${process.env["HOST"]}/api/image?id=${matchId}&resultsAreBeingAttested=true`,
    }));
}
