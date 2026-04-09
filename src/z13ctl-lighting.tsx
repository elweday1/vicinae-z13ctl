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

export default function LightingControl() {
  const [mode, setMode] = useState<Mode>('static');
  const [color, setColor] = useState('cyan');
  const [color2, setColor2] = useState('000000');
  const [speed, setSpeed] = useState<Speed>('normal');
  const [brightness, setBrightness] = useState<Brightness>('high');

  const apply = async () => {
    try {
      const resolvedColor = resolveColor(color);
      const resolvedColor2 = resolveColor(color2);
      let args = `apply --mode ${mode} --color ${resolvedColor} --speed ${speed} --brightness ${brightness}`;
      if (mode === 'breathe') {
        args += ` --color2 ${resolvedColor2}`;
      }
      await runZ13ctl(args);
      showToast({ title: 'Lighting applied', style: Toast.Style.Success });
    } catch (e) {
      showToast({ title: 'Failed to apply lighting', message: String(e), style: Toast.Style.Failure });
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

  const listColors = async () => {
    try {
      const output = await runZ13ctl('apply --list-colors');
      showToast({ title: 'Colors listed in console', style: Toast.Style.Info });
      console.log(output);
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  return (
    <List
      searchBarPlaceholder="Search..."
      actions={
        <ActionPanel>
          <Action title="Apply" icon={Icon.Checkmark} onAction={apply} />
          <Action title="Turn Off" icon={Icon.XMarkCircle} onAction={turnOff} />
          <Action title="List Colors" icon={Icon.List} onAction={listColors} />
        </ActionPanel>
      }
    >
      <List.Section title="Mode">
        {MODES.map((m) => (
          <List.Item
            key={m}
            title={m.charAt(0).toUpperCase() + m.slice(1)}
            icon={mode === m ? Icon.Checkmark : Icon.Circle}
            onTap={() => setMode(m)}
          />
        ))}
      </List.Section>

      <List.Section title="Primary Color">
        <List.Item
          title={color}
          accessories={[{ text: '#' + resolveColor(color) }]}
        />
        {COLOR_NAMES.map((name) => (
          <List.Item
            key={name}
            title={name}
            onTap={() => setColor(name)}
          />
        ))}
      </List.Section>

      {mode === 'breathe' && (
        <List.Section title="Secondary Color (Breathe)">
          <List.Item
            title={color2}
            accessories={[{ text: '#' + resolveColor(color2) }]}
          />
          {COLOR_NAMES.map((name) => (
            <List.Item
              key={name}
              title={name}
              onTap={() => setColor2(name)}
            />
          ))}
        </List.Section>
      )}

      <List.Section title="Speed">
        {SPEEDS.map((s) => (
          <List.Item
            key={s}
            title={s.charAt(0).toUpperCase() + s.slice(1)}
            icon={speed === s ? Icon.Checkmark : Icon.Circle}
            onTap={() => setSpeed(s)}
          />
        ))}
      </List.Section>

      <List.Section title="Brightness">
        {BRIGHTNESS_LEVELS.map((b) => (
          <List.Item
            key={b}
            title={b.charAt(0).toUpperCase() + b.slice(1)}
            icon={brightness === b ? Icon.Checkmark : Icon.Circle}
            onTap={() => setBrightness(b)}
          />
        ))}
      </List.Section>
    </List>
  );
}
