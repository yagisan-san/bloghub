import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "BlogHub - 散らばった発信を、ひとつのホームに。";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // ロゴ画像をBase64に変換
  const logoData = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  // 日本語フォント（Noto Sans JP）をGoogle Fontsから取得
  let fontData: ArrayBuffer | null = null;
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent("BlogHub散らばった発信をひとつのホームに。")}`
    ).then((r) => r.text());
    const fontUrl = css.match(/src: url\((.+?)\) format/)?.[1];
    if (fontUrl) {
      fontData = await fetch(fontUrl).then((r) => r.arrayBuffer());
    }
  } catch {
    // フォント取得失敗時はシステムフォントにフォールバック
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e2340 0%, #2d3a7a 50%, #5b7cf7 100%)",
          position: "relative",
          fontFamily: fontData ? "Noto Sans JP" : "-apple-system, sans-serif",
        }}
      >
        {/* 背景の装飾円 */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(91, 124, 247, 0.2)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(196, 181, 253, 0.1)",
            display: "flex",
          }}
        />

        {/* メインコンテンツ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            zIndex: 1,
          }}
        >
          {/* ロゴ + タイトル */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              width={120}
              height={120}
              alt="BlogHub logo"
              style={{ borderRadius: 24 }}
            />
            <span
              style={{
                fontSize: 96,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-2px",
              }}
            >
              BlogHub
            </span>
          </div>

          {/* タグライン */}
          <div
            style={{
              fontSize: 36,
              color: "rgba(255,255,255,0.85)",
              fontWeight: 700,
              letterSpacing: "1px",
            }}
          >
            散らばった発信を、ひとつのホームに。
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.45)",
              marginTop: 8,
            }}
          >
            bloghub-sigma.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? {
            fonts: [
              {
                name: "Noto Sans JP",
                data: fontData,
                style: "normal",
                weight: 700,
              },
            ],
          }
        : {}),
    }
  );
}
