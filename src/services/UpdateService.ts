/**
 * ALoad - GitHub Update Service
 * Checks for new releases at github.com/pheonix14/aload
 */

import axios from 'axios';
import { DEFAULT_SETTINGS } from '../types';

export interface Release {
  version: string;
  name: string;
  body: string;
  publishedAt: string;
  downloadUrl: string;
  htmlUrl: string;
}

const CURRENT_VERSION = '1.0.0';

/**
 * Check for latest release on GitHub
 */
export async function checkForUpdate(repo: string = DEFAULT_SETTINGS.githubRepo): Promise<Release | null> {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${repo}/releases/latest`,
      { timeout: 8000, headers: { Accept: 'application/vnd.github.v3+json' } },
    );
    const release = res.data;
    const latestVersion = release.tag_name?.replace(/^v/, '');
    if (!latestVersion) return null;

    if (isNewerVersion(latestVersion, CURRENT_VERSION)) {
      const apkAsset = release.assets?.find((a: any) =>
        a.name.endsWith('.apk') && a.browser_download_url,
      );
      return {
        version: latestVersion,
        name: release.name || `v${latestVersion}`,
        body: release.body || '',
        publishedAt: release.published_at,
        downloadUrl: apkAsset?.browser_download_url || release.html_url,
        htmlUrl: release.html_url,
      };
    }
    return null; // already up to date
  } catch {
    return null;
  }
}

/**
 * Compare semver — returns true if latest > current
 */
function isNewerVersion(latest: string, current: string): boolean {
  const parse = (v: string) => v.split('.').map(Number);
  const [lMaj, lMin, lPatch] = parse(latest);
  const [cMaj, cMin, cPatch] = parse(current);
  if (lMaj !== cMaj) return lMaj > cMaj;
  if (lMin !== cMin) return lMin > cMin;
  return lPatch > cPatch;
}

export { CURRENT_VERSION };
