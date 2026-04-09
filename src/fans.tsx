import React, { useEffect, useState } from 'react';
import { ActionPanel, Action, List, showToast, Toast, Icon, Detail } from '@vicinae/api';
import { runZ13ctl, runZ13ctlSafe } from './utils/cli';

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

export default function FansControl() {
  const [fanInfo, setFanInfo] = useState<string>('loading...');
  const [points, setPoints] = useState<FanPoint[]>(DEFAULT_CURVE);

  const loadStatus = async () => {
    try {
      const result = await runZ13ctlSafe('fancurve --get');
      if (result.success) {
        setFanInfo(result.output);
      } else {
        setFanInfo('failed to load: ' + (result.error || 'unknown'));
      }
    } catch (e) {
      setFanInfo(String(e));
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const resetFans = async () => {
    try {
      await runZ13ctl('fancurve --reset');
      showToast({ title: 'Fan curve reset to auto', style: Toast.Style.Success });
      loadStatus();
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  const applyCurve = async () => {
    const error = validateCurve(points);
    if (error) {
      showToast({ title: 'Invalid curve', message: error, style: Toast.Style.Failure });
      return;
    }
    try {
      const curveStr = pointsToCurveString(points);
      await runZ13ctl(`fancurve --set "${curveStr}"`);
      showToast({ title: 'Fan curve applied', style: Toast.Style.Success });
      loadStatus();
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
          <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={loadStatus} />
          <Action title="Reset to Auto" icon={Icon.Undo} onAction={resetFans} />
          <Action title="Apply Custom Curve" icon={Icon.Checkmark} onAction={applyCurve} />
          <Action title="Reset to Default" icon={Icon.Undo} onAction={resetToDefault} />
        </ActionPanel>
      }
    >
      <List.Section title="Current Fan Curve">
        <List.Item
          title="Status"
          icon={Icon.Temperature}
          detail={<Detail markdown={`\`\`\`\n${fanInfo}\n\`\`\``} />}
        />
      </List.Section>

      <List.Section title={`Custom Curve ${validationError ? '⚠ ' + validationError : '✓'}`}>
        {points.map((p, i) => (
          <List.Item
            key={i}
            title={`Point ${i + 1}: ${p.temp}°C`}
            subtitle={`${p.speed}${p.isPercent ? '%' : ' PWM'}`}
          />
        ))}
      </List.Section>
    </List>
  );
}
