<template>
     <div class="option-cotainer" data-scope="earnings">
  <div style="margin-right: 8px;">
    <label style="margin-right:4px;">Period:</label>
    <select data-role="period">
      <option value="daily" selected>Day</option>
      <option value="weekly">Week</option>
      <option value="monthly">Month</option>
      <option value="yearly" >Year</option>
    </select>
  </div>
  <div>
    <label style="margin-right:4px;">View:</label>
    <select data-role="view">
      <option value="bar" selected>Bar</option>
      <option value="line">Line</option>
    </select>
  </div>
</div>

<section id="earnings-section" data-charts-scope="earnings">

<!-- ===== DAY · BAR ===== -->
<div
  class="chart-container"
  data-chart-id="earnings-day-bar"
  data-initial-render="true" data-chart-default
  data-chart-config='{
    "configKey": "earnings.trends",
    "type": "bar",
    "period": "daily",
    "hideLogo": true,
    "stacked": true,
    "seriesStyles": {
      "subscription":  { "color": "#4CC9F0" },
      "paytoview":     { "color": "#4361EE" },
      "merch":         { "color": "#7209B7" },
      "wishtender":    { "color": "#F72585" },
      "customrequest": { "color": "#3A0CA3" }
    },
    "bar":  { "widthPercent": 25 },
    "line": { "strokeWidth": 4 },
    "axisLabelColor": "#475467",
    "axisLabelFontSize": "12px",
    "tooltip": { "aggregated": { "enabled": true, "mode": "codepen", "valuePrefix": "$", "valueSuffix": "" } },
    "yAxis": { "autoMax": true, "autoMaxBuffer": 0.12, "strict": true },
    "legentHint": {
      "enabled": true,
      "class": "flex flex-wrap justify-center gap-2 mt-3",
      "itemClass": "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm bg-white shadow-sm ring-1 ring-gray-200",
      "markerClass": "w-3 h-3 rounded-full",
      "labelClass": "text-gray-700"
    }
  }'>
  <div class="amchart" data-role="chart"></div>
</div>

<!-- ===== DAY · LINE ===== -->
<div
  class="chart-container"
  data-chart-id="earnings-day-line"
 data-initial-render="false"
  hidden
  data-chart-config='{
    "configKey": "earnings.trends",
    "type": "line",
    "period": "daily",
    "hideLogo": true,
    "stacked": true,
    "seriesStyles": {
      "subscription":  { "color": "#4CC9F0" },
      "paytoview":     { "color": "#4361EE" },
      "merch":         { "color": "#7209B7" },
      "wishtender":    { "color": "#F72585" },
      "customrequest": { "color": "#3A0CA3" }
    },
    "bar":  { "widthPercent": 25 },
    "line": { "strokeWidth": 4 },
    "axisLabelColor": "#475467",
    "axisLabelFontSize": "12px",
    "tooltip": { "aggregated": { "enabled": true, "mode": "codepen", "valuePrefix": "$", "valueSuffix": "" } },
    "yAxis": { "autoMax": true, "autoMaxBuffer": 0.12, "strict": true },
    "legentHint": {
      "enabled": true,
      "class": "flex flex-wrap justify-center gap-2 mt-3",
      "itemClass": "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm bg-white shadow-sm ring-1 ring-gray-200",
      "markerClass": "w-3 h-3 rounded-full",
      "labelClass": "text-gray-700"
    }
  }'>
  <div class="amchart" data-role="chart"></div>
</div>

<!-- ===== WEEK · BAR ===== -->
<div
  class="chart-container"
    data-initial-render="false"
  hidden
  data-chart-id="earnings-week-bar"
  data-chart-config='{
    "configKey": "earnings.trends",
    "type": "bar",
    "period": "weekly",
    "hideLogo": true,
    "stacked": true,
    "seriesStyles": {
      "subscription":  { "color": "#4CC9F0" },
      "paytoview":     { "color": "#4361EE" },
      "merch":         { "color": "#7209B7" },
      "wishtender":    { "color": "#F72585" },
      "customrequest": { "color": "#3A0CA3" }
    },
    "bar":  { "widthPercent": 25 },
    "line": { "strokeWidth": 4 },
    "axisLabelColor": "#475467",
    "axisLabelFontSize": "12px",
    "tooltip": { "aggregated": { "enabled": true, "mode": "codepen", "valuePrefix": "$", "valueSuffix": "" } },
    "yAxis": { "autoMax": true, "autoMaxBuffer": 0.12, "strict": true },
    "legentHint": {
      "enabled": true,
      "class": "flex flex-wrap justify-center gap-2 mt-3",
      "itemClass": "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm bg-white shadow-sm ring-1 ring-gray-200",
      "markerClass": "w-3 h-3 rounded-full",
      "labelClass": "text-gray-700"
    }
  }'>
  <div class="amchart" data-role="chart"></div>
