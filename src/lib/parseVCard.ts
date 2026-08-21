export interface ParsedCard {
  name?: string
  firm?: string
  email?: string
  phone?: string
}

/** Parses a scanned QR payload: vCard text, a mailto:/tel: link, or plain JSON. */
export function parseScannedPayload(raw: string): ParsedCard | null {
  const text = raw.trim()
  if (!text) return null

  if (/^BEGIN:VCARD/i.test(text)) {
    const get = (key: string) => {
      const m = text.match(new RegExp(`^${key}(?:;[^:]*)?:(.*)$`, 'im'))
      return m ? m[1].trim() : undefined
    }
    const fn = get('FN')
    const n = get('N')
    let name = fn
    if (!name && n) {
      const [last, first] = n.split(';')
      name = [first, last].filter(Boolean).join(' ')
    }
    return {
      name,
      firm: get('ORG'),
      email: get('EMAIL'),
      phone: get('TEL'),
    }
  }

  try {
    const json = JSON.parse(text)
    if (json && typeof json === 'object') {
      return {
        name: json.name ?? json.fn,
        firm: json.firm ?? json.org ?? json.company,
        email: json.email,
        phone: json.phone ?? json.tel,
      }
    }
  } catch {
    // not JSON
  }

  const emailMatch = text.match(/^mailto:(.+)$/i) || text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)
  if (emailMatch) {
    return { email: emailMatch[1] ?? emailMatch[0] }
  }

  const telMatch = text.match(/^tel:(.+)$/i)
  if (telMatch) return { phone: telMatch[1] }

  return null
}
