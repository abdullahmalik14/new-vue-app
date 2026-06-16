import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

const P07_FILES = [
  'src/dev/templates/auth/views/AuthLogIn.vue',
  'src/dev/templates/auth/views/AuthSignUp.vue',
  'src/dev/templates/auth/views/AuthLostPassword.vue',
  'src/dev/templates/auth/views/AuthResetPassword.vue',
  'src/dev/templates/auth/views/AuthConfirmEmail.vue',
  'src/dev/templates/auth/views/AuthSignUpOnboarding.vue',
  'src/dev/templates/auth/views/AuthSignUpOnboardingKyc.vue',
  'src/dev/templates/dashboard/shared/DashboardSharedHeader.vue',
  'src/dev/templates/dashboard/shared/DashboardSharedSidebar.vue',
  'src/config/dashboardSidebarMenuItems.js',
];

describe('component translation loads (P-07)', () => {
  it('route-section components do not call loadTranslationsForSection directly', () => {
    const violations = [];

    for (const relativePath of P07_FILES) {
      const source = readFileSync(join(projectRoot, relativePath), 'utf8');
      if (source.includes('loadTranslationsForSection')) {
        violations.push(relativePath);
      }
    }

    expect(violations).toEqual([]);
  });
});
