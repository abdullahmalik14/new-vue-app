<template>
  <section
      :class="theme.mini.wrapper"
      v-bind="dataAttrs"
      data-role="mini"
      :data-month="cursor.getMonth()+1"
      :data-year="cursor.getFullYear()">

      <div class="grid grid-cols-7 text-[0.75rem] font-bold  uppercase tracking-wide ">
        <div v-for="(w, idx) in ['S','M','T','W','T','F','S']" :key="idx" :class="['text-center w-[37.43px] h-[20px]', idx===0 ? 'text-red-500' : '']">{{ w }}</div>
      </div>

      <div class="grid grid-cols-7 gap-0  ">
        <template v-for="(d,i) in days" :key="i">
          <button
          v-if="d.getMonth()===cursor.getMonth()"
          type="button" @click="choose(d)"
          :data-date="d.toISOString().slice(0,10)"
          :data-expired="d<today?'true':'false'"
          :class="[
            theme.mini.dayBase,
            d<today ? theme.mini.expired : '',
            
            // CHANGE 3: Logic update. Agar Today hai to 'today' class, warna 'hover' class.
            sameDay(d, today) ? theme.mini.today : 'hover:bg-slate-50', 
            
            sameDay(d, selectedDate) ? theme.mini.selected : '',
            d.getDay() === 0 ? 'text-red-500' : ''
          ]">
          <span class="text-[0.75rem] font-medium ">{{ d.getDate() }}</span>
          <span v-if="dotMap[d.toISOString().slice(0,10)]" :class="theme.mini.dot" data-has-events="true"></span>
        </button>

          <div v-else class="w-[37.43px] h-[37px]"></div>
        </template>
      </div>

    </section>
</template>

<script>
import { SOD, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addMonths, monthNames } from '@/utils/calendarHelpers.js';

export default {
  name: 'MiniCalendar',
  props: {
    monthDate: { type: Date, required: true },
    selectedDate: { type: Date, required: true },
    events: { type: Array, default: () => [] },
    theme: { type: Object, default: () => ({}) },
    dataAttrs: { type: Object, default: () => ({}) }
  },
  emits: ['date-selected'],
  data() { return { today: SOD(new Date()), cursor: new Date(this.monthDate) }; },
  watch: {
  monthDate: {
    immediate: true,
    handler(newVal) {
      if (newVal) {
        // Hamesha cursor ko update karein jab parent se new date aaye
        this.cursor = new Date(newVal);
      }
    }
  }
},
  computed: {
    header() { return `${monthNames[this.cursor.getMonth()]} ${this.cursor.getFullYear()}` },
    days() {
      const s = startOfWeek(startOfMonth(this.cursor));
      const e = endOfWeek(endOfMonth(this.cursor));
      const arr = []; for (let d = new Date(s); d <= e; d = addDays(d, 1)) arr.push(new Date(d));
      return arr;
    },
    dotMap() {
      const m = {};
      (this.events || []).forEach(ev => {
        if (!ev || !ev.start || !ev.end) return;
        const s = SOD(new Date(ev.start)); const e = SOD(new Date(ev.end));
        for (let d = new Date(s); d <= e; d = addDays(d, 1)) { const k = d.toISOString().slice(0, 10); m[k] = (m[k] || 0) + 1; }
      });
      return m;
    }
  },
  methods: {
    sd(d) { return SOD(d); },
    sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); },
    choose(d) {
      if (!d) return;
      console.log('[mini] choose', d.toISOString().slice(0, 10));
      this.$emit('date-selected', new Date(d));
    },
    shiftMonth(n) { this.cursor = addMonths(this.cursor, n); },
    goToday() { this.cursor = new Date(); this.choose(this.cursor); }
  }
};
</script>