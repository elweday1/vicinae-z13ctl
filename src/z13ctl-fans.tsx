import React, { useEffect, useState } from 'react';
import { ActionPanel, Action, List, showToast, Toast, Icon, Detail } from '@vicinae/api';
import { runZ13ctl, runZ13ctlSafe } from './utils/cli';

export default function FansControl() {
  const [fanInfo, setFanInfo] = useState<string>('loading...');

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

  return (
    <List
      actions={
        <ActionPanel>
          <Action title="Refresh" icon={Icon.Refresh} onAction={loadStatus} />
          <Action title="Reset to Auto" icon={Icon.Restore} onAction={resetFans} />
        </ActionPanel>
      }
    >
      <List.Section title="Fan Curve">
        <List.Item
          title="Current Fan Curve"
          icon={Icon.Fan}
          detail={<Detail markdown={`\`\`\`\n${fanInfo}\n\`\`\``} />}
        />
      </List.Section>
    </List>
  );
}
