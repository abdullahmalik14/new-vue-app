/**
 * Validates analytics pipeline bundle integrity and logs missing sections for debugging.
 * @param {Object} bundle
 * @param {{ earningsDaily?: Array }} [context]
 */
export function validateAnalyticsBundleIntegrity(bundle, context = {}) {
  console.group('🛡️ ANALYTICS DATA INTEGRITY CHECK');

  const checks = [];
  const warn = (section, message) => {
    checks.push(`❌ ${section}: ${message}`);
    console.warn(`❌ ${section}: ${message}`);
  };
  const ok = (section) => {
    console.log(`✅ ${section}: Data present`);
  };

  if (!bundle.earnings) {
    warn('Earnings', 'Entire earnings section MISSING from bundle!');
  } else {
    ['daily', 'weekly', 'monthly', 'yearly'].forEach((period) => {
      const arr = bundle.earnings[period];
      if (!arr || arr.length === 0) warn('Earnings', `${period} data is EMPTY`);
      else ok(`Earnings.${period} (${arr.length} entries)`);
    });
    if (!bundle.earnings.grandTotal) warn('Earnings', 'grandTotal is MISSING');
    const totalEarnings = bundle.earnings.grandTotal?.total;
    if (totalEarnings === 0) {
      warn('Earnings', 'grandTotal.total is 0 — possible child event wiring issue');
    }
  }

  if (!bundle.subscriptions) {
    warn('Subscriptions', 'Entire subscriptions section MISSING!');
  } else {
    ['daily', 'weekly', 'monthly', 'yearly'].forEach((period) => {
      const arr = bundle.subscriptions[period];
      if (!arr || arr.length === 0) warn('Subscriptions', `${period} data is EMPTY`);
      else ok(`Subscriptions.${period} (${arr.length} entries)`);
    });
  }

  if (!bundle.fanInsights) {
    warn('FanInsights', 'Entire fanInsights section MISSING!');
  } else {
    ['daily', 'weekly', 'monthly', 'yearly'].forEach((period) => {
      const arr = bundle.fanInsights[period];
      if (!arr || arr.length === 0) warn('FanInsights', `${period} data is EMPTY`);
      else ok(`FanInsights.${period} (${arr.length} entries)`);
    });

    if (!bundle.fanInsights.sources || Object.keys(bundle.fanInsights.sources).length === 0) {
      warn('FanInsights', 'Traffic sources data is EMPTY');
    }

    const countries = bundle.fanInsights.countries;
    if (countries) {
      Object.keys(countries).forEach((period) => {
        const arr = countries[period];
        if (arr && arr.length > 0 && arr.every((country) => country.views === 0 || country.earningsUSD === 0)) {
          warn(
            'FanInsights',
            `countries.${period} has ALL zero views/earnings — master events may not be wired`,
          );
        }
      });
    }
  }

  if (!bundle.likes) {
    warn('Likes', 'Entire likes section MISSING!');
  } else if (!bundle.likes.daily?.length) {
    warn('Likes', 'daily data is EMPTY');
  } else {
    ok(`Likes.daily (${bundle.likes.daily.length} entries)`);
  }

  if (!bundle.contributors) {
    warn('Contributors', 'Entire contributors section MISSING!');
  } else {
    ['topContributors', 'topFirms', 'topOrderSpenders'].forEach((key) => {
      const arr = bundle.contributors[key]?.daily || bundle.contributors[key]?.weekly || [];
      if (!arr.length) warn('Contributors', `${key} is EMPTY`);
      else ok(`Contributors.${key} (${arr.length} entries)`);
    });

    const topSpendersArr =
      bundle.contributors.topOrderSpenders?.daily || bundle.contributors.topOrderSpenders?.weekly || [];
    if (context.earningsDaily?.length > 0 && !topSpendersArr.length) {
      warn(
        'CRITICAL',
        'We have earnings/orders but "topOrderSpenders" is EMPTY — child events broken!',
      );
    }
  }

  if (!bundle.trendingsMedia || Object.keys(bundle.trendingsMedia).length === 0) {
    warn('Trending', 'trendingsMedia is MISSING');
  }
  if (!bundle.trendingMerch || Object.keys(bundle.trendingMerch).length === 0) {
    warn('Trending', 'trendingMerch is MISSING');
  }
  if (!bundle.trendingTags || Object.keys(bundle.trendingTags).length === 0) {
    warn('Trending', 'trendingTags is MISSING');
  }
  if (!bundle.trendingCountries || Object.keys(bundle.trendingCountries).length === 0) {
    warn('Trending', 'trendingCountries is MISSING');
  }

  if (checks.length === 0) {
    console.log('🎉 ALL DATA INTEGRITY CHECKS PASSED — No missing data detected');
  } else {
    console.warn(`⚠️ ${checks.length} DATA ISSUES FOUND — Review above warnings`);
  }

  console.groupEnd();
}
