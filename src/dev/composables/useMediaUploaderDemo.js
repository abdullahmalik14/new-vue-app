import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMediaUploaderAssets } from '@/dev/composables/useMediaUploaderAssets.js';

export function useMediaUploaderDemo() {
  const { t } = useI18n();
  const { assets } = useMediaUploaderAssets();

  const thumbnailSelectorImages = computed(() => {
    const { slideImage, thumbA, thumbB } = assets.value;
    return [
      slideImage,
      thumbA,
      thumbB,
      thumbA,
      thumbB,
      thumbA,
      thumbB,
      thumbA,
      thumbB,
      thumbB,
      thumbB,
      thumbB,
    ].filter(Boolean);
  });

  const historyTags = computed(() => ([
    { id: 'h1', name: t('demo.mediaUploaderComponents.tags.history.bluebettle') },
    { id: 'h2', name: t('demo.mediaUploaderComponents.tags.history.dhdt') },
    { id: 'h3', name: t('demo.mediaUploaderComponents.tags.history.hello') },
  ]));

  const tagsList = computed(() => ([
    { id: 1, name: t('demo.mediaUploaderComponents.tags.list.apple') },
    { id: 2, name: t('demo.mediaUploaderComponents.tags.list.april') },
    { id: 3, name: t('demo.mediaUploaderComponents.tags.list.apricote') },
    { id: 4, name: t('demo.mediaUploaderComponents.tags.list.bigSmile') },
    { id: 5, name: t('demo.mediaUploaderComponents.tags.list.bigEnergy') },
    { id: 6, name: t('demo.mediaUploaderComponents.tags.list.bluebettle') },
    { id: 7, name: t('demo.mediaUploaderComponents.tags.list.cantonese') },
    { id: 8, name: t('demo.mediaUploaderComponents.tags.list.chinese') },
    { id: 9, name: t('demo.mediaUploaderComponents.tags.list.dumplings') },
    { id: 10, name: t('demo.mediaUploaderComponents.tags.list.eeeee') },
  ]));

  const performersList = computed(() => ([
    {
      id: 1,
      name: t('demo.mediaUploaderComponents.performers.jellyJam.name'),
      username: t('demo.mediaUploaderComponents.performers.jellyJam.username'),
      avatar: assets.value.performerAvatar || assets.value.thumbA,
    },
    {
      id: 2,
      name: t('demo.mediaUploaderComponents.performers.sammiJelly.name'),
      username: t('demo.mediaUploaderComponents.performers.sammiJelly.username'),
      avatar: assets.value.performerAvatar || assets.value.thumbA,
    },
  ]));

  const planSharingPerformersList = computed(() => ([
    { id: 1, name: t('demo.mediaUploaderComponents.planSharing.userOne'), username: 'user1' },
    { id: 2, name: t('demo.mediaUploaderComponents.planSharing.userTwo'), username: 'user2' },
  ]));

  return {
    assets,
    thumbnailSelectorImages,
    historyTags,
    tagsList,
    performersList,
    planSharingPerformersList,
  };
}
