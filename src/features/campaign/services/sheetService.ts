import { SHEET_WEBHOOK_URL } from '../model/config';

export interface LeadPayload {
  action: 'register' | 'spin' | 'whatsapp_click' | 'order_submit' | 'order_skip';
  fullName?: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  dob?: string;
  province?: string;
  referralCode?: string;
  targetTierId?: string;
  rewardWon?: string;
  cartSubtotal?: number;
  cartPayable?: number;
  quantities?: Record<string, number>;
}

export async function sendLeadToGoogleSheet(payload: LeadPayload): Promise<boolean> {
  const url = SHEET_WEBHOOK_URL?.trim();
  if (!url) {
    console.log('[SheetService] Webhook URL not set, skipping remote logging.', payload);
    return false;
  }

  try {
    const formData = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });

    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    return true;
  } catch (err) {
    console.warn('[SheetService] Failed to send lead to Google Sheet:', err);
    return false;
  }
}
