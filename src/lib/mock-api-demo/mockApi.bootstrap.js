import mockApiConfig from "./mockApi.config.js";
import MockApi from "./MockApi.js";

const mockApi = new MockApi(mockApiConfig);

// Expose globally for quick experiments
window.mockApi = mockApi;

// Example wiring: replacing some app-level API helper
window.appApi = {
  login(credentials) {
    return mockApi.post("/auth/login", credentials);
  },
  getProfiles(params) {
    return mockApi.get("/profiles", { query: params || {} });
  },
  deleteProfile(id) {
    return mockApi.delete("/profiles/delete", { query: { id: id } });
  }
};


// Then anywhere in your vanilla JS app you can do:

// // example usage:
// async function loginExample() {
//   const response = await window.appApi.login({
//     email: "ui@example.com",
//     password: "password123"
//   });

//   const data = await response.json();
//   console.log("UI login example:", response.status, data);
// }