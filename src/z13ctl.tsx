import React, { useEffect, useState } from 'react';
import { ActionPanel, Action, List, showToast, Toast, Icon, Detail } from '@vicinae/api';
import { runZ13ctl, parseStatusOutput } from './utils/cli';

interface SystemStatus {
  apu: string;
  fans: string;
  profile: string;
  tdp: string;
  undervolt: string;
  battery: string;
}

export default function Z13ctlStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const output = await runZ13ctl('status');
      const parsed = parseStatusOutput(output);
      setStatus({
        apu: parsed.apu || 'unknown',
        fans: parsed.fans || 'unknown',
        profile: parsed.profile || 'unknown',
        tdp: parsed.tdp || 'unknown',
        undervolt: parsed.undervolt || 'unknown',
        battery: parsed.battery || 'unknown',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      showToast({ title: 'Failed to get status', message: String(e), style: Toast.Style.Failure });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const quickApply = async (args: string, label: string) => {
    try {
      await runZ13ctl(args);
      showToast({ title: label, style: Toast.Style.Success });
      loadStatus();
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  if (loading && !status) {
    return <List.EmptyView title="Loading..." icon={Icon.Loading} />;
  }

  return (
    <List actions={
      <ActionPanel>
        <Action title="Refresh" icon={Icon.Refresh} onAction={loadStatus} />
        <Action title="Profile: Quiet" onAction={() => quickApply('profile --set quiet', 'Profile: Quiet')} />
        <Action title="Profile: Balanced" onAction={() => quickApply('profile --set balanced', 'Profile: Balanced')} />
        <Action title="Profile: Performance" onAction={() => quickApply('profile --set performance', 'Profile: Performance')} />
        <Action title="RGB: Off" onAction={() => quickApply('off', 'RGB Off')} />
        <Action title="RGB: Cyan" onAction={() => quickApply('apply --color cyan --brightness high', 'RGB: Cyan')} />
        <Action title="RGB: Rainbow" onAction={() => quickApply('apply --mode rainbow --speed slow', 'RGB: Rainbow')} />
      </ActionPanel>
    }>
      <List.Section title="System Status">
        <List.Item
          title="APU Temperature"
          icon={Icon.Thermometer}
          detail={<Detail markdown={`**${status?.apu || '—'}**`} />}
        />
        <List.Item
          title="Fans"
          icon={Icon.Fan}
          detail={<Detail markdown={`**${status?.fans || '—'}**`} />}
        />
        <List.Item
          title="Profile"
          icon={Icon.Gauge}
          detail={<Detail markdown={`**${status?.profile || '—'}**`} />}
        />
        <List.Item
          title="TDP"
          icon={Icon.Bolt}
          detail={<Detail markdown={`**${status?.tdp || '—'}**`} />}
        />
        <List.Item
          title="Undervolt"
          icon={Icon.Minimize}
          detail={<Detail markdown={`**${status?.undervolt || '—'}**`} />}
        />
        <List.Item
          title="Battery"
          icon={Icon.Battery}
          detail={<Detail markdown={`**${status?.battery || '—'}**`} />}
        />
      </List.Section>
    </List>
  );
}
