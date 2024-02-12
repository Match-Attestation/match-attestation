import type { NextApiRequest, NextApiResponse } from 'next';
import { AttestationJob, Match, MATCH_EXPIRY } from "@/app/types";
import { kv } from "@vercel/kv";
import { ethers } from "ethers";
import { EAS } from "@ethereum-attestation-service/eas-sdk";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // get all attest jobs from the KV
    const attestJobKeys = await kv.keys("attestJob:*");

    if (!attestJobKeys.length) {
        return res.status(200).json({ message: "No attest jobs" });
    }

    const attestJobs = (await Promise.all(
        attestJobKeys.map(async (key) => {
            return await kv.hgetall(key);
        })
    )).flatMap((job) => { return job as AttestationJob });

    const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

    // Initialize the sdk with the address of the EAS Schema contract address
    const eas = new EAS(EASContractAddress);

    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
        throw new Error('RPC URL is missing');
    }
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('Private key is missing');
    }

    const signer: ethers.Signer = new ethers.Wallet(privateKey, provider);

    eas.connect(signer);

    const schemaUID = "0xb790eba667e82b03fa40ddaa62f23d6fc3256cbe464b3b9baf4e2d1c9c31074b";

    try {
        await Promise.all(attestJobs.map(async (job) => {
            let match: Match | null = await kv.hgetall(`match:${job.id}`);
    
            if (!match || match.attestationUID) {
                try {
                    await kv.del(`attestJob:${job.id}`);
                } catch {
                    console.error('Failed to delete attest job');
                }
                return;
            }
    
            const tx = await eas.attest({
                schema: schemaUID,
                data: {
                    recipient: job.referee,
                    revocable: true,
                    data: job.encodedData,
                },
            });
    
            const newAttestationUID = await tx.wait();
    
            await kv.hset(`match:${match.id}`, { attestationUID: newAttestationUID });
            await kv.persist(`match:${match.id}`);
            await kv.del(`attestJob:${match.id}`);
        }));

        res.status(200).json({ message: "Finished jobs" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to finish jobs" });
    }
}