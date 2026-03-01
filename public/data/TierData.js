// src/data/TierData.js

export const tierData = [
  // --- TIER CARD 1 (Pink, Standard Claim) ---
  {
    id: 1,
    title: "My VVIP Lounge ❤️️️",
    backgroundImage: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
    isFeatured: true,
    stats: { video: 100, image: 80, audio: 70 },
    
    // Theme Colors (Pink)
    theme: {
      textPrimary: '#FB0464',
      textSecondary: "text-[#FFED29] dark:text-[#ffee37]", // Price color
      shadow: "shadow-[0px_0px_80px_0px_#FF8FBA40,0px_0px_8px_0px_#FF8FBA40]",
      barColor: "bg-[#FB0464] dark:bg-[#c90350]",
      barTextColor: "text-[#FFED29]",
      featuredBg: "bg-[#FB0464] dark:bg-[#c90350]",
      buttonBgImage: "url('https://i.ibb.co.com/gMff3x7t/union-pink.webp')",
      flashLabel: "text-white dark:text-[#e8e6e3]", // "Sale Ends in" color
      flashText: "#FB0464",
      textReNew:"text-white dark:text-[#e8e6e3]",
      featuredText:"text-white dark:text-[#e8e6e3]"
    },

    plans: [
      { id: '1d', label: '1 day', price: '55.86', discount: null },
      { id: '1m', label: '1 month', price: '55.86', discount: '-5%' },
      { id: '6m', label: '6 month', price: '55.86', discount: '-50%', isMostValue: true }, // Badge trigger
      { id: '1y', label: '1 year', price: '55.86', discount: '-5%' },
    ],
    defaultPlan: '6m',

    flashSale: {
      active: true,
      endsIn: "02:13:07",
      originalPrice: "$111.72"
    },

    description: "Welcome to Jenny’s VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️...",
    
    // Footer Logic
    footer: {
      type: 'standard', // 'standard' | 'spend' | 'hidden' | 'subscribe'
      buttonText: "CLAIM<br>OFFER",
      progress: {
        visible: true,
        width: "5%",
        leftText: "5 Left!",
        rightText: "95/100 Offer"
      }
    }
  },

  // --- TIER CARD 2 (Gold, Spend to Claim) ---
  {
    id: 2,
    title: "My VVIP Lounge ❤️️️",
    backgroundImage: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
    isFeatured: true,
    stats: { video: 100, image: 80, audio: 70 },
    
    // Theme Colors (Gold/Yellow)
    theme: {
      textPrimary: "text-[#FFED29]",
      textSecondary: "text-[#FFED29] dark:text-[#ffee37]",
      shadow: "shadow-[0px_0px_80px_0px_#FFED2940,0px_0px_8px_0px_#FFED2980]",
      barColor: "bg-[#ffffff]",
      barTextColor: "text-[#FFED29]", // Not used in spend footer but good to have
      featuredBg: "bg-[#FB0464] dark:bg-[#c90350]",
      buttonBgImage: "url('https://i.ibb.co.com/gMff3x7t/union-pink.webp')",
      flashLabel: "text-white dark:text-[#e8e6e3]", 
      flashText: "#FB0464",
      textReNew:"text-white dark:text-[#e8e6e3]",
      featuredText:"text-white dark:text-[#e8e6e3]"

    },

    plans: [
      { id: '1d', label: '1 day', price: '55.86', discount: null },
      { id: '1m', label: '1 month', price: '55.86', discount: '-5%' },
      { id: '6m', label: '6 month', price: '55.86', discount: '-50%', isMostValue: true },
      { id: '1y', label: '1 year', price: '55.86', discount: '-5%' },
    ],
    defaultPlan: '6m',

    flashSale: { active: true, endsIn: "02:13:07", originalPrice: "$111.72" },
    description: "Welcome to Jenny’s  VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️ Welcome to Jenny’s  VIP Lounge! Welcome to Jenny’s  VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️ Welcome to Jenny’s  VIP Lounge! Welcome to Jenny’s  VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️ Welcome to Jenny’s  VIP Lounge! ...",

    footer: {
      type: 'spend',
      buttonText: "CLAIM<br>OFFER",
      progress: {
        visible: true,
        width: "80%",
        leftText: "Spend $200 more to claim",
        rightText: "200/ USD400"
      }
    }
  },

  // --- TIER CARD 3 (Pink, Standard 95 Left) ---
  {
    id: 3,
    title: "My VVIP Lounge ❤️️️",
    backgroundImage: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
    isFeatured: true,
    stats: { video: 100, image: 80, audio: 70 },

    theme: {
      textPrimary: '#FB0464',
      textSecondary: "text-[#FFED29] dark:text-[#ffee37]",
      shadow: "shadow-[0px_0px_80px_0px_#FF8FBA40,0px_0px_8px_0px_#FF8FBA40]",
      barColor: "bg-[#FB0464] dark:bg-[#c90350]", // Bar color changed to Pink here
      barTextColor: "text-[#FB0464]",
      featuredBg: "bg-[#FB0464] dark:bg-[#c90350]",
      buttonBgImage: "url('https://i.ibb.co.com/gMff3x7t/union-pink.webp')",
      flashLabel: "text-white dark:text-[#e8e6e3]", 
      flashText: "#FB0464",
      textReNew:"text-white dark:text-[#e8e6e3]",
      featuredText:"text-white dark:text-[#e8e6e3]"

    },

    plans: [
      { id: '1d', label: '1 day', price: '55.86', discount: null },
      { id: '1m', label: '1 month', price: '55.86', discount: '-5%' },
      { id: '6m', label: '6 month', price: '55.86', discount: '-50%', isMostValue: true },
      { id: '1y', label: '1 year', price: '55.86', discount: '-5%' },
    ],
    defaultPlan: '6m',
    flashSale: { active: true, endsIn: "02:13:07", originalPrice: "$111.72" },
    description: "Welcome to Jenny’s  VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️ Welcome to Jenny’s  VIP Lounge! Welcome to Jenny’s  VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️ Welcome to Jenny’s  VIP Lounge! Welcome to Jenny’s  VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️ Welcome to Jenny’s  VIP Lounge! ...",

    footer: {
      type: 'standard',
      buttonText: "CLAIM<br>OFFER",
      progress: {
        visible: true,
        width: "95%",
        leftText: "95 Left!",
        rightText: "5/100 Offer"
      }
    }
  },

  // --- TIER CARD 4 (Pink, Hidden Progress) ---
  {
    id: 4,
    title: "My VVIP Lounge ❤️️️",
    backgroundImage: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
    isFeatured: true,
    stats: { video: 100, image: 80, audio: 70 },

    theme: {
      textPrimary: '#FB0464',
      textSecondary: "text-[#FFED29] dark:text-[#ffee37]",
      shadow: "shadow-[0px_0px_80px_0px_#FF8FBA40,0px_0px_8px_0px_#FF8FBA40]",
      barColor: "bg-[#FFED29] dark:bg-[#ffee37]",
      barTextColor: "text-[#FFED29]",
      featuredBg: "bg-[#FB0464] dark:bg-[#c90350]",
      buttonBgImage: "url('https://i.ibb.co.com/gMff3x7t/union-pink.webp')",
   flashLabel: "text-white dark:text-[#e8e6e3]", 
      flashText: "#FB0464",
textReNew:"text-white dark:text-[#e8e6e3]",
      featuredText:"text-white dark:text-[#e8e6e3]"

    },

    plans: [
      { id: '1d', label: '1 day', price: '55.86', discount: null },
      { id: '1m', label: '1 month', price: '55.86', discount: '-5%' },
      { id: '6m', label: '6 month', price: '55.86', discount: '-50%', isMostValue: true },
      { id: '1y', label: '1 year', price: '55.86', discount: '-5%' },
    ],
    defaultPlan: '6m',
    flashSale: { active: true, endsIn: "02:13:07", originalPrice: "$111.72" },
    description: "Welcome to Jenny’s  VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️ Welcome to Jenny’s  VIP Lounge! Welcome to Jenny’s  VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️ Welcome to Jenny’s  VIP Lounge! Welcome to Jenny’s  VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️ Welcome to Jenny’s  VIP Lounge! ...",

    footer: {
      type: 'hidden', // IMPORTANT: This triggers the hidden progress layout
      buttonText: "CLAIM<br>OFFER",
      progress: { visible: false }
    }
  },

  // --- TIER CARD 5 (Green, Subscribe) ---
  {
    id: 5,
    title: "My VVIP Lounge ❤️️️",
    backgroundImage: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
    isFeatured: false, // Note: HTML snippet had hidden featured tag logic, but layout supports it
    stats: { video: 100, image: 80, audio: 70 },

    theme: {
      textPrimary: "text-[#07F468] dark:text-[#06c454]", // Green text
      textSecondary: "text-[#FFED29] dark:text-[#FFED29]", // Standard white secondary
      shadow: "shadow-[0px_0px_80px_0px_#07F46840,0px_0px_8px_0px_#07F46880]", // Green Shadow
      barColor: "bg-[#FFED29] dark:bg-[#ffee37]",
      barTextColor: "text-[#FFED29]",
      featuredBg: "bg-black dark:bg-[#181a1b]", // Featured tag is black in Tier 5
      buttonBgImage: "url('https://i.ibb.co.com/B5M5ccbD/union-green.webp')",
        flashLabel: "text-[#07F468] dark:text-[#06c454]", 
      flashText: "#07F468",
      textReNew:"text-white dark:text-[#e8e6e3]",
      featuredText:"text-[#07F468] dark:text-[#06c454]"

    },

    plans: [
      { id: '1d', label: '1 day', price: '55.86', discount: null },
      { id: '1m', label: '1 month', price: '55.86', discount: '-5%' },
      { id: '6m', label: '6 month', price: '55.86', discount: '-50%', isMostValue: true },
      { id: '1y', label: '1 year', price: '55.86', discount: '-5%' },
    ],
    defaultPlan: '6m',
    flashSale: { active: true, endsIn: "02:13:07", originalPrice: "$111.72" }, 
    description: "Welcome to Jenny’s  VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️ Welcome to Jenny’s  VIP Lounge! Welcome to Jenny’s  VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️ Welcome to Jenny’s  VIP Lounge! Welcome to Jenny’s  VIP Lounge! This plan includes everything in Basic/VIP Lounge, plus: Behind the scene of every shot! stuff i wore from the shot for sale! Talk to me 24/7️❤️️️ Welcome to Jenny’s  VIP Lounge! ...",

    footer: {
      type: 'subscribe', // IMPORTANT: Triggers Green Subscribe Layout
      buttonText: "SUBSCRIBE",
      progress: { visible: false }
    }
  }
];