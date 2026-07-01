const CHECKMARK_BASE =
  "checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:rotate-45 checked:after:box-border";

const CHECKMARK_BLACK_MD =
  `${CHECKMARK_BASE} checked:after:w-1 checked:after:h-2 checked:after:border-[2px] checked:after:border-black checked:after:border-t-0 checked:after:border-l-0 checked:after:border-solid`;

const CHECKMARK_WHITE_MD =
  `${CHECKMARK_BASE} checked:after:w-1 checked:after:h-2 checked:after:border-r-2 checked:after:border-b-2 checked:after:border-white checked:after:border-t-0 checked:after:border-l-0 checked:after:border-solid`;

const CHECKMARK_WHITE_BOOKING =
  `${CHECKMARK_BASE} checked:after:w-[0.25rem] checked:after:h-[0.5rem] checked:after:border-r-[0.125rem] checked:after:border-b-[0.125rem] checked:after:border-white checked:after:border-t-0 checked:after:border-l-0 checked:after:border-solid`;

const CHECKMARK_WHITE_CALENDAR =
  `${CHECKMARK_BASE} checked:after:w-[0.30rem] checked:after:h-[0.6rem] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-white checked:after:border-t-0 checked:after:border-l-0 checked:after:border-solid`;

const CHECKMARK_WHITE_SM =
  `${CHECKMARK_BASE} checked:after:w-[0.2rem] checked:after:h-[0.4rem] checked:after:border-r-[1.5px] checked:after:border-b-[1.5px] checked:after:border-white checked:after:border-t-0 checked:after:border-l-0 checked:after:border-solid`;

const CHECKMARK_BG_CENTER =
  "checked:[background-image:url('/images/check.svg')] checked:[background-position:center] checked:[background-repeat:no-repeat] checked:[background-size:55%]";

const CHECKBOX_MD =
  "appearance-none border rounded-[4px] w-4 min-w-4 h-4 min-h-4 shrink-0 cursor-pointer outline-none focus:outline-none focus:ring-0 box-border";

export const CHECKOUT_GREEN_CLASS =
  `${CHECKBOX_MD} border-[#D0D5DD] checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] ${CHECKMARK_BLACK_MD}`;

export const CHECKOUT_SAVE_CARD_CLASS =
  `${CHECKBOX_MD} bg-white border-[#D0D5DD] checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] ${CHECKMARK_BLACK_MD}`;

export const SUCCESS_GREEN_CLASS =
  `${CHECKBOX_MD} bg-white border-gray-300  checked:bg-success checked:border-success ${CHECKMARK_BLACK_MD}`;

export const SUCCESS_GREEN_SMALL_CLASS =
  `relative appearance-none w-3 h-3 min-w-3 min-h-3 shrink-0 border border-gray-300 rounded-[4px] bg-white cursor-pointer outline-none focus:outline-none focus:ring-0 box-border checked:border-success checked:bg-success ${CHECKMARK_BG_CENTER}`;

export const BOOKING_STANDARD_CLASS =
  `m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none box-border checked:bg-checkbox checked:border-checkbox ${CHECKMARK_WHITE_BOOKING}`;

export const BOOKING_SMALL_CLASS =
  `m-0 border border-checkboxBorder [appearance:none] w-[0.75rem] h-[0.75rem] rounded bg-transparent relative cursor-pointer box-border checked:bg-checkbox checked:border-checkbox ${CHECKMARK_WHITE_SM}`;

export const MEDIA_TERMS_CLASS =
  `${CHECKBOX_MD} bg-white border-gray-300 mt-[3px] checked:bg-success checked:border-success ${CHECKMARK_BLACK_MD}`;

export const CALENDAR_FILTER_CLASS =
  "m-0 w-4 h-4 rounded border cursor-pointer box-border appearance-none outline-none focus:outline-none focus:ring-0";

export const CALENDAR_SCHEDULE_CLASS =
  `m-0 [appearance:none] w-4 h-4 bg-white rounded border border-gray-900 cursor-pointer box-border checked:bg-gray-900 checked:border-gray-900 ${CHECKMARK_WHITE_CALENDAR}`;

