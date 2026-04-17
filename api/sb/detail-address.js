import { buildReqBbapiBase, getAgency, proxyToSoftbankJson } from "./_agency.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { individualCode, requestKbn, addressCode, choume, banchi, go } = req.body || {};
    if (!individualCode || !requestKbn || !addressCode) {
      res.status(400).json({ error: "individualCode, requestKbn, addressCode are required" });
      return;
    }

    const ag = await getAgency(individualCode);

    const payload = {
      ReqBbapiBase: buildReqBbapiBase(ag),
      requestKbn: String(requestKbn),
      addressCode: String(addressCode),
      choume: choume ?? undefined,
      banchi: banchi ?? undefined,
      go: go ?? undefined
    };

    const { status, data } = await proxyToSoftbankJson("/bff/detailAddressSearch", payload);
    res.status(status).json(data);
  } catch (error) {
    res.status(500).json({ error: "detail-address proxy failed", detail: String(error?.message || error) });
  }
}