</div>

<!-- ===== WEEK · LINE ===== -->
<div
  class="chart-container"
      data-initial-render="false"
  hidden
  data-chart-id="earnings-week-line"
  data-chart-config='{
    "configKey": "earnings.trends",
    "type": "line",
    "period": "weekly",
    "hideLogo": true,
    "stacked": true,
    "seriesStyles": {
      "subscription":  { "color": "#4CC9F0" },
      "paytoview":     { "color": "#4361EE" },
      "merch":         { "color": "#7209B7" },
      "wishtender":    { "color": "#F72585" },
      "customrequest": { "color": "#3A0CA3" }
    },
    "bar":  { "widthPercent": 25 },
    "line": { "strokeWidth": 4 },
    "axisLabelColor": "#475467",
    "axisLabelFontSize": "12px",
    "tooltip": { "aggregated": { "enabled": true, "mode": "codepen", "valuePrefix": "$", "valueSuffix": "" } },
    "yAxis": { "autoMax": true, "autoMaxBuffer": 0.12, "strict": true },
    "legentHint": {
      "enabled": true,
      "class": "flex flex-wrap justify-center gap-2 mt-3",
      "itemClass": "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm bg-white shadow-sm ring-1 ring-gray-200",
      "markerClass": "w-3 h-3 rounded-full",
      "labelClass": "text-gray-700"
    }
  }'>
  <div class="amchart" data-role="chart"></div>
</div>

<!-- ===== MONTH · BAR ===== -->
<div
  class="chart-container"
      data-initial-render="false"
  hidden
  data-chart-id="earnings-month-bar"
  data-chart-config='{
    "configKey": "earnings.trends",
    "type": "bar",
    "period": "monthly",
    "hideLogo": true,
    "stacked": true,
    "seriesStyles": {
      "subscription":  { "color": "#4CC9F0" },
      "paytoview":     { "color": "#4361EE" },
      "merch":         { "color": "#7209B7" },
      "wishtender":    { "color": "#F72585" },
      "customrequest": { "color": "#3A0CA3" }
    },
    "bar":  { "widthPercent": 25 },
    "line": { "strokeWidth": 4 },
    "axisLabelColor": "#475467",
    "axisLabelFontSize": "12px",
    "tooltip": { "aggregated": { "enabled": true, "mode": "codepen", "valuePrefix": "$", "valueSuffix": "" } },
    "yAxis": { "autoMax": true, "autoMaxBuffer": 0.12, "strict": true },
    "legentHint": {
      "enabled": true,
      "class": "flex flex-wrap justify-center gap-2 mt-3",
      "itemClass": "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm bg-white shadow-sm ring-1 ring-gray-200",
      "markerClass": "w-3 h-3 rounded-full",
      "labelClass": "text-gray-700"
    }
  }'>
  <div class="amchart" data-role="chart"></div>
</div>

<!-- ===== MONTH · LINE ===== -->
<div
  class="chart-container"
      data-initial-render="false"
  hidden
  data-chart-id="earnings-month-line"
  data-chart-config='{
    "configKey": "earnings.trends",
    "type": "line",
    "period": "monthly",
    "hideLogo": true,
    "stacked": true,
    "seriesStyles": {
      "subscription":  { "color": "#4CC9F0" },
      "paytoview":     { "color": "#4361EE" },
      "merch":         { "color": "#7209B7" },
      "wishtender":    { "color": "#F72585" },
      "customrequest": { "color": "#3A0CA3" }
    },
    "bar":  { "widthPercent": 25 },
    "line": { "strokeWidth": 4 },
    "axisLabelColor": "#475467",
    "axisLabelFontSize": "12px",
    "tooltip": { "aggregated": { "enabled": true, "mode": "codepen", "valuePrefix": "$", "valueSuffix": "" } },
    "yAxis": { "autoMax": true, "autoMaxBuffer": 0.12, "strict": true },
    "legentHint": {
      "enabled": true,
      "class": "flex flex-wrap justify-center gap-2 mt-3",
      "itemClass": "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm bg-white shadow-sm ring-1 ring-gray-200",
      "markerClass": "w-3 h-3 rounded-full",
      "labelClass": "text-gray-700"
    }
  }'>
  <div class="amchart" data-role="chart"></div>
