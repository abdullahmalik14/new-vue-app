import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useAssetUrl } from '../../src/composables/useAssetUrl.js';

const getAssetUrl = vi.hoisted(() => vi.fn());

vi.mock('../../src/systems/assets/assetLibrary.js', () => ({
  getAssetUrl,
}));

const TestHost = defineComponent({
  props: {
    flag: { type: String, required: true },
    sectionName: { type: String, default: null },
  },
  setup(props) {
    return useAssetUrl(props.flag, props.sectionName);
  },
  template: '<div />',
});

describe('useAssetUrl (§84)', () => {
  beforeEach(() => {
    getAssetUrl.mockReset();
  });

  it('ref null before resolve', async () => {
    getAssetUrl.mockImplementation(() => new Promise(() => {}));
    const wrapper = mount(TestHost, { props: { flag: 'icon.cart' } });

    expect(wrapper.vm.url).toBeNull();
    expect(wrapper.vm.loading).toBe(true);
  });

  it('resolves valid flag', async () => {
    getAssetUrl.mockResolvedValue('/assets/icons/cart.svg');
    const wrapper = mount(TestHost, { props: { flag: 'icon.cart' } });

    await vi.waitFor(() => expect(wrapper.vm.url).toBe('/assets/icons/cart.svg'));
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBeNull();
  });

  it('updates on flag change', async () => {
    getAssetUrl.mockImplementation(async (flag) => `/${flag}.svg`);
    const wrapper = mount(TestHost, { props: { flag: 'icon.cart' } });

    await vi.waitFor(() => expect(wrapper.vm.url).toBe('/icon.cart.svg'));
    wrapper.unmount();

    const remounted = mount(TestHost, { props: { flag: 'icon.user' } });
    await vi.waitFor(() => expect(remounted.vm.url).toBe('/icon.user.svg'));
  });

  it('section option forwarded', async () => {
    getAssetUrl.mockResolvedValue('/images/telegram.svg');
    mount(TestHost, { props: { flag: 'icon.social.telegram', sectionName: 'auth' } });

    await vi.waitFor(() => expect(getAssetUrl).toHaveBeenCalledWith('icon.social.telegram', { section: 'auth' }));
  });

  it('missing flag → null', async () => {
    getAssetUrl.mockResolvedValue(null);
    const wrapper = mount(TestHost, { props: { flag: 'missing.flag' } });

    await vi.waitFor(() => expect(wrapper.vm.url).toBeNull());
    expect(wrapper.vm.error).toBeNull();
  });

  it('no update after unmount', async () => {
    let resolveUrl;
    getAssetUrl.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUrl = resolve;
        }),
    );
    const wrapper = mount(TestHost, { props: { flag: 'icon.cart' } });

    wrapper.unmount();
    resolveUrl?.('/assets/icons/cart.svg');
    await nextTick();

    expect(getAssetUrl).toHaveBeenCalledTimes(1);
  });
});
