import React, { useState } from 'react';
import { ActionPanel, Action, List, showToast, Toast, Icon, Detail } from '@vicinae/api';
import { runZ13ctl } from './utils/cli';

interface FanPoint {
  temp: number;
  speed: number;
  isPercent: boolean;
}

const DEFAULT_CURVE: FanPoint[] = [
  { temp: 48, speed: 1, isPercent: true },
  { temp: 53, speed: 9, isPercent: true },
  { temp: 57, speed: 12, isPercent: true },
  { temp: 60, speed: 17, isPercent: true },
  { temp: 63, speed: 22, isPercent: true },
  { temp: 65, speed: 27, isPercent: true },
  { temp: 70, speed: 35, isPercent: true },
  { temp: 76, speed: 40, isPercent: true },
];

function pointsToCurveString(points: FanPoint[]): string {
  return points.map((p) => {
    const speedStr = p.isPercent ? `${p.speed}%` : String(p.speed);
    return `${p.temp}:${speedStr}`;
  }).join(',');
}

function validateCurve(points: FanPoint[]): string | null {
  if (points.length !== 8) return 'Must have exactly 8 points';
  for (let i = 1; i < points.length; i++) {
    if (points[i].temp <= points[i - 1].temp) {
      return `Temperatures must be increasing (point ${i + 1}: ${points[i].temp} <= ${points[i - 1].temp})`;
    }
  }
  for (const p of points) {
    if (p.temp < 0 || p.temp > 120) return `Temperature ${p.temp} out of range (0-120°C)`;
    if (p.speed < 0) return `Speed ${p.speed} cannot be negative`;
    if (!p.isPercent && p.speed > 255) return `PWM ${p.speed} out of range (0-255)`;
  }
  return null;
}

export default function FansEdit() {
  const [points, setPoints] = useState<FanPoint[]>(DEFAULT_CURVE);

  const apply = async () => {
    const error = validateCurve(points);
    if (error) {
      showToast({ title: 'Invalid curve', message: error, style: Toast.Style.Failure });
      return;
    }
    try {
      const curveStr = pointsToCurveString(points);
      await runZ13ctl(`fancurve --set "${curveStr}"`);
      showToast({ title: 'Fan curve applied', style: Toast.Style.Success });
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  const resetToDefault = () => {
    setPoints(DEFAULT_CURVE);
  };

  const validationError = validateCurve(points);

  return (
    <List
      actions={
        <ActionPanel>
          <Action title="Apply Curve" icon={Icon.Checkmark} onAction={apply} />
          <Action title="Reset to Default" icon={Icon.Restore} onAction={resetToDefault} />
        </ActionPanel>
      }
    >
      <List.Section title={`Fan Curve ${validationError ? '⚠ ' + validationError : '✓ Valid'}`}>
        {points.map((p, i) => (
          <List.Item
            key={i}
            title={`Point ${i + 1}`}
            subtitle={`${p.temp}°C : ${p.speed}${p.isPercent ? '%' : ' PWM'}`}
          />
        ))}
      </List.Section>
      <List.Section title="Current Definition (for reference)">
        <List.Item
          title="Format"
          detail={<Detail markdown={`\`${pointsToCurveString(points)}\``} />}
        />
      </List.Section>
    </List>
  );
}