</div>

<!-- ===== YEAR · BAR ===== -->
<div
  class="chart-container"
      data-initial-render="false"
  hidden
  data-chart-id="earnings-year-bar"
  data-chart-config='{
    "configKey": "earnings.trends",
    "type": "bar",
    "period": "yearly",
    "hideLogo": true,
    "stacked": true,
    "seriesStyles": {
      "subscription":  { "color": "#4CC9F0" },
      "paytoview":     { "color": "#4361EE" },
      "merch":         { "color": "#7209B7" },
      "wishtender":    { "color": "#F72585" },
      "customrequest": { "color": "#3A0CA3" }
    },
    "bar":  { "widthPercent": 25 },
    "line": { "strokeWidth": 4 },
    "axisLabelColor": "#475467",
    "axisLabelFontSize": "12px",
    "tooltip": { "aggregated": { "enabled": true, "mode": "codepen", "valuePrefix": "$", "valueSuffix": "" } },
    "yAxis": { "autoMax": true, "autoMaxBuffer": 0.12, "strict": true },
    "legentHint": {
      "enabled": true,
      "class": "flex flex-wrap justify-center gap-2 mt-3",
      "itemClass": "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm bg-white shadow-sm ring-1 ring-gray-200",
      "markerClass": "w-3 h-3 rounded-full",
      "labelClass": "text-gray-700"
    }
  }'>
  <div class="amchart" data-role="chart"></div>
</div>

<!-- ===== YEAR · LINE ===== -->
<div
  class="chart-container"
      data-initial-render="false"
  hidden
  data-chart-id="earnings-year-line"
  data-chart-config='{
    "configKey": "earnings.trends",
    "type": "line",
    "period": "yearly",
    "hideLogo": true,
    "stacked": true,
    "seriesStyles": {
      "subscription":  { "color": "#4CC9F0" },
      "paytoview":     { "color": "#4361EE" },
      "merch":         { "color": "#7209B7" },
      "wishtender":    { "color": "#F72585" },
      "customrequest": { "color": "#3A0CA3" }
    },
    "bar":  { "widthPercent": 25 },
    "line": { "strokeWidth": 4 },
    "axisLabelColor": "#475467",
    "axisLabelFontSize": "12px",
    "tooltip": { "aggregated": { "enabled": true, "mode": "codepen", "valuePrefix": "$", "valueSuffix": "" } },
    "yAxis": { "autoMax": true, "autoMaxBuffer": 0.12, "strict": true },
    "legentHint": {
      "enabled": true,
      "class": "flex flex-wrap justify-center gap-2 mt-3",
      "itemClass": "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm bg-white shadow-sm ring-1 ring-gray-200",
      "markerClass": "w-3 h-3 rounded-full",
      "labelClass": "text-gray-700"
    }
  }'>
  <div class="amchart" data-role="chart"></div>
</div>

 </section>
  <hr>

   <!-- ================== DONUT CHART ================== -->
  <h2>Revenue Distribution</h2>
<!-- Revenue Distribution (DONUT) -->
<div
  class="chart-container"
  data-chart-id="donut-example"
  data-initial-render="true"
  data-chart-config='{
    "configKey": "donut.example",
    "type": "donut",
    "period": "yearly",
    "hideLogo": true,

    "seriesStyles": {
      "subscription":  { "color": "#4CC9F0" },
      "paytoview":     { "color": "#4361EE" },
      "merch":         { "color": "#7209B7" },
      "wishtender":    { "color": "#F72585" },
      "customrequest": { "color": "#3A0CA3" }
    },
    "categoryKeyMap": {
      "Subscription":   "subscription",
      "Pay to view":    "paytoview",
      "Merch":          "merch",
      "Wishtender":     "wishtender",
      "Custom request": "customrequest"
    },

    "donut": { "widthPercent": 40 },
    "labelFontSize": 25,
    "tooltip": { "color": "#344054" },
    "legentHint": {
      "enabled": true,
      "class": "flex flex-wrap justify-center gap-2 mt-3",
      "itemClass": "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm bg-white shadow-sm ring-1 ring-gray-200",
      "markerClass": "w-3 h-3 rounded-full",
      "labelClass": "text-gray-700"
    }
  }'>
  <div class="amchart" data-role="chart"></div>
