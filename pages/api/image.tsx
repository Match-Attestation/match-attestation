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
    const interactorIsNotReferee = req.query["interactorIsNotReferee"];
    const baseUrl = req.headers.host;

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
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: 20,
            marginBottom: 20,
            backgroundColor: "#FFFFFF",
            padding: "12px 24px",
            width: "100%",
            boxShadow: "rgba(0, 0, 0, 0.15) 0px 2px 8px",
          }}
        >
          <div style={{ fontSize: 16 }}>Match Title</div>
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
              fontSize: 24,
              borderRadius: 20,
              marginBottom: 20,
              backgroundColor: "#FFFFFF",
              padding: "12px 24px",
              width: "48.335%",

              boxShadow: "rgba(0, 0, 0, 0.15) 0px 2px 8px",
            }}
          >
            <div
              style={{ fontSize: 16, display: "flex", alignItems: "center" }}
            >
              <img
                src={"https://" + baseUrl + "/emojis/ninja.png"}
                width={18}
                height={18}
                style={{ marginRight: 6 }}
              />
              <div>Participants</div>
            </div>
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
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  maxWidth: "100%",
                  textOverflow: "ellipsis",
                }}
              >
                {index + 1 + ". " + user}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "48.335%",
              marginLeft: "3.333%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 24,
                borderRadius: 20,
                marginBottom: 20,
                backgroundColor: "#FFFFFF",
                padding: "12px 24px",
                width: "100%",
                boxShadow: "rgba(0, 0, 0, 0.15) 0px 2px 8px",
              }}
            >
              <div
                style={{ fontSize: 16, display: "flex", alignItems: "center" }}
              >
                <img
                  src={"https://" + baseUrl + "/emojis/trophy.png"}
                  width={18}
                  height={18}
                  style={{ marginRight: 6 }}
                />
                <div>Winners</div>
              </div>
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
                backgroundColor: "#FFFFFF",
                padding: "12px 24px",
                width: "100%",
                boxShadow: "rgba(0, 0, 0, 0.15) 0px 2px 8px",
              }}
            >
              <div
                style={{ fontSize: 16, display: "flex", alignItems: "center" }}
              >
                <img
                  src={"https://" + baseUrl + "/emojis/woman-judge.png"}
                  width={18}
                  height={18}
                  style={{ marginRight: 6 }}
                />
                <div>Referee</div>
              </div>
              <div style={{ fontSize: 24, marginTop: 2 }}>{match.referee}</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 24,
                borderRadius: 20,
                marginBottom: 20,
                backgroundColor: "#FFFFFF",
                padding: "12px 24px",
                width: "100%",
                boxShadow: "rgba(0, 0, 0, 0.15) 0px 2px 8px",
              }}
            >
              <div
                style={{ fontSize: 16, display: "flex", alignItems: "center" }}
              >
                <img
                  src={"https://" + baseUrl + "/emojis/stopwatch.png"}
                  width={18}
                  height={18}
                  style={{ marginRight: 6 }}
                />
                <div>Expires</div>
              </div>
              <div style={{ fontSize: 20, marginTop: 4 }}>
                {new Date(Number(match.created_at) + MATCH_EXPIRY)
                  .toUTCString()
                  .slice(5, 22) + " UTC"}
              </div>
            </div>
          </div>
        </div>
        {interactorIsNotReferee && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: 20,
              marginBottom: 20,
              backgroundColor: "#FFFFFF",
              padding: "12px 24px",
              maxWidth: "100%",
              boxShadow: "rgba(0, 0, 0, 0.15) 0px 2px 8px",
              position: "absolute",
              top: 20,
              right: 20,
            }}
          >
            <div style={{ fontSize: 16 }}>Match Title</div>
            <div
              style={{
                fontSize: match.title.length > 80 ? 24 : 32,
                marginTop: 2,
              }}
            >
              You are not referee! Only referee can attest the match
            </div>
          </div>
        )}
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
