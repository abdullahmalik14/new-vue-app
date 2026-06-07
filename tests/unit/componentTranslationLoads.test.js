import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

const P07_FILES = [
  'src/templates/auth/views/AuthLogIn.vue',
  'src/templates/auth/views/AuthSignUp.vue',
  'src/templates/auth/views/AuthLostPassword.vue',
  'src/templates/auth/views/AuthResetPassword.vue',
  'src/templates/auth/views/AuthConfirmEmail.vue',
  'src/templates/auth/views/AuthSignUpOnboarding.vue',
  'src/templates/auth/views/AuthSignUpOnboardingKyc.vue',
  'src/templates/dashboard/shared/DashboardSharedHeader.vue',
  'src/templates/dashboard/shared/DashboardSharedSidebar.vue',
  'src/assets/data/menuItems.js',
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
