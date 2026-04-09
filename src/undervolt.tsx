import React, { useEffect, useState } from 'react';
import { ActionPanel, Action, List, showToast, Toast, Icon } from '@vicinae/api';
import { runZ13ctl, runZ13ctlSafe } from './utils/cli';

export default function UndervoltControl() {
  const [currentOffset, setCurrentOffset] = useState<string>('loading...');

  const loadStatus = async () => {
    try {
      const result = await runZ13ctlSafe('undervolt --get');
      if (result.success) {
        setCurrentOffset(result.output.replace('\n', ''));
      } else {
        setCurrentOffset('not set');
      }
    } catch {
      setCurrentOffset('not set');
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const setOffset = async (value: number) => {
    try {
      await runZ13ctl(`undervolt --set ${value}`);
      showToast({ title: `Undervolt: ${value}`, style: Toast.Style.Success });
      loadStatus();
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  const reset = async () => {
    try {
      await runZ13ctl('undervolt --reset');
      showToast({ title: 'Undervolt reset', style: Toast.Style.Success });
      loadStatus();
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  const offsets = [-40, -35, -30, -25, -20, -15, -10, -5, 0];

  return (
    <List
      actions={
        <ActionPanel>
          <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={loadStatus} />
          <Action title="Reset" icon={Icon.Undo} onAction={reset} />
        </ActionPanel>
      }
    >
      <List.Section title="Current Offset">
        <List.Item
          title={currentOffset}
          icon={Icon.ComputerChip}
        />
      </List.Section>

      <List.Section title="CPU Curve Optimizer Offset">
        {offsets.map((o) => (
          <List.Item
            key={o}
            title={o === 0 ? 'Stock (0)' : `${o} mV`}
            subtitle={o === 0 ? 'No offset' : `Voltage offset: ${o}mV`}
            icon={currentOffset.includes(String(o)) ? Icon.Checkmark : Icon.Circle}
            actions={
              <ActionPanel>
                <Action title={`Set Undervolt: ${o} mV`} onAction={() => setOffset(o)} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
