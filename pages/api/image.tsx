import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import { MATCH_EXPIRY, Match } from "@/app/types";
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
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#f9fafb",
          padding: 20,
          lineHeight: 1.2,
          fontSize: 24,
          color: "black",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: 20,
            marginBottom: 20,
            backgroundColor: "white",
            padding: "12px 24px",
            width: "100%",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ fontSize: 16 }}>Title</div>
          <div
            style={{
              fontSize: match.title.length > 80 ? 24 : 32,
              marginTop: 2,
            }}
          >
            {match.title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "48.335%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 24,
                borderRadius: 20,
                marginBottom: 20,
                backgroundColor: "white",
                padding: "12px 24px",
                width: "100%",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ fontSize: 16 }}>Winners</div>
              <div style={{ fontSize: 24, marginTop: 4 }}>
                {match.winners.length > 0
                  ? match.winners.join(", ")
                  : "No winners yet..."}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 24,
                borderRadius: 20,
                marginBottom: 20,
                backgroundColor: "white",
                padding: "12px 24px",
                width: "100%",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ fontSize: 16 }}>Referee</div>
              <div style={{ fontSize: 24, marginTop: 4 }}>{match.referee}</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 24,
                borderRadius: 20,
                marginBottom: 20,
                backgroundColor: "white",
                padding: "12px 24px",
                width: "100%",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ fontSize: 16, marginTop: 12 }}>Expires</div>
              <div style={{ fontSize: 20, marginTop: 4 }}>
                {new Date(
                  Number(match.created_at) + MATCH_EXPIRY
                ).toLocaleString()}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 24,
              borderRadius: 20,
              marginBottom: 20,
              backgroundColor: "white",
              padding: "12px 24px",
              width: "48.335%",
              marginLeft: "3.333%",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ fontSize: 16 }}>Participants</div>
            {match.users.map((user, index) => (
              <div
                key={index}
                style={{
                  fontSize:
                    match && match.users.length > 10
                      ? match.users.length > 12
                        ? match.users.length > 14
                          ? 16
                          : 18
                        : 20
                      : 24,
                  marginTop: 4,
                }}
              >
                {index + 1 + ". " + user}
              </div>
            ))}
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
