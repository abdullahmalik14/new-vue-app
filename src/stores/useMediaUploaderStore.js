import { defineStore } from 'pinia';
import { reactive, ref, computed } from 'vue';
import router from '@/router';

const noopValidator = () => ({ valid: true, errors: [] });

export const useMediaUploaderStore = defineStore('mediaUploader', () => {
  const currentRoute = computed(() => router.currentRoute.value);

  const step = ref(1);
  const substep = ref('chooseScreenshot');

  const validators = reactive({
    1: noopValidator,
    2: noopValidator,
    3: noopValidator,
    4: noopValidator,
    5: noopValidator,
  });

  const form = reactive({
    mediaType: '',
    mediaId: '',
    src: null,
    thumbnailOption: 'siteDefaultPlaceholder',
    thumbnailUrl: '',
    blurThumbnail: false,
    blurThumbnailLevel: '20px',
    showPreviewTrailer_Screenshot: false,
    showPreviewTrailer_Placeholder: false,
    showPreviewTrailer_Upload: false,
    uploadedThumbnailFile: null,
    uploadedTrailerFile: null,
    previewTrailerSource: 'siteGenerated',
    previewTrailerUrl: '',
    linkToSubscriptionPlan: false,
    subscriptionPlanIds: [],
    postToSocials_Immediate: false,
    postToSocials_Schedule: false,
    payToViewEnabled: false,
    payToViewOriginalPrice: null,
    payToViewDiscountedPrice: null,
    mediaTitle: '',
    description: '',
    tags: [],
    coPerformerIds: [],
    publishType: 'publishImmediatelyAfterApproval',
    scheduledPublishDateTime: '',
    featureOnComingSoon: false,
    preOrderPrice: null,
    postToSocialsOnPublish: false,
    socialPostMessage: '',
    socialThumbnailMode: 'useOriginal',
    socialThumbnailCustomImageSrc: '',
    socialThumbnailCustomVideoSrc: '',
    socialThumbnailCustomImageFile: null,
    socialThumbnailCustomVideoFile: null,
    showOnDiscoveryPage: false,
    showOnProfilePage: false,
    termsCheckbox1: false,
    termsCheckbox2: false,
    termsCheckbox3: false,
    termsCheckbox4: false,
    termsCheckbox5: false,
    tier_name: '',
    tier_description: '',
    tier_originalPrice: null,
    tier_discountPrice: null,
    tier_backgroundUrl: '',
    tier_backgroundFile: null,
    tier_freeTokens: null,
    tier_merchDiscount: null,
    tier_applyMerch: false,
    tier_payToViewDiscount: null,
    tier_applyPayToView: false,
    tier_customRequestDiscount: null,
    tier_applyCustom: false,
    mediaUrl: '',
  });

  const ui = reactive({
    isValidating: false,
    errors: {},
    uploadProgress: 0,
    isUploading: false,
  });

  function setStep(newStep) {
    if (newStep > step.value && !validateStep(step.value)) {
      return;
    }

    if (newStep === 1) {
      const step1Substeps = ['chooseScreenshot', 'usePlaceholder', 'uploadThumbnail'];
      if (!step1Substeps.includes(substep.value)) {
        substep.value = 'chooseScreenshot';
      }
    } else if (newStep === 4) {
      const step4Substeps = ['publishImmediately', 'schedulePublish'];
      if (!step4Substeps.includes(substep.value)) {
        substep.value = 'publishImmediately';
      }
    } else {
      substep.value = '';
    }

    step.value = newStep;
    syncToUrl();
  }

  function setSubstep(newSubstep) {
    substep.value = newSubstep;
    syncToUrl();
  }

  function updateFormField(path, value) {
    form[path] = value;
  }

  function addValidator(stepNumber, validatorFn) {
    validators[stepNumber] = validatorFn;
  }

  function validateStep(stepNumber) {
    const validator = validators[stepNumber];
    if (!validator) return true;

    const { valid, errors } = validator(form);
    if (!valid && errors?.length) {
      alert(errors[0]);
      return false;
    }
    return valid;
  }

  function syncToUrl() {
    const currentParams = new URLSearchParams(window.location.search);
    const newStep = String(step.value);
    const newSubstep = String(substep.value);

    if (currentParams.get('media_step') === newStep && currentParams.get('media_sub') === newSubstep) {
      return;
    }

    const params = new URLSearchParams();
    params.set('media_step', newStep);
    params.set('media_sub', newSubstep);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }

  function initializeFromUrl() {
    const qStep = currentRoute.value.query.media_step;
    const qSub = currentRoute.value.query.media_sub;

    if (qStep) {
      const parsed = parseInt(qStep, 10);
      if (!Number.isNaN(parsed)) step.value = parsed;
    }

    if (qSub) {
      substep.value = qSub;
    } else if (step.value === 1) {
      substep.value = 'chooseScreenshot';
    }
  }

  async function submitUploader() {
    ui.isValidating = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return true;
    } catch (error) {
      console.error('[useMediaUploaderStore] Submission error:', error);
      return false;
    } finally {
      ui.isValidating = false;
    }
  }

  function reset() {
    step.value = 1;
    substep.value = 'chooseScreenshot';
  }

  return {
    step,
    substep,
    form,
    ui,
    validators,
    setStep,
    setSubstep,
    updateFormField,
    addValidator,
    validateStep,
    initializeFromUrl,
    submitUploader,
    reset,
  };
}, {
  persist: {
    key: 'media_uploader_persistence',
    storage: localStorage,
    paths: ['form', 'step', 'substep'],
  },
});
