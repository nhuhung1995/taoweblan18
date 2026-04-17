const SB_BASE = "https://bb-entry.itc.softbank.jp";

function toTimestamp14() {
  return new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function getAgency(individualCode) {
  const upstream = await fetch(`${SB_BASE}/aqw-api/composition/individualCd/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ individualCd: String(individualCode), uuid: "" })
  });
  const data = await parseJsonSafe(upstream);
  if (!upstream.ok) {
    throw new Error(`decision failed: ${upstream.status}`);
  }
  const agency = data?.agencyProperty;
  if (!agency?.nanoId) {
    throw new Error("decision returned invalid agencyProperty");
  }
  return agency;
}

export function buildReqBbapiBase(agency) {
  return {
    customerId: null,
    Auth: { agency: "ACQ-WEB", accountId: agency.nanoId, timestamp: toTimestamp14() },
    StoreInfo: {
      carrierCode: agency.carrierCode,
      agencyCode: agency.agencyCode,
      brancheCode: agency.brancheCode,
      campaignCode: agency.campaignCode,
      salesShopCode: agency.sbmOrdcstmCd
    },
    entrySheetNumber: ""
  };
}

export async function proxyToSoftbankJson(path, payload) {
  const upstream = await fetch(`${SB_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await parseJsonSafe(upstream);
  return { status: upstream.status, data };
}
