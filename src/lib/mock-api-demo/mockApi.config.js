// mockApi.config.js (or a plain JS object you import)

/**
 * Global Mock API configuration
 * - Single file
 * - Supports GET / POST / DELETE
 * - Supports delay, character limits, retry behaviour, datasets
 */

const mockApiConfig = {
  meta: {
    configVersion: "1.0.0",
    description: "Global mock API configuration for testing.",
  },

  defaults: {
    delayMs: 200,
    maxRetries: 3,
    successOnAttempt: null,
    characterLimits: {
      defaultMin: 0,
      defaultMax: 1000,
    },
  },

  /**
   * Big / reusable data blobs.
   * These are referenced by key from the route configs.
   */
  datasets: {
    // Simple, small dataset example
    simpleProfiles: [
      {
        id: "user-1",
        name: "Alice Tester",
        age: 29,
        country: "AU",
        role: "tester",
      },
      {
        id: "user-2",
        name: "Bob Developer",
        age: 34,
        country: "US",
        role: "developer",
      },
      {
        id: "user-3",
        name: "Charlie Manager",
        age: 41,
        country: "UK",
        role: "manager",
      },
    ],

    // Larger dataset example (pretend this is 200+ rows in a real file)
    largeProfiles: [
      { id: "p-001", name: "User 001", age: 22, country: "AU", role: "member" },
      { id: "p-002", name: "User 002", age: 25, country: "US", role: "member" },
      {
        id: "p-003",
        name: "User 003",
        age: 30,
        country: "CA",
        role: "creator",
      },
      {
        id: "p-004",
        name: "User 004",
        age: 27,
        country: "AU",
        role: "creator",
      },
      { id: "p-005", name: "User 005", age: 33, country: "UK", role: "member" },
      { id: "p-006", name: "User 006", age: 29, country: "DE", role: "member" },
      {
        id: "p-007",
        name: "User 007",
        age: 31,
        country: "AU",
        role: "moderator",
      },
      { id: "p-008", name: "User 008", age: 24, country: "US", role: "member" },
      {
        id: "p-009",
        name: "User 009",
        age: 26,
        country: "CA",
        role: "creator",
      },
      { id: "p-010", name: "User 010", age: 38, country: "AU", role: "member" },
      // ...extend to 200+ entries in a real test setup
    ],

    // Usernames dataset for username-exists endpoint
    existingUsernames: [
      "john_doe",
      "jane_smith",
      "alice_wonder",
      "bob_developer",
      "charlie_brown",
      "diana_prince",
      "edward_norton",
      "fiona_apples",
      "george_clooney",
      "helen_mirren",
      "testuser",
      "admin",
      "demo",
      "user123",
      "coolguy",
    ],

    // Chat History dataset for testing mock fetch
    chatHistory: [
      {
        id: "msg-hist-1",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "Hey there! Thanks for subscribing to my profile! 💖",
        time: "18:00",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
      {
        id: "msg-hist-2",
        chatId: "shared-chat",
        senderId: "fan",
        senderName: "Fan",
        text: "Hi Jenny! I'm a huge fan! 😍",
        time: "18:05",
        avatar: "https://i.pravatar.cc/150?img=11",
        type: "text",
      },
      {
        id: "msg-hist-3",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "Aww, thank you so much! That means a lot. How is your week going?",
        time: "18:10",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
      {
        id: "msg-hist-4",
        chatId: "shared-chat",
        senderId: "fan",
        senderName: "Fan",
        text: "It's going great! Just watching some of your live streams.",
        time: "18:12",
        avatar: "https://i.pravatar.cc/150?img=11",
        type: "text",
      },
      {
        id: "msg-hist-5",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "Oh nice! Which one is your favorite?",
        time: "18:20",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
      {
        id: "msg-hist-6",
        chatId: "shared-chat",
        senderId: "fan",
        senderName: "Fan",
        text: "Definitely the one from last Saturday where you sang!",
        time: "18:22",
        avatar: "https://i.pravatar.cc/150?img=11",
        type: "text",
      },
      {
        id: "msg-hist-7",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "Haha I was so nervous doing that! Glad you liked it.",
        time: "18:25",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
      {
        id: "msg-hist-8",
        chatId: "shared-chat",
        senderId: "fan",
        senderName: "Fan",
        text: "You should sing more often! Your voice is amazing.",
        time: "18:26",
        avatar: "https://i.pravatar.cc/150?img=11",
        type: "text",
      },
      {
        id: "msg-hist-9",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "Maybe I will! I have some new songs I'm working on.",
        time: "18:30",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
      {
        id: "msg-hist-10",
        chatId: "shared-chat",
        senderId: "fan",
        senderName: "Fan",
        text: "Can't wait to hear them! Are you doing a live stream tonight?",
        time: "18:32",
        avatar: "https://i.pravatar.cc/150?img=11",
        type: "text",
      },
      {
        id: "msg-hist-11",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "Yes! At 9 PM. Don't forget to tune in 😉",
        time: "18:40",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
      {
        id: "msg-hist-12",
        chatId: "shared-chat",
        senderId: "fan",
        senderName: "Fan",
        text: "I'll be there! Can I request a song?",
        time: "18:41",
        avatar: "https://i.pravatar.cc/150?img=11",
        type: "text",
      },
      {
        id: "msg-hist-13",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "Of course! What do you want to hear?",
        time: "18:45",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
      {
        id: "msg-hist-14",
        chatId: "shared-chat",
        senderId: "fan",
        senderName: "Fan",
        text: "How about 'Blank Space' by Taylor Swift?",
        time: "18:46",
        avatar: "https://i.pravatar.cc/150?img=11",
        type: "text",
      },
      {
        id: "msg-hist-15",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "Ooh classic! I'll put it on the list for tonight.",
        time: "18:50",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
      {
        id: "msg-hist-16",
        chatId: "shared-chat",
        senderId: "fan",
        senderName: "Fan",
        text: "Awesome! Thank you so much!",
        time: "18:52",
        avatar: "https://i.pravatar.cc/150?img=11",
        type: "text",
      },
      {
        id: "msg-hist-17",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "Have a great evening! See you at 9!",
        time: "19:00",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
      {
        id: "msg-hist-18",
        chatId: "shared-chat",
        senderId: "fan",
        senderName: "Fan",
        text: "You too! Bye!",
        time: "19:01",
        avatar: "https://i.pravatar.cc/150?img=11",
        type: "text",
      },
      {
        id: "msg-hist-19",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "Hey again! Stream is starting in 10 mins!",
        time: "20:50",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
      {
        id: "msg-hist-20",
        chatId: "shared-chat",
        senderId: "fan",
        senderName: "Fan",
        text: "Ready!!!",
        time: "20:55",
        avatar: "https://i.pravatar.cc/150?img=11",
        type: "text",
      },
      {
        id: "msg-hist-21",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "Hey! Did you enjoy the stream?",
        time: "22:10",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
      {
        id: "msg-hist-22",
        chatId: "shared-chat",
        senderId: "fan",
        senderName: "Fan",
        text: "Yes! It was amazing! You sang my request perfectly!",
        time: "22:15",
        avatar: "https://i.pravatar.cc/150?img=11",
        type: "text",
      },
      {
        id: "msg-hist-23",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "I'm so glad you liked it! It was fun to sing.",
        time: "22:20",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
      {
        id: "msg-hist-24",
        chatId: "shared-chat",
        senderId: "fan",
        senderName: "Fan",
        text: "It really was. Good night!",
        time: "22:22",
        avatar: "https://i.pravatar.cc/150?img=11",
        type: "text",
      },
      {
        id: "msg-hist-25",
        chatId: "shared-chat",
        senderId: "jenny",
        senderName: "Jenny Honey~",
        text: "Good night! Sweet dreams! 😴",
        time: "22:30",
        avatar: "https://i.pravatar.cc/150?img=5",
        type: "text",
      },
    ],
  },

  /**
   * Route configurations
   */
  routes: {
    "/auth/login": {
      description: "User login with email/password.",
      methods: {
        POST: {
          description: "Login attempt using email and password.",
          enabled: true,
          delayMs: 300,

          requiredFields: ["email", "password"],

          characterLimits: {
            email: { min: 5, max: 120 },
            password: { min: 8, max: 128 },
          },

          retryLogic: {
            maxAttempts: 3,
            successOnAttempt: 2,
            failureScenario: "invalidCredentials",
            resetAfterSuccess: true,
          },

          scenarios: [
            {
              name: "success",
              status: 200,
              body: {
                userId: "user-123",
                email: "{{request.body.email}}",
                token: "mock-token-abc",
              },
            },
            {
              name: "invalidCredentials",
              status: 401,
              body: {
                error: "INVALID_CREDENTIALS",
                message: "Email or password is incorrect.",
              },
            },
            {
              name: "validationError",
              status: 422,
              body: {
                errors: {
                  email: "Email is required.",
                  password: "Password is required.",
                },
              },
            },
          ],

          defaultScenario: "success",
        },
      },
    },

    "/profile/simple": {
      description: "Return a small static list of profiles.",
      methods: {
        GET: {
          description: "Simple GET with small dataset.",
          enabled: true,
          delayMs: 150,
          requiresAuth: false,

          retryLogic: {
            maxAttempts: 1,
            successOnAttempt: 1,
            failureScenario: "serverError",
            resetAfterSuccess: true,
          },

          dataSource: {
            dataSourceKey: "simpleProfiles",
            paging: {
              enabled: false,
              queryLimitKey: "limit",
              queryOffsetKey: "offset",
              defaultLimit: 10,
              maxLimit: 50,
            },
            allowQueryFilter: false,
            allowedFilterFields: [],
          },

          scenarios: [
            {
              name: "success",
              status: 200,
              body: {
                items: "{{datasetSlice}}",
                total: "{{datasetTotal}}",
              },
            },
            {
              name: "serverError",
              status: 500,
              body: {
                error: "INTERNAL_SERVER_ERROR",
                message: "Mocked failure for simple profiles.",
              },
            },
          ],

          defaultScenario: "success",
        },
      },
    },

    "/profiles": {
      description:
        "Fetch a list of user profiles (large dataset) with filters and paging.",
      methods: {
        GET: {
          description: "Return profiles, supports query filters and paging.",
          enabled: true,
          delayMs: 400,
          requiresAuth: true,

          retryLogic: {
            maxAttempts: 3,
            successOnAttempt: 1,
            failureScenario: "temporaryError",
            resetAfterSuccess: false,
          },

          dataSource: {
            dataSourceKey: "largeProfiles",
            paging: {
              enabled: true,
              queryLimitKey: "limit",
              queryOffsetKey: "offset",
              defaultLimit: 5,
              maxLimit: 50,
            },
            allowQueryFilter: true,
            allowedFilterFields: ["country", "role"],
          },

          scenarios: [
            {
              name: "success",
              status: 200,
              body: {
                items: "{{datasetSlice}}",
                total: "{{datasetTotal}}",
              },
            },
            {
              name: "temporaryError",
              status: 503,
              body: {
                error: "TEMPORARY_UNAVAILABLE",
                message: "Upstream profile service is temporarily unavailable.",
              },
            },
          ],

          defaultScenario: "success",
        },
      },
    },

    "/profiles/delete": {
      description: "Delete a profile by ID (POST or DELETE for testing).",
      methods: {
        DELETE: {
          description: "DELETE a profile by id in query or body.",
          enabled: true,
          delayMs: 500,
          requiresAuth: true,

          requiredFields: ["id"],

          characterLimits: {
            id: { min: 1, max: 64 },
          },

          retryLogic: {
            maxAttempts: 3,
            successOnAttempt: 3,
            failureScenario: "serverError",
            resetAfterSuccess: true,
          },

          scenarios: [
            {
              name: "success",
              status: 204,
              body: null,
            },
            {
              name: "forbidden",
              status: 403,
              body: {
                error: "FORBIDDEN",
                message: "You are not allowed to delete this profile.",
              },
            },
            {
              name: "serverError",
              status: 500,
              body: {
                error: "INTERNAL_SERVER_ERROR",
                message: "Unexpected error while deleting profile.",
              },
            },
            {
              name: "validationError",
              status: 422,
              body: {
                errors: {
                  id: "Profile id is required.",
                },
              },
            },
          ],

          defaultScenario: "success",
        },
      },
    },

    "/users/new-sign-up": {
      description:
        "Track new user sign-up after Cognito login (silent background call).",
      methods: {
        POST: {
          description:
            "Record new sign-up with IP, browser, userID, email, and action.",
          enabled: true,
          delayMs: 250,
          requiresAuth: false,

          requiredFields: ["userId", "email", "action", "ip", "browser"],

          characterLimits: {
            userId: { min: 1, max: 128 },
            email: { min: 5, max: 255 },
            action: { min: 1, max: 50 },
            ip: { min: 7, max: 45 },
            browser: { min: 1, max: 500 },
          },

          retryLogic: {
            maxAttempts: 2,
            successOnAttempt: 1,
            failureScenario: "serverError",
            resetAfterSuccess: true,
          },

          scenarios: [
            {
              name: "success",
              status: 200,
              body: {
                success: true,
                message: "Sign-up tracked successfully",
                userId: "{{request.body.userId}}",
                email: "{{request.body.email}}",
                action: "{{request.body.action}}",
                ip: "{{request.body.ip}}",
                browser: "{{request.body.browser}}",
              },
            },
            {
              name: "serverError",
              status: 500,
              body: {
                error: "INTERNAL_SERVER_ERROR",
                message: "Failed to track sign-up.",
              },
            },
            {
              name: "validationError",
              status: 422,
              body: {
                errors: {
                  userId: "User ID is required.",
                  email: "Email is required.",
                  action: "Action must be 'signUp'.",
                },
              },
            },
          ],

          defaultScenario: "success",
        },
      },
    },

    "/users/confirm-email": {
      description: "Confirm user email after Cognito confirmation.",
      methods: {
        POST: {
          description:
            "Confirm email with userID and action, used with Promise.all alongside Cognito.",
          enabled: true,
          delayMs: 400,
          requiresAuth: false,

          requiredFields: ["userId", "action"],

          characterLimits: {
            userId: { min: 1, max: 128 },
            action: { min: 1, max: 50 },
          },

          retryLogic: {
            maxAttempts: 3,
            successOnAttempt: 1,
            failureScenario: "serverError",
            resetAfterSuccess: true,
          },

          scenarios: [
            {
              name: "success",
              status: 200,
              body: {
                success: true,
                message: "Email confirmed successfully",
                userId: "{{request.body.userId}}",
                action: "{{request.body.action}}",
                confirmed: true,
              },
            },
            {
              name: "serverError",
              status: 500,
              body: {
                error: "INTERNAL_SERVER_ERROR",
                message: "Failed to confirm email.",
              },
            },
            {
              name: "validationError",
              status: 422,
              body: {
                errors: {
                  userId: "User ID is required.",
                  action: "Action must be 'confirmEmail'.",
                },
              },
            },
          ],

          defaultScenario: "success",
        },
      },
    },

    "/users/sign-up/onboarding": {
      description:
        "Submit onboarding details after user completes onboarding form.",
      methods: {
        POST: {
          description:
            "Submit onboarding with userID, jwt token, role, username, and action.",
          enabled: true,
          delayMs: 350,
          requiresAuth: false,

          requiredFields: ["userId", "jwtToken", "role", "username", "action"],

          characterLimits: {
            userId: { min: 1, max: 128 },
            jwtToken: { min: 10, max: 2000 },
            role: { min: 1, max: 50 },
            username: { min: 3, max: 50 },
            action: { min: 1, max: 50 },
          },

          retryLogic: {
            maxAttempts: 2,
            successOnAttempt: 1,
            failureScenario: "serverError",
            resetAfterSuccess: true,
          },

          scenarios: [
            {
              name: "success",
              status: 200,
              body: {
                success: true,
                message: "Onboarding completed successfully",
                userId: "{{request.body.userId}}",
                username: "{{request.body.username}}",
                role: "{{request.body.role}}",
                action: "{{request.body.action}}",
              },
            },
            {
              name: "serverError",
              status: 500,
              body: {
                error: "INTERNAL_SERVER_ERROR",
                message: "Failed to save onboarding details.",
              },
            },
            {
              name: "validationError",
              status: 422,
              body: {
                errors: {
                  userId: "User ID is required.",
                  username: "Username must be between 3 and 50 characters.",
                  action: "Action must be 'signUpOnboarding'.",
                },
              },
            },
          ],

          defaultScenario: "success",
        },
      },
    },

    "/users/username-exists": {
      description: "Check if username exists (partial match) as user types.",
      methods: {
        GET: {
          description: "Check username availability with partial matching.",
          enabled: true,
          delayMs: 200,
          requiresAuth: false,

          dataSource: {
            dataSourceKey: "existingUsernames",
            paging: {
              enabled: false,
            },
            allowQueryFilter: false,
            allowedFilterFields: [],
          },

          retryLogic: {
            maxAttempts: 1,
            successOnAttempt: 1,
            failureScenario: "serverError",
            resetAfterSuccess: true,
          },

          scenarios: [
            {
              name: "success",
              status: 200,
              body: {
                exists: true,
                matches: "{{datasetSlice}}",
                username: "{{request.query.username}}",
                message:
                  "Username check completed. Returns dataset for matching.",
              },
            },
            {
              name: "notFound",
              status: 200,
              body: {
                exists: false,
                matches: [],
                username: "{{request.query.username}}",
                message: "Username is available",
              },
            },
            {
              name: "serverError",
              status: 500,
              body: {
                error: "INTERNAL_SERVER_ERROR",
                message: "Failed to check username availability.",
              },
            },
            {
              name: "validationError",
              status: 422,
              body: {
                errors: {
                  username: "Username parameter is required.",
                },
              },
            },
          ],

          defaultScenario: "success",
        },
      },
    },

    "/users/sign-up/kyc": {
      description: "Submit KYC completion for creators after KYC process.",
      methods: {
        POST: {
          description:
            "Submit KYC data with userID, kyc payload array, and action (kycSuccess or kycFail).",
          enabled: true,
          delayMs: 450,
          requiresAuth: false,

          requiredFields: ["userId", "kycPayload", "action"],

          characterLimits: {
            userId: { min: 1, max: 128 },
            action: { min: 1, max: 50 },
          },

          retryLogic: {
            maxAttempts: 2,
            successOnAttempt: 1,
            failureScenario: "serverError",
            resetAfterSuccess: true,
          },

          scenarios: [
            {
              name: "success",
              status: 200,
              body: {
                success: true,
                message: "KYC data processed successfully",
                userId: "{{request.body.userId}}",
                action: "{{request.body.action}}",
                kycStatus: "{{request.body.action}}",
              },
            },
            {
              name: "kycFail",
              status: 200,
              body: {
                success: false,
                message: "KYC verification failed",
                userId: "{{request.body.userId}}",
                action: "{{request.body.action}}",
                kycStatus: "failed",
              },
            },
            {
              name: "serverError",
              status: 500,
              body: {
                error: "INTERNAL_SERVER_ERROR",
                message: "Failed to process KYC data.",
              },
            },
            {
              name: "validationError",
              status: 422,
              body: {
                errors: {
                  userId: "User ID is required.",
                  kycPayload: "KYC payload array is required.",
                  action: "Action must be 'kycSuccess' or 'kycFail'.",
                },
              },
            },
          ],

          defaultScenario: "success",
        },
      },
    },

    "/chat/messages": {
      description: "Fetch chat history for a given chatId.",
      methods: {
        GET: {
          description: "Returns an array of messages.",
          enabled: true,
          delayMs: 300,
          requiresAuth: false,

          dataSource: {
            dataSourceKey: "chatHistory",
            paging: {
              enabled: true,
              queryLimitKey: "limit",
              queryOffsetKey: "offset",
              defaultLimit: 20,
              maxLimit: 50,
            },
            allowQueryFilter: true,
            allowedFilterFields: ["chatId"],
          },

          scenarios: [
            {
              name: "success",
              status: 200,
              body: {
                success: true,
                messages: "{{datasetSlice}}",
                total: "{{datasetTotal}}",
              },
            },
          ],
          defaultScenario: "success",
        },
      },
    },

    "/chat/send": {
      description: "Send a new chat message.",
      methods: {
        POST: {
          description: "Receives a message, validates it, and 'saves' it.",
          enabled: true,
          delayMs: 200,
          requiresAuth: false,

          requiredFields: ["chatId", "senderId", "text"],

          scenarios: [
            {
              name: "success",
              status: 200,
              body: {
                success: true,
                message: "Message sent successfully",
                data: {
                  id: "{{request.body.id}}",
                  chatId: "{{request.body.chatId}}",
                  senderId: "{{request.body.senderId}}",
                  text: "{{request.body.text}}",
                  time: "{{request.body.time}}",
                  type: "{{request.body.type}}",
                  systemType: "{{request.body.systemType}}",
                  senderName: "{{request.body.senderName}}",
                },
              },
            },
            {
              name: "validationError",
              status: 422,
              body: {
                errors: {
                  text: "Message text cannot be empty.",
                },
              },
            },
          ],
          defaultScenario: "success",
        },
      },
    },
  },
};

export default mockApiConfig;
