import { api } from "./api";

/** GET /settings */
export const getSettings = async (): Promise<{ currency_code: string }> => {
  const res = await axios.get("/settings");
  return res.data;
};

/** PUT /settings/currency */
export const updateCurrency = async (
  currencyCode: "INR" | "USD" | "AED"
): Promise<{ success: boolean; currency_code: string }> => {
  const res = await axios.put("/settings/currency", { currency_code: currencyCode });
  return res.data;
};