export const CALENDAR_PINK_CLASS =
  `${CHECKBOX_MD} bg-white border-[#D0D5DD] rounded-[0.25rem] checked:bg-[#FF0066] checked:border-[#FF0066] ${CHECKMARK_WHITE_MD}`;

export const TOPUP_CHECKBOX_CLASS =
  `${CHECKBOX_MD} border-[#98A2B3] rounded bg-white checked:bg-[#07f468] checked:border-[#07f468] ${CHECKMARK_BLACK_MD}`;

export const TRAILER_CHECKBOX_CLASS =
  `relative appearance-none w-3 h-3 min-w-3 min-h-3 shrink-0 border border-[#999] rounded-[2px] bg-white cursor-pointer outline-none focus:outline-none focus:ring-0 box-border checked:border-success checked:bg-success ${CHECKMARK_BG_CENTER}`;

export const AUTH_REMEMBER_CLASS =
  `m-0 border border-checkboxBorder [appearance:none] w-[0.75rem] h-[0.75rem] rounded-[2px] bg-transparent relative cursor-pointer box-border checked:bg-checkbox checked:border-checkbox ${CHECKMARK_WHITE_SM}`;

export const MEDIA_TERMS_COMPACT_CLASS =
  `${CHECKBOX_MD} bg-white border-gray-300 checked:bg-success checked:border-success ${CHECKMARK_BLACK_MD}`;

export const BOOKING_STANDARD_2PX_CLASS =
  `m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none box-border checked:bg-checkbox checked:border-checkbox ${CHECKMARK_WHITE_MD}`;

export const CALENDAR_EVENT_VIDEO_CLASS =
  `m-0 [appearance:none] w-4 h-4 bg-white rounded border border-indigo-600 cursor-pointer box-border checked:bg-indigo-600 checked:border-indigo-600 ${CHECKMARK_WHITE_CALENDAR}`;

export const CALENDAR_EVENT_AUDIO_CLASS =
  `m-0 [appearance:none] w-4 h-4 bg-white rounded border border-cyan-500 cursor-pointer box-border checked:bg-cyan-500 checked:border-cyan-500 ${CHECKMARK_WHITE_CALENDAR}`;

export const CALENDAR_EVENT_GROUP_CLASS =
  `m-0 [appearance:none] w-4 h-4 bg-white rounded border border-rose-600 cursor-pointer box-border checked:bg-rose-600 checked:border-rose-600 ${CHECKMARK_WHITE_CALENDAR}`;

export function buildCheckboxGroupCode({
  vModel = 'checked',
  label = '',
  labelKey = '',
  checkboxClass = 'CHECKOUT_GREEN_CLASS',
  labelClass = '',
  wrapperClass = '',
  midImg = '',
  midImgKey = '',
  tags = false,
  metaText = '',
  checkboxStyle = '',
  slotLabel = false,
  wrapperLabel = false,
  extraAttrs = '',
} = {}) {
  const importLine = "import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';";
  const labelAttr = labelKey
    ? `:label="t('${labelKey}')"`
    : label
      ? `label="${label}"`
      : '';
  const parts = [
    `<CheckboxGroup`,
    `  v-model="${vModel}"`,
    labelAttr,
    checkboxClass ? `  checkbox-class="${checkboxClass}"` : '',
    labelClass ? `  label-class="${labelClass}"` : '',
    wrapperClass ? `  wrapper-class="${wrapperClass}"` : '',
    midImgKey ? `  :mid-img="instantBookingIconUrl"  <!-- useAssetUrl('${midImgKey}') -->` : midImg ? `  mid-img="${midImg}"` : '',
    tags ? '  :tags="planTags"' : '',
    metaText ? `  meta-text="${metaText}"` : '',
    checkboxStyle ? `  :checkbox-style="${checkboxStyle}"` : '',
    extraAttrs,
    slotLabel ? '>' : '/>',
  ].filter(Boolean);

  if (slotLabel) {
    parts.push('  <!-- label slot -->', '</CheckboxGroup>');
  } else if (wrapperLabel) {
    return `${importLine}\n\n<label class="flex items-center gap-2.5 cursor-pointer">\n  <CheckboxGroup v-model="${vModel}" />\n  <span class="text-gray-950 text-base font-medium">${label}</span>\n</label>`;
  }

  return `${importLine}\n\n${parts.join('\n')}`;
}
