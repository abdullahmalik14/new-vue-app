export async function fetchDashboardNavData() {
  // Simulate API delay for mock/demo purposes
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    badges: {
      "orders": "12",
      "chats": "5"
    },
    tabBadges: {
      "all": "79",
      "unread": "12",
      "customRequests": "3",
      "account": "1"
    },
    notifications: 79,
    profileSummary: {
      name: "lindenMay",
      handle: "@linden",
      status: "I am all dressed up ready to eat some chicken 💋",
      avatarUrl: "https://i.ibb.co/C07Bcd7/ninja.png"
    }
  };
}
