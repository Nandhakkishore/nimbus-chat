export interface CountryCode {
  code: string;       // e.g. 'US'
  name: string;       // e.g. 'United States'
  dialCode: string;   // e.g. '+1'
  flag: string;       // e.g. '🇺🇸'
  minDigits: number;  // min number digits
  maxDigits: number;  // max number digits
}

export const GLOBAL_COUNTRIES: CountryCode[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', minDigits: 10, maxDigits: 10 },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', minDigits: 10, maxDigits: 11 },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', minDigits: 10, maxDigits: 10 },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', minDigits: 10, maxDigits: 10 },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', minDigits: 9, maxDigits: 9 },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', minDigits: 10, maxDigits: 11 },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', minDigits: 9, maxDigits: 9 },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', minDigits: 10, maxDigits: 10 },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', minDigits: 10, maxDigits: 10 },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', minDigits: 11, maxDigits: 11 },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', minDigits: 9, maxDigits: 9 },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', minDigits: 9, maxDigits: 9 }
];

export function validatePhoneNumber(digitsOnly: string, country: CountryCode): boolean {
  const len = digitsOnly.replace(/\D/g, '').length;
  return len >= country.minDigits && len <= country.maxDigits;
}
