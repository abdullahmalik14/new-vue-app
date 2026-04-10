<template>
  <section class="flex flex-col gap-10 bg-[#ececec] ">
    <DemoSectionHeader title="InputComponentDashboard" />

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

      <div class="flex flex-col gap-3">
        <InputComponentDashboard 
          v-model="inputs.basic" 
          placeholder="carrot_popxoxo123" 
          showLabel 
          labelText="Username"
          description="Usernames cannot be changed after your first month on our website, but special circumstances may allow for exceptions. Please contact us if you need assistance with changing your username." 
        />
        <ShowCodeToggle :code="icdSnippets.default" />
      </div>

      <div class="flex flex-col gap-3">
        <InputComponentDashboard 
          v-model="inputs.basic" 
          placeholder="mscarrot_pops@gmail.com" 
          showLabel 
          labelText="Email" 
        />
        <ShowCodeToggle :code="icdSnippets.email" />
      </div>

      <div class="flex flex-col gap-3">
        <InputComponentDashboard 
          v-model="inputs.basic" 
          placeholder="" 
          showLabel 
          labelText="First Name" 
        />
        <ShowCodeToggle :code="icdSnippets.firstName" />
      </div>

      <div class="flex flex-col gap-3">
        <InputComponentDashboard 
          v-model="inputs.basic" 
          placeholder="" 
          showLabel 
          labelText="Last Name" 
        />
        <ShowCodeToggle :code="icdSnippets.lastName" />
      </div>

      <div class="flex flex-col gap-3">
        <InputComponentDashboard 
          v-model="inputs.basic" 
          placeholder="Event Title" 
          showLabel 
          labelText="Title" 
        />
        <ShowCodeToggle :code="icdSnippets.title" />
      </div>

      <div class="flex flex-col gap-3">
        <InputComponentDashboard 
          placeholder="Search by username & email" 
          v-model="inputs.basic" 
          showLabel
          label-text="Co-performer (Optional)" 
          :left-icon="MagnifyingGlassIcon" 
          optionalLabel 
          class="w-full" 
        />
        <ShowCodeToggle :code="icdSnippets.coPerformer" />
      </div>

      <!-- 2. Password with Toggle -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Password with Toggle</span>
        <InputComponentDashboard 
          v-model="inputs.password" 
          placeholder="Old Password" 
          showLabel 
          labelText="Old Password"
          @rightIconClick="inputs.showPass = !inputs.showPass" 
        />
        <ShowCodeToggle :code="icdSnippets.password" />
      </div>

      <!-- 4. With Right Icon -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">With Right Icon</span>
        <InputComponentDashboard 
          v-model="inputs.email" 
          placeholder="Enter email..." 
          showLabel 
          labelText="Email Support"
          :rightIcon="EnvelopeIcon" 
        />
        <ShowCodeToggle :code="icdSnippets.rightIcon" />
      </div>

      <!-- 5. Required Display -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Required (*)</span>
        <InputComponentDashboard 
          v-model="inputs.email" 
          placeholder="Required field" 
          showLabel 
          labelText="Full Name"
          requiredDisplay="*" 
        />
        <ShowCodeToggle :code="icdSnippets.requiredStar" />
      </div>

      <!-- 9. Prefix and Suffix Icons -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Both Icons (Left & Right)</span>
        <div class="min-h-[100px] flex items-center">
          <InputComponentDashboard 
            v-model="inputs.email" 
            placeholder="Search with filters..." 
            showLabel
            labelText="Advanced Search" 
            :leftIcon="MagnifyingGlassIcon" 
            :rightIcon="Bars3Icon" 
            clickableRightIcon 
          />
        </div>
        <ShowCodeToggle :code="icdSnippets.bothIcons" />
      </div>

      <!-- 10. Textarea -->
      <div class="flex flex-col gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Textarea</span>
        <InputComponentDashboard 
          id="input_g" 
          type="textarea" 
          show-label 
          v-model="inputs.bio" 
          textAreaRows="3"
          label-text="" 
          placeholder="Description (Optional)" 
          description="0/200 characters" 
        />
        <ShowCodeToggle :code="icdSnippets.textarea" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, defineComponent, h } from 'vue';
