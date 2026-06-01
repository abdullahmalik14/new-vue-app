import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

const P07_FILES = [
  'src/components/auth/AuthLogIn.vue',
  'src/components/auth/AuthSignUp.vue',
  'src/components/auth/AuthLostPassword.vue',
  'src/components/auth/AuthResetPassword.vue',
  'src/components/auth/AuthConfirmEmail.vue',
  'src/components/auth/AuthSignUpOnboarding.vue',
  'src/components/auth/AuthSignUpOnboardingKyc.vue',
  'src/templates/dashboard/HeaderResponsive.vue',
  'src/templates/dashboard/DashboardSidebar.vue',
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