</div>


  <hr>

   <!-- ================== SIMPLE LINE (shadow) ================== -->
  <h2>Subscriber Growth</h2>
<!-- Subscriber Growth (LINE SHADOW) — fixed JSON (no comments) -->
<div
  class="chart-container"
  data-chart-id="line-separate"
  data-initial-render="true"
  data-chart-config='{
    "configKey": "subscribers.newline",
    "type": "line-shadow",
    "period": "yearly",
    "hideLogo": true,
    "seriesLabels": { "sub": "sub" },
    "seriesStyles": { "sub": { "color": "#FF6B6B" } },
    "line": { "strokeWidth": 4 },
    "legentHint": {
      "enabled": false
    }
  }'>
  <div class="amchart" data-role="chart"></div>
</div>

<!-- ================== WORLD MAP ================== -->
  <h2>Global Presence</h2>
  <div
    class="chart-container"
    data-initial-render="true"
    data-chart-id="world-map"
    data-chart-config='{
      "configKey": "world.map",
      "type": "map",
      "period": "yearly",
      "hideLogo": true,

       "groupColors": {
        "Sweden": "#FF6B6B",
        "Russia": "#4ECDC4",
        "China": "#556270",
        "Philippines": "#FFD93D",
        "United States of America": "#6A4C93",
        "India": "#1A535C"
      },
      "palette": ["#FF6B6B","#4ECDC4","#556270","#FFD93D","#6A4C93","#1A535C"],

      "tooltip": {
        "color": "#344054",
        "valuePrefix": "USD ",
        "valueSuffix": "",
        "template": "[font color=&apos;{{color}}&apos;][bold]{name}[/][/]\n[font color=&apos;{{color}}&apos;]{{prefix}}{sales}{{suffix}}[/]"
      },
      "legentHint": {
        "enabled": true,
        "class": "flex flex-wrap justify-center gap-2 mt-3",
        "itemClass": "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm bg-white shadow-sm ring-1 ring-gray-200",
        "markerClass": "w-3 h-3 rounded-full",
        "labelClass": "text-gray-700"
      }
    }'>
    <div class="amchart" data-role="chart"></div>
  </div>

  <hr>

  <!-- ================== COUNTRY VISITS ================== -->
  <h2>Country Visits</h2>
  <div class="option-cotainer">
    <div>
      <select id="countryPeriodSelect">
        <option value="yearly" selected>Year</option>
        <option value="monthly">Month</option>
        <option value="weekly">Week</option>
      </select>
    </div>
  </div>
  <div
    class="chart-container"
    data-initial-render="true"
    data-chart-id="country-visits"
    data-chart-config='{
      "configKey": "countries.visits",
      "type": "column-with-icons",
      "period": "yearly",
      "hideLogo": true,

       "bar": { "widthPercent": 10, "color": "#4CC9F0" },
      "color": {
        "us":"#4CC9F0",
        "uk":"#4361EE",
        "japan":"#7209B7",
        "germany":"#F72585",
        "france":"#3A0CA3",
        "india":"#F39C12",
        "spain":"#2ECC71",
        "netherlands":"#E67E22",
        "canada":"#95A5A6"
      },

      "legentHint": {
        "enabled": true,
        "class": "flex flex-wrap justify-center gap-2 mt-3",
        "itemClass": "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm bg-white shadow-sm ring-1 ring-gray-200",
        "markerClass": "w-3 h-3 rounded-full",
        "labelClass": "text-gray-700"
      }
    }'>
    <div class="amchart" data-role="chart"></div>
  </div>

  <hr>
</template>

<style>
   
    .chart-container { background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,.05); padding: 16px; margin-bottom: 24px; }
    .amchart { width: 100%; height: 400px; }
    button { margin-bottom: 16px; padding: 8px 14px; border-radius: 6px; border: 1px solid #ddd; background-color: #4361ee; color: #fff; cursor: pointer; font-weight: 500; transition: background-color .2s; }
    button:hover { background-color: #3a0ca3; }
    hr { margin: 40px 0; border: none; border-top: 1px solid #eaeaea; }
    .option-cotainer { display: flex; justify-content: end; margin-bottom: 10px; }
    #countryPeriodSelect { width: 100px; padding: 6px; border-radius: 4px; border: 1px solid #ddd; }
  </style>