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

    const svg = await satori(
      <div
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "f4f4f4",
          padding: 12,
          lineHeight: 1.2,
          fontSize: 24,
          color: "lightgray",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ textAlign: "center" }}>{match.title}</h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          ></div>
          {match.users.map((user, index) => {
            return (
              <div style={{ marginTop: 6 }}>{index + 1 + ". " + user}</div>
            );
          })}
        </div>
      </div>,
      {
        width: 600,
        height: 400,
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
