import type { NextApiRequest, NextApiResponse } from 'next';
import { AttestationJob, Match, MATCH_EXPIRY } from "@/app/types";
import { kv } from "@vercel/kv";
import { ethers } from "ethers";
import { EAS } from "@ethereum-attestation-service/eas-sdk";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // get all attest jobs from the KV
    const attestJobKeys = await kv.keys("attestJob:*");

    if (!attestJobKeys) {
        return res.status(200).json({ message: "No attest jobs" });
    }

    const attestJobs = (await Promise.all(
        attestJobKeys.map(async (key) => {
            return await kv.hgetall(key);
        })
    )).filter(job => job !== null) as AttestationJob[];

    const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

    // Initialize the sdk with the address of the EAS Schema contract address
    const eas = new EAS(EASContractAddress);

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('Private key is missing');
    }

    const signer: ethers.Signer = new ethers.Wallet(privateKey, provider);

    eas.connect(signer as any);

    const schemaUID = "0xb790eba667e82b03fa40ddaa62f23d6fc3256cbe464b3b9baf4e2d1c9c31074b";

    Promise.all(attestJobs.map(async (job) => {
        let match: Match | null = null;
        try {
            match = await kv.hgetall(`match:${job.id}`);
        } catch (error) {
            console.error('Failed to retrieve match');
        }

        if (!match || match.attestationUID) {
            try {
                await kv.hdel(`attestJob:${job.id}`);
            } catch {
                console.error('Failed to save attestation UID');
            }
            return;
        }

        try {
            const tx = await eas.attest({
                schema: schemaUID,
                data: {
                    recipient: job.referee,
                    revocable: true,
                    data: job.encodedData,
                },
            });

            const newAttestationUID = await tx.wait();

            try {
                await kv.hset(`match:${job.id}`, { attestationUID: newAttestationUID });
                await kv.persist(`match:${job.id}`);
                await kv.hdel(`attestJob:${job.id}`);
            } catch {
                console.error('Failed to save attestation UID');
            }
        } catch {
            console.error('Failed to attest');
        }
    })).then(() => {
        res.status(200).json({ message: "Jobs finished" });
    });
}