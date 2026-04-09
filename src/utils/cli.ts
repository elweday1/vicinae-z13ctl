import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runZ13ctl(args: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(`z13ctl ${args}`);
    if (stderr) {
      console.warn('z13ctl stderr:', stderr);
    }
    return stdout.trim();
  } catch (error: unknown) {
    const err = error as { code?: number; stderr?: string; message?: string };
    if (err.code === 127) {
      throw new Error('z13ctl not found. Install it from https://github.com/dahui/z13ctl');
    }
    const msg = err.stderr || err.message || String(error);
    throw new Error(msg);
  }
}

export async function runZ13ctlSafe(args: string): Promise<{ success: boolean; output: string; error?: string }> {
  try {
    const output = await runZ13ctl(args);
    return { success: true, output };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, output: '', error: msg };
  }
}

export function parseStatusOutput(output: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = output.split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();
    if (key) result[key] = value;
  }
  return result;
}
