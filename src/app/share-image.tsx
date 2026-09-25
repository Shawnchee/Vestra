import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Vestra — a bull, a bear, and the same PreStocks evidence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function renderShareImage() {
  const logo = await readFile(join(process.cwd(), "public/images/vestra-mark-v12.png"));
  const logoData = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#0c0f0e",
          color: "#f0f4f1",
          fontFamily: "Arial, sans-serif",
          padding: "58px 68px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.32,
            backgroundImage:
              "linear-gradient(rgba(189,242,60,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(189,242,60,.055) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div style={{ display: "flex", position: "relative", width: "100%", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* The image renderer does not support next/image; use the embedded mark directly. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoData} style={{ width: 42, height: 42 }} alt="" />
            <span style={{ fontSize: 27, fontWeight: 700, letterSpacing: 1.2 }}>vestra</span>
            <span
              style={{
                display: "flex",
                marginLeft: 15,
                padding: "8px 13px",
                border: "1px solid #344138",
                borderRadius: 999,
                color: "#c5d1c8",
                fontSize: 14,
                letterSpacing: 1.1,
              }}
            >
              PRESTOCKS · SOLANA
            </span>
          </div>

          <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 66 }}>
            <div style={{ display: "flex", flex: 1, flexDirection: "column", paddingTop: 24 }}>
              <div style={{ color: "#bdf23c", fontSize: 15, fontWeight: 700, letterSpacing: 2.2 }}>
                COMPANY RESEARCH, WITH BOTH SIDES SHOWN
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 20,
                  fontSize: 65,
                  fontWeight: 700,
                  letterSpacing: -2.3,
                  lineHeight: 1.05,
                }}
              >
                <span>A bull.</span>
                <span>A bear.</span>
                <span style={{ color: "#bdf23c" }}>Same evidence.</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", marginTop: 22, color: "#a0aaa4", fontSize: 21, lineHeight: 1.45 }}>
                <span>Company headlines, PreStocks prices,</span>
                <span> and Solana market context in one desk.</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                width: 365,
                flexDirection: "column",
                padding: 24,
                border: "1px solid #29332d",
                borderRadius: 18,
                backgroundColor: "#121715",
              }}
            >
              <div style={{ color: "#7d8981", fontSize: 13, fontWeight: 700, letterSpacing: 1.7 }}>
                THE DEBATE ROOM
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginTop: 24 }}>
                <span
                  style={{
                    display: "flex",
                    width: 36,
                    height: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    backgroundColor: "#203127",
                    color: "#91dfa9",
                    fontSize: 21,
                    fontWeight: 700,
                  }}
                >
                  +
                </span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "#91dfa9", fontSize: 12, fontWeight: 700, letterSpacing: 1.2 }}>BULL</span>
                  <span style={{ marginTop: 4, fontSize: 19 }}>The upside case</span>
                </div>
              </div>
              <div style={{ height: 1, marginTop: 17, backgroundColor: "#29332d" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginTop: 17 }}>
                <span
                  style={{
                    display: "flex",
                    width: 36,
                    height: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    backgroundColor: "#30201f",
                    color: "#e6a09a",
                    fontSize: 21,
                    fontWeight: 700,
                  }}
                >
                  −
                </span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "#e6a09a", fontSize: 12, fontWeight: 700, letterSpacing: 1.2 }}>BEAR</span>
                  <span style={{ marginTop: 4, fontSize: 19 }}>The risk case</span>
                </div>
              </div>
              <div style={{ height: 1, marginTop: 17, backgroundColor: "#29332d" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginTop: 17 }}>
                <span style={{ color: "#bdf23c", fontSize: 17, fontWeight: 700, letterSpacing: 1 }}>EDITOR</span>
                <span style={{ color: "#a0aaa4", fontSize: 16 }}>Agreement · disputes · unknowns</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #29332d", paddingTop: 17, color: "#7d8981", fontSize: 14 }}>
            <span>Source-linked analysis · Pool-only market replay · No trading signals</span>
            <span style={{ color: "#bdf23c", fontWeight: 700, letterSpacing: 1.1 }}>VESTRA</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
