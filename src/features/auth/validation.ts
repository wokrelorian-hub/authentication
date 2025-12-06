"use server";

interface ZeroBounceResponse {
  status: "valid" | "invalid" | "catch-all" | "unknown" | "spamtrap" | "abuse" | "do_not_mail";
  sub_status: string;
}

export async function validateEmailSecurity(email: string, ipAddress: string = "") {
  const apiKey = process.env.ZEROBOUNCE_API_KEY;

  if (!apiKey) return { valid: true };

  try {
    const url = `https://api.zerobounce.net/v2/validate?api_key=${apiKey}&email=${encodeURIComponent(email)}&ip_address=${ipAddress}`;
    const response = await fetch(url);
    const data: ZeroBounceResponse = await response.json();

    if (data.status === "invalid") {
      return { valid: false, error: "This email address does not exist." };
    }

    if (data.status === "spamtrap" || data.status === "abuse" || data.status === "do_not_mail") {
      return { valid: false, error: "This email is flagged for security reasons." };
    }

    if (data.sub_status === "disposable" || data.sub_status === "toxic") {
      return { valid: false, error: "Please use a permanent email address." };
    }

    return { valid: true };

  } catch {
    // Fail open silently. No console logs.
    return { valid: true }; 
  }
}