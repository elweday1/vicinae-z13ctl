import React from 'react';
import { ActionPanel, Action, List, showToast, Toast, Icon } from '@vicinae/api';
import { runZ13ctl } from './utils/cli';

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

export default function LightingPresets() {
  const applyPreset = async (preset: Preset) => {
    try {
      await runZ13ctl(preset.args);
      showToast({ title: `Applied: ${preset.name}`, style: Toast.Style.Success });
    } catch (e) {
      showToast({ title: `Failed: ${preset.name}`, message: String(e), style: Toast.Style.Failure });
    }
  };

  const showColorList = async () => {
    try {
      const output = await runZ13ctl('apply --list-colors');
      console.log(output);
      showToast({ title: 'Colors printed to console', style: Toast.Style.Info });
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  return (
    <List
      searchBarPlaceholder="Search presets..."
      actions={
        <ActionPanel>
          <Action title="Show Color List" icon={Icon.List} onAction={showColorList} />
        </ActionPanel>
      }
    >
      <List.Section title="Presets">
        {PRESETS.map((preset) => (
          <List.Item
            key={preset.name}
            title={preset.name}
            subtitle={preset.description}
            icon={Icon.Lightbulb}
            actions={
              <ActionPanel>
                <Action title="Apply" icon={Icon.Checkmark} onAction={() => applyPreset(preset)} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
