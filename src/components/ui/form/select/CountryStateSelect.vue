<template>
  <div class="country-state-select">
    <!-- Loading State -->
    <div v-if="loading" style="display: flex; flex-direction: column; align-items: center; padding: 2rem;">
      <div
        style="width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite;">
      </div>
      <p style="margin-top: 1rem; color: #6b7280; font-size: 0.875rem;">Loading...</p>
    </div>

    <!-- Select Elements -->
    <div v-else style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <!-- Country Select -->
      <div style="flex: 1; min-width: 200px;">
        <label for="country-select"
          style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151;">Country</label>
        <select id="country-select" v-model="selectedCountry" @change="onCountryChange"
          style="width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background-color: white; cursor: pointer;">
          <option value="">Select a country</option>
          <option v-for="country in countries" :key="country.code2" :value="country.code2">
            {{ country.name }}
          </option>
        </select>
      </div>

      <!-- State Select -->
      <div style="flex: 1; min-width: 200px;">
        <label for="state-select"
          style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151;">State/Province</label>
        <select id="state-select" v-model="selectedState" :disabled="!selectedCountry || !currentStates.length"
          style="width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background-color: white; cursor: pointer;"
          :style="{ opacity: (!selectedCountry || !currentStates.length) ? '0.5' : '1', cursor: (!selectedCountry || !currentStates.length) ? 'not-allowed' : 'pointer' }">
          <option value="">{{ !selectedCountry ? 'Select a country first' : (currentStates.length ? 'Select a state' :
            'No states available') }}</option>
          <option v-for="state in currentStates" :key="state.code" :value="state.code">
            {{ state.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { preloadJSON } from '@/utils/assets/assetPreloader';
import { log } from '@/utils/common/logHandler';

export default {
  name: 'CountryStateSelect',

  emits: ['update:country', 'update:state'],

  setup(props, { emit }) {
    const loading = ref(true);
    const countries = ref([]);
    const selectedCountry = ref('');
    const selectedState = ref('');

    const currentStates = computed(() => {
      if (!selectedCountry.value) return [];
      const country = countries.value.find(c => c.code2 === selectedCountry.value);
      return country?.states || [];
    });

    const loadCountries = async () => {
      try {
        loading.value = true;
        log('CountryStateSelect.vue', 'loadCountries', 'start', 'Loading countries data');

        const data = await preloadJSON('/src/config/countries.json');

        countries.value = data;
        loading.value = false;

        log('CountryStateSelect.vue', 'loadCountries', 'success', 'Countries loaded', {
          count: data.length
        });
      } catch (error) {
        loading.value = false;
        log('CountryStateSelect.vue', 'loadCountries', 'error', 'Failed to load countries', {
          error: error.message,
          stack: error.stack
        });
        console.error('Failed to load countries:', error);
      }
    };

    const onCountryChange = () => {
      selectedState.value = '';

      log('CountryStateSelect.vue', 'onCountryChange', 'change', 'Country changed', {
        country: selectedCountry.value,
        statesAvailable: currentStates.value.length
      });

      emit('update:country', selectedCountry.value);
      emit('update:state', '');
    };

    onMounted(() => {
      loadCountries();
    });

    return {
      loading,
      countries,
      selectedCountry,
      selectedState,
      currentStates,
      onCountryChange
    };
  }
};
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
