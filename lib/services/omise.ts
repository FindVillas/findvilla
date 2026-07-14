const endpoint = "https://api.omise.co";

function authHeader() {
  const key = process.env.OMISE_SECRET_KEY;
  if (!key || key.includes("placeholder")) throw new Error("Omise test credentials are not configured");
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export async function retrieveOmiseCharge(chargeId: string) {
  if (!/^chrg_(test_)?[a-zA-Z0-9]+$/.test(chargeId)) throw new Error("Invalid Omise charge ID");
  const response = await fetch(`${endpoint}/charges/${chargeId}`, { headers: { Authorization: authHeader() }, cache: "no-store" });
  if (!response.ok) throw new Error(`Omise returned ${response.status}`);
  return response.json() as Promise<{id:string;paid:boolean;status:string;amount:number;currency:string;livemode:boolean;metadata?:Record<string,string>}>;
}

export async function createOmisePromptPaySource(amountThbMinor: number) {
  const body = new URLSearchParams({ amount: String(amountThbMinor), currency: "THB", type: "promptpay" });
  const response = await fetch(`${endpoint}/sources`, { method: "POST", headers: { Authorization: authHeader(), "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new Error(`Omise returned ${response.status}`);
  return response.json();
}

type OmiseCharge = { id:string; paid:boolean; status:string; amount:number; currency:string; livemode:boolean; authorize_uri?:string; source?:{id?:string;scannable_code?:{image?:{download_uri?:string}}}; failure_code?:string; failure_message?:string };

export async function createOmiseCharge(input: { amountThbMinor:number; cardToken?:string; sourceId?:string; returnUri:string; metadata:Record<string,string> }) {
  if ((!input.cardToken && !input.sourceId) || (input.cardToken && input.sourceId)) throw new Error("Exactly one payment instrument is required");
  const body = new URLSearchParams({ amount:String(input.amountThbMinor), currency:"THB", return_uri:input.returnUri });
  if (input.cardToken) body.set("card", input.cardToken);
  if (input.sourceId) body.set("source", input.sourceId);
  Object.entries(input.metadata).forEach(([key,value]) => body.set(`metadata[${key}]`, value));
  const response = await fetch(`${endpoint}/charges`, { method:"POST", headers:{ Authorization:authHeader(), "Content-Type":"application/x-www-form-urlencoded" }, body, cache:"no-store" });
  const result = await response.json() as OmiseCharge & {message?:string};
  if (!response.ok) throw new Error(result.message ?? `Omise returned ${response.status}`);
  return result;
}
