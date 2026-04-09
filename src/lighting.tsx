import React, { useState } from 'react';
import { ActionPanel, Action, List, showToast, Toast, Icon } from '@vicinae/api';
import { runZ13ctl } from './utils/cli';
import { NAMED_COLORS, COLOR_NAMES, resolveColor } from './utils/colors';

type Mode = 'static' | 'breathe' | 'cycle' | 'rainbow' | 'strobe';
type Speed = 'slow' | 'normal' | 'fast';
type Brightness = 'off' | 'low' | 'medium' | 'high';

const MODES: Mode[] = ['static', 'breathe', 'cycle', 'rainbow', 'strobe'];
const SPEEDS: Speed[] = ['slow', 'normal', 'fast'];
const BRIGHTNESS_LEVELS: Brightness[] = ['off', 'low', 'medium', 'high'];

interface Preset {
  name: string;
  args: string;
  description?: string;
}

const PRESETS: Preset[] = [
  { name: 'Off', args: 'off', description: 'Turn off all lighting' },
  { name: 'Cyan High', args: 'apply --color cyan --brightness high', description: 'Solid cyan at full brightness' },
  { name: 'Rainbow Slow', args: 'apply --mode rainbow --speed slow', description: 'Slow rainbow wave' },
  { name: 'Rainbow Normal', args: 'apply --mode rainbow --speed normal', description: 'Normal speed rainbow' },
  { name: 'Rainbow Fast', args: 'apply --mode rainbow --speed fast', description: 'Fast rainbow wave' },
  { name: 'Breathing Red', args: 'apply --mode breathe --color red --speed slow', description: 'Breathing red effect' },
  { name: 'Breathing Hotpink/Blue', args: 'apply --mode breathe --color hotpink --color2 blue --speed slow', description: 'Breathing between hotpink and blue' },
  { name: 'Cycle Normal', args: 'apply --mode cycle --speed normal', description: 'Auto-cycling color spectrum' },
  { name: 'Strobe White Fast', args: 'apply --mode strobe --color white --speed fast', description: 'Fast white strobe' },
  { name: 'Static Gold High', args: 'apply --color gold --brightness high', description: 'Solid gold at full brightness' },
  { name: 'Static Green Medium', args: 'apply --color chartreuse --brightness medium', description: 'Solid green at medium brightness' },
];

export default function LightingControl() {
  const [mode, setMode] = useState<Mode>('static');
  const [color, setColor] = useState('cyan');
  const [color2, setColor2] = useState<string>('000000');
  const [speed, setSpeed] = useState<Speed>('normal');
  const [brightness, setBrightness] = useState<Brightness>('high');

  const apply = async (overrideMode?: Mode, overrideColor?: string, overrideColor2?: string, overrideSpeed?: Speed, overrideBrightness?: Brightness) => {
    const m = overrideMode ?? mode;
    const c = overrideColor ?? color;
    const c2 = overrideColor2 ?? color2;
    const s = overrideSpeed ?? speed;
    const b = overrideBrightness ?? brightness;
    try {
      const resolvedColor = resolveColor(c);
      const resolvedColor2 = resolveColor(c2);
      let args = `apply --mode ${m} --color ${resolvedColor} --speed ${s} --brightness ${b}`;
      if (m === 'breathe') {
        args += ` --color2 ${resolvedColor2}`;
      }
      await runZ13ctl(args);
      showToast({ title: 'Lighting applied', style: Toast.Style.Success });
    } catch (e) {
      showToast({ title: 'Failed to apply lighting', message: String(e), style: Toast.Style.Failure });
    }
  };

  const applyPreset = async (preset: Preset) => {
    try {
      await runZ13ctl(preset.args);
      showToast({ title: `Applied: ${preset.name}`, style: Toast.Style.Success });
    } catch (e) {
      showToast({ title: `Failed: ${preset.name}`, message: String(e), style: Toast.Style.Failure });
    }
  };

  const turnOff = async () => {
    try {
      await runZ13ctl('off');
      showToast({ title: 'Lighting off', style: Toast.Style.Success });
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  const hexColor = '#' + resolveColor(color);
  const hexColor2 = '#' + resolveColor(color2);

  return (
    <List
      searchBarPlaceholder="Search..."
      actions={
        <ActionPanel>
          <Action title="Apply Current Settings" icon={Icon.Checkmark} onAction={() => apply()} />
          <Action title="Turn Off" icon={Icon.XMarkCircle} onAction={turnOff} />
        </ActionPanel>
      }
    >
      <List.Section title="Presets">
        {PRESETS.map((preset) => (
          <List.Item
            key={preset.name}
            title={preset.name}
            subtitle={preset.description}
            icon={Icon.LightBulb}
            actions={
              <ActionPanel>
                <Action title="Apply" icon={Icon.Checkmark} onAction={() => applyPreset(preset)} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      <List.Section title="Mode">
        {MODES.map((m) => (
          <List.Item
            key={m}
            title={m.charAt(0).toUpperCase() + m.slice(1)}
            icon={mode === m ? Icon.Checkmark : Icon.Circle}
            actions={
              <ActionPanel>
                <Action title={`Set Mode: ${m}`} onAction={() => { setMode(m); apply(m, undefined, undefined, undefined, undefined); }} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      <List.Section title="Primary Color">
        <List.Item
          title={color}
          subtitle="Current"
          accessories={[{ text: { color: hexColor, value: hexColor } }]}
        />
        {COLOR_NAMES.map((name) => {
          const hex = '#' + resolveColor(name);
          return (
            <List.Item
              key={name}
              title={name}
              accessories={[{ text: { color: hex, value: hex } }]}
              actions={
                <ActionPanel>
                  <Action title={`Set Color: ${name}`} onAction={() => { setColor(name); apply(undefined, name, undefined, undefined, undefined); }} />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>

      {mode === 'breathe' && (
        <List.Section title="Secondary Color (Breathe)">
          <List.Item
            title={color2}
            subtitle="Current"
            accessories={[{ text: { color: hexColor2, value: hexColor2 } }]}
          />
          {COLOR_NAMES.map((name) => {
            const hex = '#' + resolveColor(name);
            return (
              <List.Item
                key={name}
                title={name}
                accessories={[{ text: { color: hex, value: hex } }]}
                actions={
                  <ActionPanel>
                    <Action title={`Set Color 2: ${name}`} onAction={() => { setColor2(name); apply(undefined, undefined, name, undefined, undefined); }} />
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      )}

      <List.Section title="Speed">
        {SPEEDS.map((s) => (
          <List.Item
            key={s}
            title={s.charAt(0).toUpperCase() + s.slice(1)}
            icon={speed === s ? Icon.Checkmark : Icon.Circle}
            actions={
              <ActionPanel>
                <Action title={`Set Speed: ${s}`} onAction={() => { setSpeed(s); apply(undefined, undefined, undefined, s, undefined); }} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      <List.Section title="Brightness">
        {BRIGHTNESS_LEVELS.map((b) => (
          <List.Item
            key={b}
            title={b.charAt(0).toUpperCase() + b.slice(1)}
            icon={brightness === b ? Icon.Checkmark : Icon.Circle}
            actions={
              <ActionPanel>
                <Action title={`Set Brightness: ${b}`} onAction={() => { setBrightness(b); apply(undefined, undefined, undefined, undefined, b); }} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
