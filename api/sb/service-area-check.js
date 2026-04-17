import { buildReqBbapiBase, getAgency, proxyToSoftbankJson } from "./_agency.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { individualCode, ...body } = req.body || {};
    if (!individualCode) {
      res.status(400).json({ error: "individualCode is required" });
      return;
    }
    const reqServiceAreaAcquisition = body?.reqServiceAreaAcquisition;
    const placeAddress = reqServiceAreaAcquisition?.placeAddress;
    if (!body.businessType || !body.channel || !placeAddress?.housingType || !placeAddress?.addressCode) {
      res.status(400).json({ error: "businessType, channel, placeAddress.housingType, placeAddress.addressCode are required" });
      return;
    }

    const ag = await getAgency(individualCode);
    const sanitizedPlaceAddress = { ...(reqServiceAreaAcquisition?.placeAddress || {}) };
    delete sanitizedPlaceAddress.buildingId;
    delete sanitizedPlaceAddress.buildingName;

    const payload = {
      ReqBbapiBase: buildReqBbapiBase(ag),
      ...body,
      reqServiceAreaAcquisition: {
        ...reqServiceAreaAcquisition,
        placeAddress: sanitizedPlaceAddress
      }
    };

    const { status, data } = await proxyToSoftbankJson("/bff/serviceAreaCheck", payload);
    res.status(status).json(data);
  } catch (error) {
    res.status(500).json({ error: "service-area-check proxy failed", detail: String(error?.message || error) });
  }
}
