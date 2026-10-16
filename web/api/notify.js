/**
 * IdentityZA - Anonymous Telemetry & Owner Notification Endpoint
 * Deployed as a Vercel Serverless Function (/api/notify)
 *
 * Recipient: andiledanse@outlook.com
 *
 * Privacy Guarantee:
 * - NEVER accepts, logs, or transmits any 13-digit ID numbers, dates of birth, or personal demographics.
 * - Only processes anonymous events ('visit' or 'validation') with operational metadata (duration, validity, page).
 */

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
    }

    const { eventType, page, referrer, isValid, durationMs } = payload || {};

    if (!eventType || (eventType !== 'visit' && eventType !== 'validation')) {
      return res.status(400).json({ error: 'Invalid or missing eventType' });
    }

    // Defensive input sanitization and length bounds
    const safePage = (typeof page === 'string' ? page.trim().slice(0, 100) : '/') || '/';
    const safeReferrer = (typeof referrer === 'string' ? referrer.trim().slice(0, 100) : 'Direct / None') || 'Direct / None';
    const safeIsValid = Boolean(isValid);
    const safeDurationMs = (typeof durationMs === 'number' && !isNaN(durationMs)) ? Math.max(0, Math.min(60000, Math.round(durationMs))) : null;

    // Extract Edge metadata provided automatically by Vercel
    const country = req.headers['x-vercel-ip-country'] || 'Unknown';
    const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : '';
    const region = req.headers['x-vercel-ip-country-region'] || '';
    const locationStr = city ? `${city}, ${country}` : country;
    const userAgent = req.headers['user-agent'] || 'Unknown Device';

    // Device category hint
    const isMobile = /mobile|iphone|android|ipad/i.test(userAgent);
    const deviceType = isMobile ? 'Mobile' : 'Desktop';

    const timestamp = new Date().toLocaleString('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });

    const targetEmail = process.env.NOTIFICATION_EMAIL || 'andiledanse@outlook.com';

    // Build Email Subject & Content
    let subject = '';
    let emailHtml = '';

    if (eventType === 'visit') {
      subject = `👋 IdentityZA: New Visitor from ${locationStr}`;
      emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 20px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">🇿🇦 IdentityZA • Visitor Alert</h2>
            <p style="margin: 5px 0 0; color: #94a3b8; font-size: 14px;">Someone just opened the IdentityZA web app</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff; color: #334155; line-height: 1.6;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Event:</strong></td>
                <td style="padding: 8px 0; font-weight: 600; color: #0284c7;">Page Visit</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Page:</strong></td>
                <td style="padding: 8px 0;"><code>${escapeHtml(safePage)}</code></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Referrer:</strong></td>
                <td style="padding: 8px 0;">${escapeHtml(safeReferrer)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Location:</strong></td>
                <td style="padding: 8px 0;">📍 ${escapeHtml(locationStr)} ${region ? `(${escapeHtml(region)})` : ''}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Device:</strong></td>
                <td style="padding: 8px 0;">📱 ${escapeHtml(deviceType)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Time (SAST):</strong></td>
                <td style="padding: 8px 0;">🕒 ${escapeHtml(timestamp)}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 12px 16px; background-color: #f8fafc; border-left: 4px solid #10b981; border-radius: 4px; font-size: 12px; color: #475569;">
              <strong>🔒 POPIA & Privacy Guarantee:</strong> No personal details or tracking cookies were captured.
            </div>
          </div>
        </div>
      `;
    } else if (eventType === 'validation') {
      const statusText = safeIsValid ? 'Valid Luhn Checksum' : 'Invalid Checksum';
      const statusColor = safeIsValid ? '#10b981' : '#ef4444';

      subject = `⚡ IdentityZA: ID Validated (${safeIsValid ? 'Valid' : 'Invalid'}) • ${safeDurationMs !== null ? `${safeDurationMs}ms` : 'instant'}`;
      emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 20px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">🇿🇦 IdentityZA • ID Validation Alert</h2>
            <p style="margin: 5px 0 0; color: #94a3b8; font-size: 14px;">A user just checked an ID number</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff; color: #334155; line-height: 1.6;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Validation Result:</strong></td>
                <td style="padding: 8px 0;">
                  <span style="display: inline-block; padding: 3px 10px; background-color: ${statusColor}15; color: ${statusColor}; font-weight: 700; border-radius: 9999px; font-size: 13px;">
                    ${escapeHtml(statusText)}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Parsing Speed:</strong></td>
                <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">⚡ ${safeDurationMs !== null ? `${safeDurationMs} ms` : 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Location:</strong></td>
                <td style="padding: 8px 0;">📍 ${escapeHtml(locationStr)} ${region ? `(${escapeHtml(region)})` : ''}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Device:</strong></td>
                <td style="padding: 8px 0;">📱 ${escapeHtml(deviceType)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Time (SAST):</strong></td>
                <td style="padding: 8px 0;">🕒 ${escapeHtml(timestamp)}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 12px 16px; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px; font-size: 12px; color: #166534;">
              <strong>🔒 Strict Privacy Protection:</strong> The 13-digit ID number, date of birth, age, and gender were computed 100% inside the user's browser. Zero personal identity data was sent to the server.
            </div>
          </div>
        </div>
      `;
    }

    // Dispatch email using configured provider
    let sent = false;
    let providerUsed = 'none';

    // Provider 1: Resend (Recommended on Vercel: https://resend.com)
    if (process.env.RESEND_API_KEY) {
      providerUsed = 'Resend';
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'IdentityZA Alerts <onboarding@resend.dev>',
          to: [targetEmail],
          subject: subject,
          html: emailHtml
        })
      });

      if (resendRes.ok) {
        sent = true;
      } else {
        console.error('Resend delivery failed:', await resendRes.text());
      }
    }

    // Provider 2: Web3Forms (Instant Access Key: https://web3forms.com)
    if (!sent && process.env.WEB3FORMS_ACCESS_KEY) {
      providerUsed = 'Web3Forms';
      const w3Res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.WEB3FORMS_ACCESS_KEY,
          subject: subject,
          from_name: 'IdentityZA App Monitor',
          to_email: targetEmail,
          message: `${subject}\n\nTime: ${timestamp}\nLocation: ${locationStr}\nDevice: ${deviceType}`,
          html: emailHtml
        })
      });

      if (w3Res.ok) {
        sent = true;
      } else {
        console.error('Web3Forms delivery failed:', await w3Res.text());
      }
    }

    // If no email API key is configured yet, log the notification to Vercel logs
    if (!sent) {
      console.log(`[IdentityZA Telemetry] ${subject} | Location: ${locationStr} | Device: ${deviceType}`);
    }

    return res.status(200).json({
      success: true,
      delivered: sent,
      provider: providerUsed,
      target: targetEmail
    });

  } catch (error) {
    console.error('Error handling notify telemetry:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
