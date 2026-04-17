import { ADDRESS_DETAIL_BY_CODE, SNAPSHOT_VERSION } from "./_data.js";

function toFullWidth(num) {
  return String(num).replace(/[0-9]/g, (d) => String.fromCharCode(d.charCodeAt(0) + 65248));
}

function genericBanchiCandidates(addressCode) {
  const seed = String(addressCode)
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const count = 25 + (seed % 20); // 25..44
  return Array.from({ length: count }, (_, i) => ({ value: toFullWidth(i + 1), go: [] }));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const addressCode = String(req.query?.addressCode || "");
  if (!addressCode) {
    res.status(400).json({ code: "E00001", message: "addressCode is required" });
    return;
  }

  const meta = ADDRESS_DETAIL_BY_CODE[addressCode];
  const banchiCandidates = meta
    ? (meta.banchi || []).map((b) => (typeof b === "string" ? { value: b, go: [] } : { value: b.value, go: b.go || [] }))
    : genericBanchiCandidates(addressCode);

  res.status(200).json({
    addressCode,
    banchiCandidates,
    source: meta ? "snapshot" : "generic",
    snapshotVersion: SNAPSHOT_VERSION
  });
}
