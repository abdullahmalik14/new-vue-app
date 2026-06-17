const fs = require('fs');
const path = 'c:/Users/user/Downloads/newVueApp/vuemain/src/stores/useDashboardAnalyticsStore.js';
let content = fs.readFileSync(path, 'utf8');

const importsToAdd = `import { analyticsCountryCodeToDisplayName, analyticsCountryCodeToIso3166 } from '@/systems/analytics/analyticsCountryLabels.js'\nimport { mapContributorToPreviewRow, getContributorsListForPeriod } from '@/systems/analytics/analyticsDataMappers.js'\n`;

if (!content.includes('analyticsCountryCodeToDisplayName')) {
  content = content.replace(/import { defineStore } from 'pinia';?/, `import { defineStore } from 'pinia';\n${importsToAdd}`);
}

const newGetters = `
    getContributorsViewModel: (state) => (periodKey) => {
      const storeContributorsByPeriod = state.contributors || {};
      let key = periodKey.toLowerCase()
      if (key === 'all-time') key = 'alltime'
      return {
        topContributors: mapContributorToPreviewRow(getContributorsListForPeriod(storeContributorsByPeriod.topContributors, key)),
        topFans: mapContributorToPreviewRow(getContributorsListForPeriod(storeContributorsByPeriod.topFans, key)),
        topOrderSpenders: mapContributorToPreviewRow(getContributorsListForPeriod(storeContributorsByPeriod.topOrderSpenders, key))
      };
    },
    getEarningsViewModel: (state) => (periodKey) => {
      let key = periodKey.toLowerCase()
      if (key === 'all-time') key = 'alltime'
      const arr = state.earnings[key]
      const earningsInsightRow = arr && arr.length ? { ...arr[arr.length - 1] } : null
      if (earningsInsightRow) {
        const countries = state.countries?.[key] || []
        earningsInsightRow.topCountries = countries.map((c, i) => ({
          rank: c.rank || i + 1,
          country: analyticsCountryCodeToDisplayName[c.country] || c.country,
          iso: analyticsCountryCodeToIso3166[c.country] || c.iso || null,
          salesRaw: c.salesUSD || 0,
          salesUSD: c.salesUSD || 0,
          earningsUSD: c.earningsUSD || c.salesUSD || 0,
          sales: (c.salesUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }))
        const summary = state.earnings.summaries?.[key]
        if (summary && summary.totalEarningsUSD != null) {
          earningsInsightRow.total = summary.totalEarningsUSD
          earningsInsightRow.totalTokens = summary.tokensReceived
        } else {
          earningsInsightRow.total = arr?.reduce ? arr.reduce((sum, item) => sum + (item.total || 0), 0) : 0
          earningsInsightRow.totalTokens = arr?.reduce ? arr.reduce((sum, item) => sum + (item.totalTokens || 0), 0) : 0
        }
      }
      return earningsInsightRow
    },
    getFansViewModel: (state) => (periodKey) => {
      let key = periodKey.toLowerCase()
      if (key === 'all-time') key = 'alltime'
      const fansInsightForPeriod = state.fans[key] || state.fans['yearly']
      if (!fansInsightForPeriod || fansInsightForPeriod.newFollowers == null) {
        return { newFollowers: null, profileVisit: null, topCountries: [], sources: [] }
      }
      const fanTrafficSourcesByPeriod = state.fanInsights?.sources || {}
      const fanTrafficSourcesForSelectedPeriod = fanTrafficSourcesByPeriod[key] || []
      const fansTopCountriesDisplay = (fansInsightForPeriod.topCountries || []).map(c => ({
        ...c,
        country: analyticsCountryCodeToDisplayName[c.country] || c.country,
        visits: (c.visits || 0).toLocaleString('en-US')
      }))
      return {
        newFollowers: fansInsightForPeriod.newFollowers,
        profileVisit: fansInsightForPeriod.profileVisit,
        newFollowersPercentage: fansInsightForPeriod.newFollowersPercentage,
        profileVisitPercentage: fansInsightForPeriod.profileVisitPercentage,
        topCountries: fansTopCountriesDisplay,
        sources: fanTrafficSourcesForSelectedPeriod
      }
    },
    getLikesViewModel: (state) => () => {
      return state.likes || {}
    },`;

content = content.replace(/getters:\s*\{/, `getters: {${newGetters}`);

fs.writeFileSync(path, content, 'utf8');
console.log('Injected getters into store');
