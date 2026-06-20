import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faCloud, faWind, faCloudRain, faSnowflake, faBolt } from '@fortawesome/free-solid-svg-icons';
import { useUIStore } from '../../stores/uiStore.js';

interface CurrentWeather { temp: number; code: number; }

function wmoIcon(code: number) {
  if (code === 0) return faSun;
  if (code <= 3) return faCloud;
  if (code <= 48) return faWind;
  if (code <= 67) return faCloudRain;
  if (code <= 77) return faSnowflake;
  if (code <= 82) return faCloudRain;
  return faBolt;
}

const US_STATES: Record<string, string> = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',
  KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',
  MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',
  NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',
  NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
  OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
  DC:'District of Columbia',
};

function geocodeCity(cityName: string): Promise<{ latitude: number; longitude: number }> {
  const [cityPart, qualifierRaw] = cityName.split(',');
  const searchName = cityPart.trim();
  const qualifier = qualifierRaw?.trim().toUpperCase() ?? '';
  return fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchName)}&count=10&language=en&format=json`
  )
    .then(r => r.json())
    .then((data: { results?: { latitude: number; longitude: number; country_code: string; admin1?: string }[] }) => {
      if (!data.results?.length) throw new Error(`City "${cityName}" not found`);
      if (!qualifier) return data.results[0];
      const fullState = US_STATES[qualifier] ?? qualifier;
      const match = data.results.find(r =>
        r.country_code === 'US' && (
          r.admin1?.toUpperCase() === qualifier ||
          r.admin1?.toLowerCase() === fullState.toLowerCase()
        )
      );
      return match ?? data.results[0];
    });
}

const Wrap = styled.div<{ $light?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--s-1, 4px);
  font-family: var(--font-label, ${({ theme }) => theme.fontFamily.mono});
  font-size: 11px;
  letter-spacing: 0.1em;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.7)' : '#f0ebdf'};
  opacity: 0.85;
`;

const Temp = styled.span<{ $light?: boolean }>`
  font-family: var(--font-sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 11px;
  font-weight: 500;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.7)' : '#f0ebdf'};
`;

const HiLo = styled.span<{ $light?: boolean }>`
  font-family: var(--font-sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 10px;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.7)' : '#f0ebdf'};
  opacity: 0.7;
`;

export function InlineWeather({ $light }: { $light?: boolean } = {}) {
  const cityName = useUIStore(s => s.weatherCity);
  const weatherEnabled = useUIStore(s => s.weatherEnabled);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [todayHiLo, setTodayHiLo] = useState<{ max: number; min: number } | null>(null);

  useEffect(() => {
    if (!cityName || !weatherEnabled) { setLat(null); setLon(null); setCurrent(null); setTodayHiLo(null); return; }
    geocodeCity(cityName)
      .then(({ latitude, longitude }) => { setLat(latitude); setLon(longitude); })
      .catch(() => {});
  }, [cityName, weatherEnabled]);

  useEffect(() => {
    if (lat == null || lon == null) return;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min&current=temperature_2m,weathercode` +
      `&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`
    )
      .then(r => r.json())
      .then((data: {
        current: { temperature_2m: number; weathercode: number };
        daily: { temperature_2m_max: number[]; temperature_2m_min: number[] };
      }) => {
        setCurrent({ temp: Math.round(data.current.temperature_2m), code: data.current.weathercode });
        setTodayHiLo({ max: Math.round(data.daily.temperature_2m_max[0]), min: Math.round(data.daily.temperature_2m_min[0]) });
      })
      .catch(() => {});
  }, [lat, lon]);

  if (!weatherEnabled || !cityName || !current) return null;

  return (
    <Wrap $light={$light}>
      <FontAwesomeIcon icon={wmoIcon(current.code)} style={{ fontSize: 11 }} />
      <Temp $light={$light}>{current.temp}°F</Temp>
    </Wrap>
  );
}
