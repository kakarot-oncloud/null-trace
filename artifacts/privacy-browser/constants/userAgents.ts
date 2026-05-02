export interface UserAgentPreset {
  id: string;
  label: string;
  value: string;
}

export const USER_AGENTS: UserAgentPreset[] = [
  {
    id: 'android-chrome',
    label: 'Android Chrome (Default)',
    value:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  },
  {
    id: 'desktop-chrome',
    label: 'Desktop Chrome',
    value:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  },
  {
    id: 'desktop-firefox',
    label: 'Desktop Firefox',
    value:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  },
  {
    id: 'desktop-safari',
    label: 'Desktop Safari',
    value:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  },
  {
    id: 'iphone-safari',
    label: 'iPhone Safari',
    value:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  },
  {
    id: 'android-firefox',
    label: 'Android Firefox',
    value:
      'Mozilla/5.0 (Android 14; Mobile; rv:125.0) Gecko/125.0 Firefox/125.0',
  },
  {
    id: 'googlebot',
    label: 'Googlebot',
    value:
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  },
];

export const COMMON_LANGUAGES = [
  { id: 'en-US', label: 'English (US)' },
  { id: 'en-GB', label: 'English (UK)' },
  { id: 'es-ES', label: 'Spanish (Spain)' },
  { id: 'es-MX', label: 'Spanish (Mexico)' },
  { id: 'fr-FR', label: 'French (France)' },
  { id: 'de-DE', label: 'German (Germany)' },
  { id: 'it-IT', label: 'Italian (Italy)' },
  { id: 'pt-BR', label: 'Portuguese (Brazil)' },
  { id: 'ru-RU', label: 'Russian (Russia)' },
  { id: 'zh-CN', label: 'Chinese Simplified' },
  { id: 'zh-TW', label: 'Chinese Traditional' },
  { id: 'ja-JP', label: 'Japanese (Japan)' },
  { id: 'ko-KR', label: 'Korean (Korea)' },
  { id: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
  { id: 'hi-IN', label: 'Hindi (India)' },
  { id: 'pl-PL', label: 'Polish (Poland)' },
  { id: 'tr-TR', label: 'Turkish (Turkey)' },
  { id: 'nl-NL', label: 'Dutch (Netherlands)' },
];

export const COMMON_TIMEZONES = [
  { id: 'UTC', label: 'UTC' },
  { id: 'America/New_York', label: 'Eastern (New York)' },
  { id: 'America/Chicago', label: 'Central (Chicago)' },
  { id: 'America/Denver', label: 'Mountain (Denver)' },
  { id: 'America/Los_Angeles', label: 'Pacific (Los Angeles)' },
  { id: 'America/Sao_Paulo', label: 'Brasilia (São Paulo)' },
  { id: 'America/Buenos_Aires', label: 'Argentina (Buenos Aires)' },
  { id: 'Europe/London', label: 'GMT (London)' },
  { id: 'Europe/Paris', label: 'CET (Paris)' },
  { id: 'Europe/Berlin', label: 'CET (Berlin)' },
  { id: 'Europe/Moscow', label: 'Moscow' },
  { id: 'Asia/Dubai', label: 'GST (Dubai)' },
  { id: 'Asia/Kolkata', label: 'IST (India)' },
  { id: 'Asia/Bangkok', label: 'ICT (Bangkok)' },
  { id: 'Asia/Shanghai', label: 'CST (China)' },
  { id: 'Asia/Tokyo', label: 'JST (Tokyo)' },
  { id: 'Asia/Seoul', label: 'KST (Seoul)' },
  { id: 'Australia/Sydney', label: 'AEST (Sydney)' },
  { id: 'Pacific/Auckland', label: 'NZST (Auckland)' },
];
