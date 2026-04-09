import React, { useEffect, useState } from 'react';
import { ActionPanel, Action, List, showToast, Toast, Icon } from '@vicinae/api';
import { runZ13ctl, runZ13ctlSafe } from './utils/cli';

type Profile = 'quiet' | 'balanced' | 'performance' | 'custom';

const PROFILES: Profile[] = ['quiet', 'balanced', 'performance', 'custom'];

export default function PowerControl() {
  const [currentProfile, setCurrentProfile] = useState<string>('loading...');
  const [batteryLimit, setBatteryLimit] = useState<string>('—');
  const [tdp, setTdp] = useState<string>('—');
  const [bootSound, setBootSound] = useState<string>('—');
  const [panelOd, setPanelOd] = useState<string>('—');

  const loadStatus = async () => {
    try {
      const [profileResult, batteryResult, tdpResult] = await Promise.all([
        runZ13ctlSafe('profile --get'),
        runZ13ctlSafe('batterylimit --get'),
        runZ13ctlSafe('tdp --get'),
      ]);

      if (profileResult.success) setCurrentProfile(profileResult.output.replace('\n', ''));
      if (batteryResult.success) setBatteryLimit(batteryResult.output.replace('\n', ''));
      if (tdpResult.success) setTdp(tdpResult.output.replace('\n', ''));

      try {
        const bs = await runZ13ctl('bootsound --get');
        setBootSound(bs.trim().replace('\n', ''));
      } catch { setBootSound('—'); }
      try {
        const po = await runZ13ctl('paneloverdrive --get');
        setPanelOd(po.trim().replace('\n', ''));
      } catch { setPanelOd('—'); }
    } catch (e) {
      showToast({ title: 'Failed to load status', message: String(e), style: Toast.Style.Failure });
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const setProfile = async (profile: Profile) => {
    try {
      await runZ13ctl(`profile --set ${profile}`);
      showToast({ title: `Profile: ${profile}`, style: Toast.Style.Success });
      loadStatus();
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  const setBattery = async (limit: number) => {
    try {
      await runZ13ctl(`batterylimit --set ${limit}`);
      showToast({ title: `Battery limit: ${limit}%`, style: Toast.Style.Success });
      loadStatus();
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  const setTdpValue = async (watts: number) => {
    try {
      await runZ13ctl(`tdp --set ${watts}`);
      showToast({ title: `TDP: ${watts}W`, style: Toast.Style.Success });
      loadStatus();
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  const toggleBootSound = async () => {
    const newVal = bootSound === '1' ? '0' : '1';
    try {
      await runZ13ctl(`bootsound --set ${newVal}`);
      showToast({ title: `Boot sound: ${newVal === '1' ? 'On' : 'Off'}`, style: Toast.Style.Success });
      loadStatus();
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  const togglePanelOd = async () => {
    const newVal = panelOd === '1' ? '0' : '1';
    try {
      await runZ13ctl(`paneloverdrive --set ${newVal}`);
      showToast({ title: `Panel overdrive: ${newVal === '1' ? 'On' : 'Off'}`, style: Toast.Style.Success });
      loadStatus();
    } catch (e) {
      showToast({ title: 'Failed', message: String(e), style: Toast.Style.Failure });
    }
  };

  return (
    <List
      actions={
        <ActionPanel>
          <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={loadStatus} />
        </ActionPanel>
      }
    >
      <List.Section title="Performance Profile">
        {PROFILES.map((p) => (
          <List.Item
            key={p}
            title={p.charAt(0).toUpperCase() + p.slice(1)}
            icon={currentProfile.includes(p) ? Icon.Checkmark : Icon.Circle}
            actions={
              <ActionPanel>
                <Action title={`Set Profile: ${p}`} onAction={() => setProfile(p)} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      <List.Section title="TDP (Watts)">
        {[30, 35, 40, 45, 50, 55, 60, 65, 70, 75].map((w) => (
          <List.Item
            key={w}
            title={`${w}W`}
            icon={tdp.includes(String(w)) ? Icon.Checkmark : Icon.Circle}
            actions={
              <ActionPanel>
                <Action title={`Set TDP: ${w}W`} onAction={() => setTdpValue(w)} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      <List.Section title="Battery Limit">
        {[40, 50, 60, 70, 80, 90, 100].map((b) => (
          <List.Item
            key={b}
            title={`${b}%`}
            icon={batteryLimit.includes(String(b)) ? Icon.Checkmark : Icon.Circle}
            actions={
              <ActionPanel>
                <Action title={`Set Battery Limit: ${b}%`} onAction={() => setBattery(b)} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      <List.Section title="System">
        <List.Item
          title="Boot Sound"
          subtitle={bootSound === '1' ? 'On' : bootSound === '0' ? 'Off' : '—'}
          icon={Icon.SpeakerOn}
          actions={
            <ActionPanel>
              <Action title="Toggle" icon={Icon.Switch} onAction={toggleBootSound} />
            </ActionPanel>
          }
        />
        <List.Item
          title="Panel Overdrive"
          subtitle={panelOd === '1' ? 'On' : panelOd === '0' ? 'Off' : '—'}
          icon={Icon.Desktop}
          actions={
            <ActionPanel>
              <Action title="Toggle" icon={Icon.Switch} onAction={togglePanelOd} />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
