import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import { Match } from "@/app/types";
import { kv } from "@vercel/kv";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const matchId = req.query["id"];

    if (!matchId) {
      return res.status(400).send("Missing match ID");
    }

    let match: Match | null = await kv.hgetall(`match:${matchId}`);

    if (!match) {
      return res.status(400).send("Missing match ID");
    }

    const attestationUID = req.query["attestationUID"];
    const likeAndRecastRequired = req.query["likeAndRecastRequired"];
    const refereeAttestationSuccess = req.query["refereeAttestationSuccess"];

    const svg = await satori(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#f4f4f4",
          padding: 12,
          lineHeight: 1.2,
          fontSize: 24,
          color: "lightgray",
        }}
      >
        <h1 style={{ color: "black", fontSize: 32 }}>Match Details</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            color: "black",
          }}
        >
          <h2>Title: {match.title}</h2>
          <h2>Referee: {match.referee}</h2>
          <h2>Participants:</h2>
          {match.users.map((user, index) => (
            <p key={index}>{index + 1 + ". " + user}</p>
          ))}
          <h2>Winners:</h2>
          <p>
            {match.winners.length > 0
              ? match.winners.join(", ")
              : "No winners yet..."}
          </p>
          <h2>Start Date:</h2>
          <p>{new Date(Number(match.created_at)).toLocaleString()}</p>
        </div>
      </div>,
      {
        width: 600,
        height: 600,
        fonts: [
          {
            data: fontData,
            name: "Roboto",
            style: "normal",
            weight: 400,
          },
        ],
      }
    );

    // Convert SVG to PNG using Sharp
    const pngBuffer = await sharp(Buffer.from(svg)).toFormat("png").toBuffer();

    // Set the content type to PNG and send the response
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "max-age=10");
    res.send(pngBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating image");
  }
}
