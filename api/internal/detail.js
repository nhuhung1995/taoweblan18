import { ADDRESS_DETAIL_BY_CODE, SNAPSHOT_VERSION, validateRequired } from "./_data.js";

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

function genericLatLon(addressCode) {
  const n = String(addressCode)
    .split("")
    .reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 17);
  const lat = 35.0 + ((n % 9000) / 100000);
  const lon = 139.0 + (((n * 7) % 9000) / 100000);
  return { latitude: Number(lat.toFixed(6)), longitude: Number(lon.toFixed(6)) };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const input = req.body || {};
  const check = validateRequired(input, ["requestKbn", "addressCode"]);
  if (!check.ok) {
    res.status(400).json({ code: "E00001", missing: check.missing });
    return;
  }

  const meta = ADDRESS_DETAIL_BY_CODE[input.addressCode] || null;
  const latlon = meta
    ? { latitude: meta.latitude, longitude: meta.longitude }
    : genericLatLon(input.addressCode);
  const banchiCandidates = meta
    ? (meta.banchi || []).map((b) => (typeof b === "string" ? { value: b, go: [] } : { value: b.value, go: b.go || [] }))
    : genericBanchiCandidates(input.addressCode);

  res.status(200).json({
    requestKbn: input.requestKbn,
    addressCode: input.addressCode,
    latitude: latlon.latitude,
    longitude: latlon.longitude,
    banchiCandidates,
    source: meta ? "snapshot" : "generic",
    detailResolved: true,
    snapshotVersion: SNAPSHOT_VERSION
  });
}
