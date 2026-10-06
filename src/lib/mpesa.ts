type MpesaConfig = {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passkey: string;
  callbackUrl: string;
  baseUrl: string;
};

export type StkPushInput = {
  amount: number;
  phone: string;
  accountReference: string;
  transactionDesc: string;
};

export type StkPushResult = {
  merchantRequestId: string;
  checkoutRequestId: string;
  customerMessage?: string;
  responseCode?: string;
  responseDescription?: string;
};

function getConfig(): MpesaConfig | null {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  if (!consumerKey || !consumerSecret || !shortCode || !passkey || !callbackUrl) {
    return null;
  }

  const baseUrl =
    process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  return { consumerKey, consumerSecret, shortCode, passkey, callbackUrl, baseUrl };
}

export function isMpesaConfigured(): boolean {
  return getConfig() !== null;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\\D/g, '');

  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
  if (digits.length === 9 && digits.startsWith('7')) return '254' + digits;

  throw new Error('Invalid Kenyan M-Pesa phone number');
}

function mpesaTimestamp(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}${values.second}`;
}

async function getAccessToken(config: MpesaConfig): Promise<string> {
  const credentials = Buffer.from(
    `${config.consumerKey}:${config.consumerSecret}`,
  ).toString('base64');

  const response = await fetch(
    `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
      cache: 'no-store',
    },
  );

  const body = (await response.json()) as { access_token?: string; errorMessage?: string };

  if (!response.ok || !body.access_token) {
    throw new Error(body.errorMessage || `M-Pesa authorization failed (${response.status})`);
  }

  return body.access_token;
}

export async function initiateStkPush(input: StkPushInput): Promise<StkPushResult> {
  const config = getConfig();

  if (!config) {
    throw new Error('M-Pesa STK Push is not configured');
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('M-Pesa amount must be greater than zero');
  }

  const amount = Math.round(input.amount);
  const phone = normalizePhone(input.phone);
  const timestamp = mpesaTimestamp();
  const password = Buffer.from(
    `${config.shortCode}${config.passkey}${timestamp}`,
  ).toString('base64');

  const accessToken = await getAccessToken(config);

  const response = await fetch(
    `${config.baseUrl}/mpesa/stkpush/v1/processrequest`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: config.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: config.shortCode,
        PhoneNumber: phone,
        CallBackURL: config.callbackUrl,
        AccountReference: input.accountReference.slice(0, 12),
        TransactionDesc: input.transactionDesc.slice(0, 13),
      }),
      cache: 'no-store',
    },
  );

  const body = (await response.json()) as {
    ResponseCode?: string;
    ResponseDescription?: string;
    CustomerMessage?: string;
    MerchantRequestID?: string;
    CheckoutRequestID?: string;
  };

  if (!response.ok || body.ResponseCode !== '0' || !body.MerchantRequestID || !body.CheckoutRequestID) {
    throw new Error(
      body.ResponseDescription ||
        body.CustomerMessage ||
        `M-Pesa STK Push failed (${response.status})`,
    );
  }

  return {
    merchantRequestId: body.MerchantRequestID,
    checkoutRequestId: body.CheckoutRequestID,
    customerMessage: body.CustomerMessage,
    responseCode: body.ResponseCode,
    responseDescription: body.ResponseDescription,
  };
}


export type StkQueryResult = {
  responseCode?: string;
  responseDescription?: string;
  resultCode?: string;
  resultDescription?: string;
};

export async function queryStkPush(checkoutRequestId: string): Promise<StkQueryResult> {
  const config = getConfig();

  if (!config) {
    throw new Error("M-Pesa STK Push is not configured");
  }

  if (!checkoutRequestId.trim()) {
    throw new Error("Checkout request ID is required");
  }

  const timestamp = mpesaTimestamp();
  const password = Buffer.from(
    `${config.shortCode}${config.passkey}${timestamp}`,
  ).toString("base64");

  const accessToken = await getAccessToken(config);

  const response = await fetch(
    `${config.baseUrl}/mpesa/stkpushquery/v1/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: config.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
      cache: "no-store",
    },
  );

  const body = (await response.json()) as {
    ResponseCode?: string;
    ResponseDescription?: string;
    ResultCode?: string;
    ResultDesc?: string;
  };

  if (!response.ok) {
    throw new Error(
      body.ResponseDescription || `M-Pesa STK query failed (${response.status})`,
    );
  }

  return {
    responseCode: body.ResponseCode,
    responseDescription: body.ResponseDescription,
    resultCode: body.ResultCode,
    resultDescription: body.ResultDesc,
  };
}