import InputComponentDashboard from '@/components/input/InputComponentDashboard.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import {
  MagnifyingGlassIcon,
  EnvelopeIcon,
  Bars3Icon
} from '@heroicons/vue/24/outline';

// Inline ShowCode toggle component
const ShowCodeToggle = defineComponent({
  props: { code: { type: String, default: '' } },
  setup(props) {
    const open = ref(false);
    const copied = ref(false);
    const copy = async () => {
      await navigator.clipboard.writeText(props.code).catch(() => { });
      copied.value = true;
      setTimeout(() => (copied.value = false), 2000);
    };
    return () => h('div', { class: 'flex flex-col gap-0 mb-4' }, [
      h('button', {
        type: 'button',
        onClick: () => (open.value = !open.value),
        class: 'self-start flex items-center gap-1.5 text-[0.7rem] font-medium text-gray-500 hover:text-gray-800 dark:text-white/50 dark:hover:text-white/80 transition-colors mt-1 px-0 py-0',
      }, [
        h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.8', stroke: 'currentColor', class: 'w-3 h-3' },
          [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5' })]),
        open.value ? 'Hide Code' : 'Show Code',
      ]),
      open.value && h('div', { class: 'mt-2 rounded-lg overflow-hidden bg-[#1a1a1a]' }, [
        h('div', { class: 'flex justify-between items-center px-3 py-1.5 bg-[#252525]' }, [
          h('span', { class: 'text-[0.6rem] font-mono text-white/30 uppercase tracking-wider' }, 'Vue'),
          h('button', { type: 'button', onClick: copy, class: 'text-[0.65rem] text-white/40 hover:text-white/70 transition-colors' }, copied.value ? '✓ Copied' : 'Copy'),
        ]),
        h('pre', { class: 'p-3 overflow-x-auto text-[0.72rem] leading-relaxed text-[#d4d4d4] font-mono' },
          h('code', {}, props.code)),
      ]),
    ]);
  },
});

const inputs = reactive({
  basic: '',
  email: '',
  password: '',
  showPass: false,
  bio: ''
});

const icdSnippets = {
  default: `<InputComponentDashboard \n  v-model="val" \n  labelText="Username" \n  placeholder="Enter text..." \n  showLabel\n/>`,
  email: `<InputComponentDashboard \n  v-model="email" \n  labelText="Email" \n  placeholder="mscarrot_pops@gmail.com" \n  showLabel\n/>`,
  firstName: `<InputComponentDashboard \n  v-model="firstName" \n  labelText="First Name" \n  showLabel\n/>`,
  lastName: `<InputComponentDashboard \n  v-model="lastName" \n  labelText="Last Name" \n  showLabel\n/>`,
  title: `<InputComponentDashboard \n  v-model="title" \n  labelText="Title" \n  showLabel\n/>`,
  coPerformer: `<InputComponentDashboard \n  v-model="search" \n  labelText="Co-performer (Optional)" \n  :leftIcon="MagnifyingGlassIcon"\n  showLabel\n  optionalLabel\n/>`,
  password: `<InputComponentDashboard \n  v-model="password" \n  labelText="Password"\n  @rightIconClick="showPass = !showPass"\n  showLabel\n/>`,
  rightIcon: `<InputComponentDashboard \n  v-model="email" \n  labelText="Email Support" \n  :rightIcon="EnvelopeIcon"\n  showLabel\n/>`,
  requiredStar: `<InputComponentDashboard \n  v-model="name" \n  labelText="Full Name" \n  requiredDisplay="*"\n  showLabel\n/>`,
  bothIcons: `<InputComponentDashboard \n  v-model="search" \n  labelText="Advanced Search" \n  :leftIcon="MagnifyingGlassIcon"\n  :rightIcon="Bars3Icon"\n  clickableRightIcon\n  showLabel\n/>`,
  textarea: `<InputComponentDashboard \n  v-model="bio" \n  type="textarea" \n  placeholder="Description (Optional)"\n  textAreaRows="3"\n  showLabel\n/>`,
};
</script>
