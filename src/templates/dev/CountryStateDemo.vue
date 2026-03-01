<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Toggle Button -->
      <div class="mb-6">
        <button @click="toggleComponent" class="px-4 py-2 rounded-lg font-medium transition-colors"
          :class="showComponent ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'">
          {{ showComponent ? 'Hide Component' : 'Show Component' }}
        </button>
      </div>

      <!-- Component Display Area -->
      <div v-if="showComponent" class="bg-white rounded-lg shadow p-6">
        <CountryStateSelect @update:country="onCountryUpdate" @update:state="onStateUpdate" />

        <!-- Selected Values -->
        <div v-if="selectedCountry || selectedState" class="mt-6 pt-6 border-t border-gray-200">
          <div class="text-sm text-gray-600 space-y-1">
            <div v-if="selectedCountry">Country: <span class="font-mono text-gray-900">{{ selectedCountry }}</span>
            </div>
            <div v-if="selectedState">State: <span class="font-mono text-gray-900">{{ selectedState }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import CountryStateSelect from '@/components/ui/form/select/CountryStateSelect.vue';
import { log } from '@/utils/common/logHandler';

export default {
  name: 'CountryStateDemo',

  components: {
    CountryStateSelect
  },

  setup() {
    const showComponent = ref(true);
    const selectedCountry = ref('');
    const selectedState = ref('');

    const toggleComponent = () => {
      showComponent.value = !showComponent.value;

      log('CountryStateDemo.vue', 'toggleComponent', 'toggle', 'Component visibility toggled', {
        visible: showComponent.value
      });
    };

    const onCountryUpdate = (countryCode) => {
      selectedCountry.value = countryCode;

      log('CountryStateDemo.vue', 'onCountryUpdate', 'update', 'Country updated', {
        country: countryCode
      });
    };

    const onStateUpdate = (stateCode) => {
      selectedState.value = stateCode;

      log('CountryStateDemo.vue', 'onStateUpdate', 'update', 'State updated', {
        state: stateCode
      });
    };

    return {
      showComponent,
      selectedCountry,
      selectedState,
      toggleComponent,
      onCountryUpdate,
      onStateUpdate
    };
  }
};
</script>
