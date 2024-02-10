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
        <div
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "black",
            marginBottom: 20,
          }}
        >
          Match Details
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            color: "black",
            width: "fit-content",
            maxWidth: "90%",
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 4, fontWeight: 700 }}>
            Title
          </div>
          <div style={{ fontSize: 24, marginBottom: 12 }}>{match.title}</div>

          <div style={{ fontSize: 20, marginBottom: 4, fontWeight: 700 }}>
            Referee:
          </div>
          <div style={{ fontSize: 24, marginBottom: 12 }}>{match.referee}</div>

          <div style={{ fontSize: 20, marginBottom: 4, fontWeight: 700 }}>
            Participants:
          </div>
          {match.users.map((user, index) => (
            <div key={index} style={{ fontSize: 24, marginBottom: 12 }}>
              {index + 1 + ". " + user}
            </div>
          ))}

          <div style={{ fontSize: 20, marginBottom: 4, fontWeight: 700 }}>
            Winners:
          </div>
          <div style={{ fontSize: 24, marginBottom: 12 }}>
            {match.winners.length > 0
              ? match.winners.join(", ")
              : "No winners yet..."}
          </div>

          <div style={{ fontSize: 20, marginBottom: 4, fontWeight: 700 }}>
            Start Date:
          </div>
          <div style={{ fontSize: 24, marginBottom: 12 }}>
            {new Date(Number(match.created_at)).toLocaleString()}
          </div>
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
