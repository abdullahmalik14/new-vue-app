import { createEventFlow } from "@/services/events/flows/createEventFlow.js";
import { fetchCreatorEventsFlow } from "@/services/events/flows/fetchCreatorEventsFlow.js";
import { fetchEventFlow } from "@/services/events/flows/fetchEventFlow.js";
import { createEventMapper } from "@/services/events/mappers/createEventMapper.js";
import { mapFetchCreatorEventsFromResponse } from "@/services/events/mappers/fetchCreatorEventsMapper.js";
import { createChatFlow } from "@/services/chat/flows/createChatFlow.js";
import { getChatFlow } from "@/services/chat/flows/getChatFlow.js";
import { createGroupChatFlow } from "@/services/chat/flows/createGroupChatFlow.js";
import { addChatParticipantFlow } from "@/services/chat/flows/addChatParticipantFlow.js";
import { fetchGroupUserIdsFlow } from "@/services/chat/flows/fetchGroupUserIdsFlow.js";
import { sendMessageFlow } from "@/services/chat/flows/sendMessageFlow.js";
import { sendProductRecommendationFlow } from "@/services/chat/flows/sendProductRecommendationFlow.js";
import { fetchProductRecommendationStatusFlow } from "@/services/chat/flows/fetchProductRecommendationStatusFlow.js";
import { fetchMessagesFlow } from "@/services/chat/flows/fetchMessagesFlow.js";
import { fetchUserChatsFlow } from "@/services/chat/flows/fetchUserChatsFlow.js";
import { fetchChatUsersDataFlow } from "@/services/chat/flows/fetchChatUsersDataFlow.js";
import { markMessageDeliveredFlow } from "@/services/chat/flows/markMessageDeliveredFlow.js";
import { markMessageReadFlow } from "@/services/chat/flows/markMessageReadFlow.js";
import { getUnreadCountFlow } from "@/services/chat/flows/getUnreadCountFlow.js";
import { sendBookingRequestMessageFlow } from "@/services/chat/flows/sendBookingRequestMessageFlow.js";
import { updateBookingRequestMessageFlow } from "@/services/chat/flows/updateBookingRequestMessageFlow.js";
import { updateMessageFlow } from "@/services/chat/flows/updateMessageFlow.js";
import { sendChatActivityLogFlow } from "@/services/chat/flows/sendChatActivityLogFlow.js";
import { pinMessageFlow } from "@/services/chat/flows/pinMessageFlow.js";
import { fetchSpendingRequirementItemsFlow } from "@/services/events/flows/fetchSpendingRequirementItemsFlow.js";
import { mapFetchSpendingRequirementItemsFromResponse } from "@/services/events/mappers/fetchSpendingRequirementItemsMapper.js";
import {
  validateFetchCreatorEventsPayload,
  validateFetchCreatorEventsResponse,
} from "@/services/events/validators/eventFlowValidators.js";
import { fetchCreatorBookingContextFlow } from "@/services/bookings/flows/fetchCreatorBookingContextFlow.js";
import { mapFetchCreatorBookingContextFromResponse } from "@/services/bookings/mappers/fetchCreatorBookingContextMapper.js";
import { fetchDashboardBookingContextFlow } from "@/services/bookings/flows/fetchDashboardBookingContextFlow.js";
import { mapFetchDashboardBookingContextFromResponse } from "@/services/bookings/mappers/fetchDashboardBookingContextMapper.js";
import { createBookingFlow } from "@/services/bookings/flows/createBookingFlow.js";
import { mapCreateBookingToRequest } from "@/services/bookings/mappers/createBookingMapper.js";
import { createTemporaryHoldFlow } from "@/services/bookings/flows/createTemporaryHoldFlow.js";
import { getTemporaryHoldStatusFlow } from "@/services/bookings/flows/getTemporaryHoldStatusFlow.js";
import { releaseTemporaryHoldFlow } from "@/services/bookings/flows/releaseTemporaryHoldFlow.js";
import { updateTemporaryHoldUserFlow } from "@/services/bookings/flows/updateTemporaryHoldUserFlow.js";
import { reviewPendingBookingFlow } from "@/services/bookings/flows/reviewPendingBookingFlow.js";
import { cancelBookingFlow } from "@/services/bookings/flows/cancelBookingFlow.js";
import { fetchBookingFlow } from "@/services/bookings/flows/fetchBookingFlow.js";
import { updateBookingFlow } from "@/services/bookings/flows/updateBookingFlow.js";
import { mapCreateTemporaryHoldToRequest } from "@/services/bookings/mappers/createTemporaryHoldMapper.js";
import { mapReviewPendingBookingToRequest } from "@/services/bookings/mappers/reviewPendingBookingMapper.js";
import { mapCancelBookingToRequest } from "@/services/bookings/mappers/cancelBookingMapper.js";
import { fetchCartFlow } from "@/services/cart/flows/fetchCartFlow.js";
import { addItemToCartFlow } from "@/services/cart/flows/addItemToCartFlow.js";
import { removeItemFromCartFlow } from "@/services/cart/flows/removeItemFromCartFlow.js";
import { updateItemQuantityFlow } from "@/services/cart/flows/updateItemQuantityFlow.js";
import { renameCartFlow } from "@/services/cart/flows/renameCartFlow.js";
import { applyCouponFlow } from "@/services/cart/flows/applyCouponFlow.js";
import { removeCouponFlow } from "@/services/cart/flows/removeCouponFlow.js";
import { applyFeesFlow } from "@/services/cart/flows/applyFeesFlow.js";
import { setAsDefaultFlow } from "@/services/cart/flows/setAsDefaultFlow.js";
import { mergeGuestCartFlow } from "@/services/cart/flows/mergeGuestCartFlow.js";
import { attachLiveDataFlow } from "@/services/cart/flows/attachLiveDataFlow.js";
import { getAllCartsFlow } from "@/services/cart/flows/getAllCartsFlow.js";
import { remindAbandonedCartsFlow } from "@/services/cart/flows/remindAbandonedCartsFlow.js";
import { mapRenegotiateBookingToRequest } from "@/services/bookings/mappers/renegotiateBookingMapper.js";
import { mapRescheduleBookingToRequest } from "@/services/bookings/mappers/rescheduleBookingMapper.js";
import { mapUpdateBookingMetaToRequest } from "@/services/bookings/mappers/updateBookingMetaMapper.js";
import {
  validateFetchCatalogPayload,
  validateFetchCatalogResponse,
  validateFetchAvailabilityPayload,
  validateFetchAvailabilityResponse,
  validateCreateReservationPayload,
  validateCreateReservationResponse,
  validateConfirmReservationPayload,
  validateCancelReservationPayload,
} from "@/services/rental/validators/rentalFlowValidators.js";
import { fetchRentalCatalogFlow } from "@/services/rental/flows/fetchRentalCatalogFlow.js";
import { fetchRentalAvailabilityFlow } from "@/services/rental/flows/fetchRentalAvailabilityFlow.js";
import { createRentalReservationFlow } from "@/services/rental/flows/createRentalReservationFlow.js";
import { confirmRentalReservationFlow } from "@/services/rental/flows/confirmRentalReservationFlow.js";
import { cancelRentalReservationFlow } from "@/services/rental/flows/cancelRentalReservationFlow.js";
import { flushRentalClientCacheFlow } from "@/services/rental/flows/flushRentalClientCacheFlow.js";
import {
  mapRentalCatalogFromResponse,
  mapRentalAvailabilityFromResponse,
} from "@/services/rental/mappers/rentalReadMappers.js";
import {
  mapCreateReservationToRequest,
  mapConfirmReservationToRequest,
  mapCancelReservationToRequest,
} from "@/services/rental/mappers/rentalWriteMappers.js";
import { fetchOrdersFlow } from "@/services/orders/flows/fetchOrdersFlow.js";
import {
  mapOrdersFromResponse,
  mapOrderToRequest,
} from "@/services/orders/mappers/ordersMapper.js";
import {
  uploadMediaFlow,
  submitUploaderFlow,
} from "@/services/orders/flows/mediaUploaderFlows.js";

export const flowRegistry = {
  "events.fetchEvent": {
    flowKind: "read",
    flow: fetchEventFlow,
    pipeline: {
      timeouts: { requestMs: 8000, totalFlowMs: 10000 },
      retry: { enabled: false },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [],
      uiErrorMap: {},
    },
  },
  "events.fetchCreatorEvents": {
    flowKind: "read",
    flow: fetchCreatorEventsFlow,
    mapper: { fromResponse: mapFetchCreatorEventsFromResponse },
    validators: {
      payload: validateFetchCreatorEventsPayload,
      response: validateFetchCreatorEventsResponse,
    },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 22000 },
      retry: {
        enabled: true,
        maxAttempts: 2,
        baseDelayMs: 250,
        maxDelayMs: 2000,
        jitterRatio: 0.15,
      },
      etag: { enabled: true, varyByPayload: true },
      localCache: {
        enabled: true,
        ttlMs: 30000,
        version: 1,
        varyByPayload: true,
      },
      readFrom: {
        enabled: true,
        ttlMs: 30000,
        mode: "staleWhileRevalidate",
        priority: ["stateEngine", "local"],
        sources: [
          {
            type: "stateEngine",
            key: "events.cachedResponse",
            etagKey: "events.meta.etag",
            updatedAtKey: "events.meta.updatedAt",
          },
          {
            type: "local",
            key: "events:creator:list",
            ttlMs: 30000,
            version: 1,
            etagKey: "meta.etag",
            updatedAtKey: "meta.updatedAt",
          },
        ],
      },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        {
          type: "stateEngine",
          key: "events.cachedResponse",
          mode: "set",
          hydrateOnReadHit: true,
        },
        {
          type: "stateEngine",
          key: "events.list",
          mode: "set",
          select: "items",
          hydrateOnReadHit: true,
        },
        {
          type: "stateEngine",
          key: "events.meta",
          mode: "set",
          select: "meta",
          hydrateOnReadHit: true,
        },
        {
          type: "stateEngine",
          key: "events.meta",
          mode: "merge",
          value: { updatedAt: "@now" },
          hydrateOnReadHit: true,
        },
        {
          type: "local",
          key: "events:creator:list",
          ttlMs: 30000,
          version: 1,
          hydrateOnReadHit: true,
        },
      ],
      onNotModified: [
        {
          type: "stateEngine",
          key: "events.meta",
          mode: "merge",
          value: { checkedAt: "@now" },
        },
      ],
      uiErrorMap: {
        MISSING_CREATOR_ID: "Creator id is required before loading events.",
        FETCH_CREATOR_EVENTS_FAILED: "Could not load events right now.",
      },
    },
    refresh: {
      enabled: true,
      intervalMs: 60000,
      scopeKey: "events.fetchCreatorEvents",
    },
  },

  "events.fetchEvent": {
    flowKind: "read",
    flow: fetchEventFlow,
  },

  "events.createEvent": {
    flowKind: "write",
    flow: createEventFlow,
    mapper: { toRequest: createEventMapper },
    pipeline: {
      timeouts: { requestMs: 15000, totalFlowMs: 24000 },
      retry: { enabled: false },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: true },
      idempotency: {
        enabled: true,
        headerName: "Idempotency-Key",
        keyFrom: "idempotencyKey",
      },
      destinations: [
        {
          type: "stateEngine",
          key: "events.lastCreated",
          mode: "set",
          select: "item",
        },
        {
          type: "stateEngine",
          key: "events.list",
          mode: "push",
          select: "item",
        },
        {
          type: "stateEngine",
          key: "events.meta",
          mode: "merge",
          value: { lastCreateAt: "@now" },
        },
        { type: "localFlush", key: "events:creator:list" },
      ],
      uiErrorMap: {
        CREATE_EVENT_FAILED: "Could not create event. Please try again.",
        CREATE_EVENT_UNEXPECTED: "Unexpected error while creating event.",
      },
    },
  },

  "events.fetchSpendingRequirementItems": {
    flowKind: "read",
    flow: fetchSpendingRequirementItemsFlow,
    mapper: { fromResponse: mapFetchSpendingRequirementItemsFromResponse },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 22000 },
      retry: {
        enabled: true,
        maxAttempts: 1,
        baseDelayMs: 250,
        maxDelayMs: 1200,
        jitterRatio: 0.1,
      },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      uiErrorMap: {
        MISSING_CREATOR_ID:
          "Creator id is required before loading spending requirement items.",
        MISSING_SPENDING_REQUIREMENT_TYPE:
          "Item type is required before loading spending requirement items.",
        FETCH_SPENDING_REQUIREMENT_ITEMS_FAILED:
          "Could not load spending requirement items right now.",
        FETCH_SPENDING_REQUIREMENT_ITEMS_UNEXPECTED:
          "Unexpected error while loading spending requirement items.",
      },
    },
  },

  "bookings.fetchCreatorBookingContext": {
    flowKind: "read",
    flow: fetchCreatorBookingContextFlow,
    mapper: { fromResponse: mapFetchCreatorBookingContextFromResponse },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 22000 },
      retry: {
        enabled: true,
        maxAttempts: 2,
        baseDelayMs: 250,
        maxDelayMs: 2000,
        jitterRatio: 0.15,
      },
      etag: { enabled: true, varyByPayload: true },
      localCache: {
        enabled: true,
        ttlMs: 30000,
        version: 1,
        varyByPayload: true,
      },
      readFrom: {
        enabled: true,
        ttlMs: 30000,
        mode: "staleWhileRevalidate",
        priority: ["stateEngine"],
        sources: [
          {
            type: "stateEngine",
            key: "fanBooking.catalog.cachedResponse",
            etagKey: "fanBooking.catalog.meta.etag",
            updatedAtKey: "fanBooking.catalog.meta.updatedAt",
          },
        ],
      },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        { type: "stateEngine", key: "fanBooking.catalog.cachedResponse", mode: "set", hydrateOnReadHit: true },
        { type: "stateEngine", key: "fanBooking.catalog.events", mode: "set", select: "events", hydrateOnReadHit: true },
        { type: "stateEngine", key: "fanBooking.catalog.rawEvents", mode: "set", select: "rawEvents", hydrateOnReadHit: true },
        { type: "stateEngine", key: "fanBooking.catalog.bookedSlots", mode: "set", select: "bookedSlots", hydrateOnReadHit: true },
        { type: "stateEngine", key: "fanBooking.catalog.bookedSlotsIndex", mode: "set", select: "bookedSlotsIndex", hydrateOnReadHit: true },
        { type: "stateEngine", key: "fanBooking.context.isFirstBookingForCreator", mode: "set", select: "isFirstBookingForCreator", hydrateOnReadHit: true },
        { type: "stateEngine", key: "fanBooking.catalog.meta", mode: "set", select: "meta", hydrateOnReadHit: true },
        { type: "stateEngine", key: "fanBooking.catalog.meta", mode: "merge", value: { updatedAt: "@now" }, hydrateOnReadHit: true },
      ],
      onNotModified: [
        {
          type: "stateEngine",
          key: "fanBooking.catalog.meta",
          mode: "merge",
          value: { checkedAt: "@now" },
        },
      ],
      uiErrorMap: {
        MISSING_CREATOR_ID:
          "Creator id is required before loading booking context.",
        FETCH_CREATOR_EVENTS_FAILED: "Could not load events right now.",
        FETCH_CREATOR_BOOKED_SLOTS_FAILED: "Could not load booked slots right now.",
        FETCH_FIRST_TIME_DISCOUNT_STATUS_FAILED: "Could not load first-time discount status right now.",
      },
    },
  },
  "bookings.fetchDashboardBookingContext": {
    flowKind: "read",
    flow: fetchDashboardBookingContextFlow,
    mapper: { fromResponse: mapFetchDashboardBookingContextFromResponse },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 22000 },
      retry: {
        enabled: true,
        maxAttempts: 2,
        baseDelayMs: 250,
        maxDelayMs: 2000,
        jitterRatio: 0.15,
      },
      etag: { enabled: true, varyByPayload: true },
      localCache: {
        enabled: true,
        ttlMs: 30000,
        version: 1,
        varyByPayload: true,
      },
      readFrom: {
        enabled: true,
        ttlMs: 30000,
        mode: "staleWhileRevalidate",
        priority: ["stateEngine", "local"],
        sources: [
          {
            type: "stateEngine",
            key: "events.cachedResponse",
            etagKey: "events.meta.etag",
            updatedAtKey: "events.meta.updatedAt",
          },
          {
            type: "local",
            key: "dashboard-events:context",
            ttlMs: 30000,
            version: 1,
            etagKey: "meta.etag",
            updatedAtKey: "meta.updatedAt",
          },
        ],
      },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        {
          type: "stateEngine",
          key: "events.cachedResponse",
          mode: "set",
          hydrateOnReadHit: true,
        },
        {
          type: "stateEngine",
          key: "events.catalogEvents",
          mode: "set",
          select: "events",
          hydrateOnReadHit: true,
        },
        {
          type: "stateEngine",
          key: "events.rawEvents",
          mode: "set",
          select: "rawEvents",
          hydrateOnReadHit: true,
        },
        {
          type: "stateEngine",
          key: "events.bookedSlotsRaw",
          mode: "set",
          select: "bookedSlots",
          hydrateOnReadHit: true,
        },
        {
          type: "stateEngine",
          key: "events.bookedSlotsIndex",
          mode: "set",
          select: "bookedSlotsIndex",
          hydrateOnReadHit: true,
        },
        {
          type: "stateEngine",
          key: "events.meta",
          mode: "set",
          select: "meta",
          hydrateOnReadHit: true,
        },
        {
          type: "stateEngine",
          key: "events.meta",
          mode: "merge",
          value: { updatedAt: "@now" },
          hydrateOnReadHit: true,
        },
        {
          type: "local",
          key: "dashboard-events:context",
          ttlMs: 30000,
          version: 1,
          hydrateOnReadHit: true,
        },
      ],
      onNotModified: [
        {
          type: "stateEngine",
          key: "events.meta",
          mode: "merge",
          value: { checkedAt: "@now" },
        },
      ],
      uiErrorMap: {
        MISSING_CREATOR_ID:
          "Creator id is required before loading dashboard events.",
        MISSING_FAN_ID: "Fan id is required before loading dashboard events.",
        UNSUPPORTED_DASHBOARD_USER_ROLE:
          "Unsupported user role for dashboard events.",
        FETCH_DASHBOARD_EVENTS_FAILED: "Could not load events right now.",
        FETCH_DASHBOARD_BOOKED_SLOTS_FAILED:
          "Could not load booked slots right now.",
      },
    },
  },
  "bookings.createBooking": {
    flowKind: "write",
    flow: createBookingFlow,
    mapper: { toRequest: mapCreateBookingToRequest },
    pipeline: {
      timeouts: { requestMs: 15000, totalFlowMs: 24000 },
      retry: { enabled: false },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: true },
      idempotency: {
        enabled: true,
        headerName: "Idempotency-Key",
        keyFrom: "idempotencyKey",
      },
      destinations: [
        { type: "stateEngine", key: "fanBooking.booking.result", mode: "set" },
        {
          type: "stateEngine",
          key: "fanBooking.booking.bookingId",
          mode: "set",
          select: "bookingId",
        },
        {
          type: "stateEngine",
          key: "fanBooking.booking.paymentStatus",
          mode: "set",
          select: "item.paymentStatus",
        },
        {
          type: "stateEngine",
          key: "fanBooking.booking.txId",
          mode: "set",
          select: "item.txId",
        },
        {
          type: "stateEngine",
          key: "fanBooking.booking.validation",
          mode: "set",
          select: "validation",
        },
        {
          type: "stateEngine",
          key: "fanBooking.booking.meta",
          mode: "merge",
          value: { createdAt: "@now" },
        },
        { type: "localFlush", key: "fan-booking:creator-context" },
      ],
      uiErrorMap: {
        CREATE_BOOKING_MISSING_REQUIRED_FIELDS:
          "Booking request is missing required fields.",
        CREATE_BOOKING_FAILED: "Could not create booking. Please try again.",
        HTTP_422:
          "Booking validation failed. Please review your selection and balance.",
        HTTP_402: "Insufficient token balance for this booking.",
      },
    },
  },
  "bookings.createTemporaryHold": {
    flowKind: "write",
    flow: createTemporaryHoldFlow,
    mapper: { toRequest: mapCreateTemporaryHoldToRequest },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 20000 },
      retry: { enabled: false },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: true },
      destinations: [
        { type: "stateEngine", key: "fanBooking.temporaryHold", mode: "merge", select: "temporaryHold" },
        { type: "stateEngine", key: "fanBooking.temporaryHold.temporaryHoldId", mode: "set", select: "temporaryHoldId" },
        { type: "stateEngine", key: "fanBooking.temporaryHold.expiresAt", mode: "set", select: "expiresAt" },
        { type: "stateEngine", key: "fanBooking.temporaryHold.guestHoldToken", mode: "set", select: "guestHoldToken" },
        { type: "stateEngine", key: "fanBooking.temporaryHold.status", mode: "set", value: "active" },
        { type: "stateEngine", key: "fanBooking.temporaryHold.createdAt", mode: "set", value: "@now" },
      ],
      uiErrorMap: {
        CREATE_TEMPORARY_HOLD_MISSING_REQUIRED_FIELDS:
          "Missing booking data for temporary hold.",
        CREATE_TEMPORARY_HOLD_FAILED:
          "Could not hold this slot. Please try another time.",
      },
    },
  },
  "bookings.getTemporaryHoldStatus": {
    flowKind: "read",
    flow: getTemporaryHoldStatusFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 16000 },
      retry: {
        enabled: true,
        maxAttempts: 1,
        baseDelayMs: 200,
        maxDelayMs: 800,
        jitterRatio: 0.1,
      },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        {
          type: "stateEngine",
          key: "fanBooking.temporaryHold",
          mode: "merge",
          select: "temporaryHold",
        },
        {
          type: "stateEngine",
          key: "fanBooking.temporaryHold.temporaryHoldId",
          mode: "set",
          select: "temporaryHoldId",
        },
        {
          type: "stateEngine",
          key: "fanBooking.temporaryHold.status",
          mode: "set",
          select: "status",
        },
        {
          type: "stateEngine",
          key: "fanBooking.temporaryHold.expiresAt",
          mode: "set",
          select: "expiresAt",
        },
        {
          type: "stateEngine",
          key: "fanBooking.temporaryHold.secondsRemaining",
          mode: "set",
          select: "secondsRemaining",
        },
        {
          type: "stateEngine",
          key: "fanBooking.temporaryHold.checkedAt",
          mode: "set",
          value: "@now",
        },
      ],
      uiErrorMap: {
        GET_TEMPORARY_HOLD_STATUS_MISSING_ID: "Temporary hold id is missing.",
        GET_TEMPORARY_HOLD_STATUS_FAILED:
          "Could not refresh temporary hold status.",
      },
    },
  },
  "bookings.releaseTemporaryHold": {
    flowKind: "write",
    flow: releaseTemporaryHoldFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 16000 },
      retry: { enabled: false },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        { type: "stateEngine", key: "fanBooking.temporaryHold", mode: "set", value: {
          temporaryHoldId: null,
          status: "cancelled",
          expiresAt: null,
          secondsRemaining: 0,
          checkedAt: "@now",
          guestSessionId: null,
          guestHoldToken: null,
        } },
      ],
      uiErrorMap: {
        RELEASE_TEMPORARY_HOLD_MISSING_ID: "Temporary hold id is missing.",
        RELEASE_TEMPORARY_HOLD_FAILED: "Could not release temporary hold.",
      },
    },
  },
  "bookings.updateTemporaryHoldUser": {
    flowKind: "write",
    flow: updateTemporaryHoldUserFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 16000 },
      retry: { enabled: false },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [],
      uiErrorMap: {
        UPDATE_TEMPORARY_HOLD_USER_MISSING_ID: "Temporary hold id is missing.",
        UPDATE_TEMPORARY_HOLD_USER_MISSING_USER: "User id is missing.",
        UPDATE_TEMPORARY_HOLD_USER_FAILED:
          "Could not update temporary hold user.",
      },
    },
  },
  "bookings.reviewPendingBooking": {
    flowKind: "write",
    flow: reviewPendingBookingFlow,
    mapper: { toRequest: mapReviewPendingBookingToRequest },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 20000 },
      retry: { enabled: false },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        { type: "stateEngine", key: "events.lastReview", mode: "set" },
        {
          type: "stateEngine",
          key: "events.meta",
          mode: "merge",
          value: { lastReviewAt: "@now" },
        },
        { type: "localFlush", key: "fan-booking:creator-context" },
      ],
      uiErrorMap: {
        REVIEW_BOOKING_MISSING_ID: "Booking id is required.",
        REVIEW_BOOKING_INVALID_DECISION: "Approval decision is invalid.",
        REVIEW_BOOKING_FAILED: "Could not update booking approval.",
        HTTP_400: "This booking cannot be reviewed in its current status.",
        HTTP_402: "Could not reverse token hold for rejected booking.",
      },
    },
  },
  "bookings.cancelBooking": {
    flowKind: "write",
    flow: cancelBookingFlow,
    mapper: { toRequest: mapCancelBookingToRequest },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 20000 },
      retry: { enabled: false },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        { type: "stateEngine", key: "events.lastCancel", mode: "set" },
        {
          type: "stateEngine",
          key: "events.meta",
          mode: "merge",
          value: { lastCancelAt: "@now" },
        },
        { type: "localFlush", key: "fan-booking:creator-context" },
        { type: "localFlush", key: "dashboard-events:context" },
      ],
      uiErrorMap: {
        CANCEL_BOOKING_MISSING_ID: "Booking id is required.",
        CANCEL_BOOKING_FAILED: "Could not cancel booking.",
        HTTP_400: "This booking cannot be cancelled in its current status.",
        HTTP_402: "Could not reverse token hold for cancellation.",
      },
    },
  },
  "bookings.renegotiateBooking": {
    flowKind: "write",
    flow: updateBookingFlow,
    mapper: { toRequest: mapRenegotiateBookingToRequest },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 20000 },
      retry: { enabled: false },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        { type: "stateEngine", key: "events.lastRenegotiate", mode: "set" },
        { type: "stateEngine", key: "events.meta", mode: "merge", value: { lastRenegotiateAt: "@now" } },
        { type: "localFlush", key: "fan-booking:creator-context" },
        { type: "localFlush", key: "dashboard-events:context" },
      ],
      uiErrorMap: {
        BOOKING_UPDATE_MISSING_ID: "Booking id is required.",
        BOOKING_UPDATE_INVALID_ACTION: "Booking update action is invalid.",
        BOOKING_UPDATE_FAILED: "Could not renegotiate booking.",
        HTTP_400: "This booking update is invalid in the current state.",
        HTTP_402: "Could not update held payment for this booking.",
      },
    },
  },
  "bookings.rescheduleBooking": {
    flowKind: "write",
    flow: updateBookingFlow,
    mapper: { toRequest: mapRescheduleBookingToRequest },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 20000 },
      retry: { enabled: false },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        { type: "stateEngine", key: "events.lastReschedule", mode: "set" },
        { type: "stateEngine", key: "events.meta", mode: "merge", value: { lastRescheduleAt: "@now" } },
        { type: "localFlush", key: "fan-booking:creator-context" },
        { type: "localFlush", key: "dashboard-events:context" },
      ],
      uiErrorMap: {
        BOOKING_UPDATE_MISSING_ID: "Booking id is required.",
        BOOKING_UPDATE_INVALID_ACTION: "Booking update action is invalid.",
        BOOKING_UPDATE_FAILED: "Could not reschedule booking.",
        HTTP_400: "This booking cannot be rescheduled with the selected time.",
      },
    },
  },

  "bookings.updateMeta": {
    flowKind: "write",
    flow: updateBookingFlow,
    mapper: { toRequest: mapUpdateBookingMetaToRequest },
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      retry: { enabled: false },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      uiErrorMap: {
        BOOKING_UPDATE_MISSING_ID: "Booking id is required.",
        BOOKING_UPDATE_INVALID_ACTION: "Booking update action is invalid.",
        BOOKING_UPDATE_FAILED: "Could not update booking meta.",
      },
    },
  },

  "bookings.fetchBooking": {
    flowKind: "read",
    flow: fetchBookingFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      retry: { enabled: true, maxAttempts: 2, baseDelayMs: 200 },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
    },
  },

  "rental.fetchCatalog": {
    flowKind: "read",
    flow: fetchRentalCatalogFlow,
    mapper: { fromResponse: mapRentalCatalogFromResponse },
    validators: {
      payload: validateFetchCatalogPayload,
      response: validateFetchCatalogResponse,
    },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 25000 },
      retry: {
        enabled: true,
        maxAttempts: 3,
        baseDelayMs: 250,
        maxDelayMs: 2000,
        jitterRatio: 0.2,
      },
      etag: { enabled: true, varyByPayload: true },
      localCache: {
        enabled: true,
        ttlMs: 45000,
        version: 2,
        varyByPayload: true,
      },
      readFrom: {
        enabled: true,
        ttlMs: 45000,
        mode: "staleWhileRevalidate",
        priority: ["pinia", "stateEngine", "local"],
        sources: [
          {
            type: "pinia",
            storeId: "rental",
            select: "catalogEnvelope",
            etagSelect: "catalogMeta.etag",
            updatedAtSelect: "catalogMeta.updatedAt",
          },
          {
            type: "stateEngine",
            key: "rental.catalogEnvelope",
            etagKey: "rental.catalog.meta.etag",
            updatedAtKey: "rental.catalog.meta.updatedAt",
          },
          {
            type: "local",
            key: "rental:catalog",
            ttlMs: 45000,
            version: 2,
            etagKey: "meta.etag",
            updatedAtKey: "meta.updatedAt",
          },
        ],
      },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        { type: "stateEngine", key: "rental.catalogEnvelope", mode: "set" },
        {
          type: "stateEngine",
          key: "rental.catalog.items",
          mode: "set",
          select: "items",
        },
        {
          type: "stateEngine",
          key: "rental.catalog.meta",
          mode: "merge",
          value: { updatedAt: "@now" },
        },
        {
          type: "stateEngine",
          key: "rental.audit.trail",
          mode: "push",
          value: { at: "@now", action: "catalog_loaded" },
        },
        {
          type: "piniaAction",
          storeId: "rental",
          action: "setCatalog",
          select: "items",
        },
        {
          type: "piniaAction",
          storeId: "rental",
          action: "mergeCatalogMeta",
          value: { updatedAt: "@now" },
        },
        {
          type: "piniaPatch",
          storeId: "rental",
          patch: (data) => ({ catalogEnvelope: data }),
          hydrateOnReadHit: true,
        },
        { type: "local", key: "rental:catalog", ttlMs: 45000, version: 2 },
        { type: "object", key: "rental.lastCatalogRun", value: { at: "@now" } },
      ],
      onNotModified: [
        {
          type: "stateEngine",
          key: "rental.catalog.meta",
          mode: "merge",
          value: { checkedAt: "@now" },
        },
        {
          type: "piniaAction",
          storeId: "rental",
          action: "mergeCatalogMeta",
          value: { checkedAt: "@now" },
        },
      ],
      uiErrorMap: {
        MISSING_CREATOR_ID: "Creator id is required before loading rentals.",
        FETCH_RENTAL_CATALOG_FAILED: "Could not load rental catalog right now.",
      },
    },
    refresh: {
      enabled: true,
      intervalMs: 60000,
      scopeKey: "rental.fetchCatalog",
    },
  },
  "rental.fetchAvailability": {
    flowKind: "read",
    flow: fetchRentalAvailabilityFlow,
    mapper: { fromResponse: mapRentalAvailabilityFromResponse },
    validators: {
      payload: validateFetchAvailabilityPayload,
      response: validateFetchAvailabilityResponse,
    },
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 18000 },
      retry: {
        enabled: true,
        maxAttempts: 2,
        baseDelayMs: 200,
        maxDelayMs: 1000,
        jitterRatio: 0.1,
      },
      etag: { enabled: true, varyByPayload: true },
      localCache: {
        enabled: true,
        ttlMs: 15000,
        version: 1,
        varyByPayload: true,
      },
      readFrom: {
        enabled: true,
        ttlMs: 15000,
        mode: "networkOnStale",
        priority: ["stateEngine", "local"],
        sources: [
          {
            type: "stateEngine",
            key: "rental.availability.current",
            etagKey: "rental.availability.meta.etag",
            updatedAtKey: "rental.availability.meta.updatedAt",
          },
          {
            type: "local",
            key: "rental:availability",
            ttlMs: 15000,
            version: 1,
            etagKey: "meta.etag",
            updatedAtKey: "meta.updatedAt",
          },
        ],
      },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        {
          type: "stateEngine",
          key: "rental.availability.current",
          mode: "set",
        },
        {
          type: "stateEngine",
          key: "rental.availability.meta",
          mode: "merge",
          value: { updatedAt: "@now" },
        },
        { type: "piniaAction", storeId: "rental", action: "setAvailability" },
        { type: "local", key: "rental:availability", ttlMs: 15000, version: 1 },
      ],
      onNotModified: [
        {
          type: "stateEngine",
          key: "rental.availability.meta",
          mode: "merge",
          value: { checkedAt: "@now" },
        },
      ],
      uiErrorMap: {
        MISSING_RENTAL_ID: "Please select a rental first.",
        MISSING_DATE: "Please select a date first.",
        FETCH_RENTAL_AVAILABILITY_FAILED:
          "Could not load availability right now.",
      },
    },
  },
  "rental.createReservation": {
    flowKind: "write",
    flow: createRentalReservationFlow,
    mapper: { toRequest: mapCreateReservationToRequest },
    validators: {
      payload: validateCreateReservationPayload,
      response: validateCreateReservationResponse,
    },
    pipeline: {
      timeouts: { requestMs: 15000, totalFlowMs: 22000 },
      retry: {
        enabled: true,
        maxAttempts: 2,
        baseDelayMs: 250,
        maxDelayMs: 1200,
        jitterRatio: 0.1,
      },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: true },
      idempotency: {
        enabled: true,
        headerName: "Idempotency-Key",
        keyFrom: "idempotencyKey",
      },
      destinations: [
        { type: "stateEngine", key: "rental.reservation.pending", mode: "set" },
        {
          type: "stateEngine",
          key: "rental.audit.trail",
          mode: "push",
          value: { at: "@now", action: "reservation_created" },
        },
        {
          type: "piniaAction",
          storeId: "rental",
          action: "setActiveReservation",
        },
        {
          type: "piniaAction",
          storeId: "rental",
          action: "pushAction",
          value: { at: "@now", action: "reservation_created" },
        },
        {
          type: "local",
          key: "rental:lastReservation",
          ttlMs: 300000,
          version: 1,
        },
        {
          type: "object",
          key: "rental.lastCreateReservation",
          value: { at: "@now" },
        },
      ],
      uiErrorMap: {
        CREATE_RENTAL_RESERVATION_FAILED:
          "Could not create reservation. Please retry.",
      },
    },
  },
  "rental.confirmReservation": {
    flowKind: "write",
    flow: confirmRentalReservationFlow,
    mapper: { toRequest: mapConfirmReservationToRequest },
    validators: {
      payload: validateConfirmReservationPayload,
    },
    pipeline: {
      timeouts: { requestMs: 15000, totalFlowMs: 20000 },
      retry: { enabled: false },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: true },
      idempotency: {
        enabled: true,
        headerName: "Idempotency-Key",
        keyFrom: "idempotencyKey",
      },
      destinations: [
        {
          type: "stateEngine",
          key: "rental.reservation.pending",
          mode: "merge",
          value: { status: "confirmed", confirmedAt: "@now" },
        },
        {
          type: "piniaPatch",
          storeId: "rental",
          patch: (data) => ({ activeReservation: data }),
        },
        {
          type: "piniaAction",
          storeId: "rental",
          action: "pushAction",
          value: { at: "@now", action: "reservation_confirmed" },
        },
        { type: "localFlush", key: "rental:availability" },
      ],
      uiErrorMap: {
        CONFIRM_RENTAL_RESERVATION_FAILED:
          "Could not confirm reservation. Please retry.",
      },
    },
  },
  "rental.cancelReservation": {
    flowKind: "write",
    flow: cancelRentalReservationFlow,
    mapper: { toRequest: mapCancelReservationToRequest },
    validators: {
      payload: validateCancelReservationPayload,
    },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 18000 },
      retry: { enabled: false },
      concurrency: {
        policy: "allowParallel",
        dedupe: false,
        keyByPayload: true,
      },
      destinations: [
        {
          type: "stateEngine",
          key: "rental.reservation.pending",
          mode: "merge",
          value: { status: "cancelled", cancelledAt: "@now" },
        },
        {
          type: "piniaAction",
          storeId: "rental",
          action: "pushAction",
          value: { at: "@now", action: "reservation_cancelled" },
        },
        { type: "localFlush", key: "rental:lastReservation" },
      ],
      uiErrorMap: {
        CANCEL_RENTAL_RESERVATION_FAILED:
          "Could not cancel reservation right now.",
      },
    },
  },
  "rental.flushClientCache": {
    flowKind: "write",
    flow: flushRentalClientCacheFlow,
    pipeline: {
      timeouts: { requestMs: 5000, totalFlowMs: 5000 },
      retry: { enabled: false },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: false },
      destinations: [
        { type: "stateEngineFlush", key: "rental.catalog", mode: "flush" },
        { type: "stateEngineFlush", key: "rental.availability", mode: "flush" },
        { type: "piniaFlush", storeId: "rental" },
        { type: "localFlush", key: "rental:catalog" },
        { type: "localFlush", key: "rental:availability" },
        { type: "localFlush", key: "rental:lastReservation" },
        { type: "object", key: "rental.lastClientFlushAt", value: "@now" },
        { type: "return", value: { ok: true, flushedAt: "@now" } },
      ],
    },
  },

    "chat.getChat": {
    flowKind: "read",
    flow: getChatFlow,
    pipeline: {
      timeouts: { requestMs: 8000, totalFlowMs: 12000 },
      retry: { enabled: true, maxAttempts: 2, baseDelayMs: 200, maxDelayMs: 1000, jitterRatio: 0.1 },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [],
      uiErrorMap: {
        GET_CHAT_MISSING_CHAT_ID: "Chat ID is required.",
        GET_CHAT_FAILED: "Could not load chat.",
      },
    },
  },
  "chat.createChat": {
    flowKind: "write",
    flow: createChatFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      retry: {
        enabled: true,
        maxAttempts: 1,
        baseDelayMs: 250,
        maxDelayMs: 1000,
        jitterRatio: 0.1,
      },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: false },
      destinations: [
        {
          type: "stateEngine",
          key: "chat.createResult",
          mode: "set",
          select: "chatId",
        },
      ],
      uiErrorMap: {
        CREATE_CHAT_FAILED: "Could not create chat right now.",
      },
    },
  },
  "chat.sendMessage": {
    flowKind: "write",
    flow: sendMessageFlow,
    pipeline: {
      timeouts: { requestMs: 15000, totalFlowMs: 20000 },
      retry: {
        enabled: true,
        maxAttempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 3000,
        jitterRatio: 0.2,
      },
      concurrency: {
        policy: "allowParallel",
        dedupe: false,
        keyByPayload: true,
      },
      destinations: [
        { type: "piniaAction", storeId: "chat", action: "addMessageAction" },
      ],
      uiErrorMap: {
        SEND_MESSAGE_MISSING_CHAT_ID: "Chat ID is missing.",
        SEND_MESSAGE_FAILED: "Message could not be sent.",
      },
    },
  },
  "chat.sendProductRecommendation": {
    flowKind: "write",
    flow: sendProductRecommendationFlow,
    pipeline: {
      timeouts: { requestMs: 15000, totalFlowMs: 20000 },
      retry: { enabled: true, maxAttempts: 2, baseDelayMs: 500, maxDelayMs: 2500, jitterRatio: 0.2 },
      concurrency: { policy: "allowParallel", dedupe: false, keyByPayload: true },
      destinations: [
        { type: "piniaAction", storeId: "chat", action: "addMessageAction" },
      ],
      uiErrorMap: {
        SEND_PRODUCT_RECOMMENDATION_MISSING_FIELDS: "Product details are missing.",
        SEND_PRODUCT_RECOMMENDATION_FAILED: "Product could not be added to chat.",
      },
    },
  },
  "chat.fetchProductRecommendationStatus": {
    flowKind: "read",
    flow: fetchProductRecommendationStatusFlow,
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 16000 },
      retry: { enabled: true, maxAttempts: 1, baseDelayMs: 250, maxDelayMs: 1000, jitterRatio: 0.1 },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      uiErrorMap: {
        FETCH_PRODUCT_RECOMMENDATION_STATUS_MISSING_FAN_UID: "Fan access could not be checked.",
        FETCH_PRODUCT_RECOMMENDATION_STATUS_FAILED: "Product access could not be checked.",
      },
    },
  },
  "chat.fetchMessages": {
    flowKind: "read",
    flow: fetchMessagesFlow,
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 20000 },
      retry: {
        enabled: true,
        maxAttempts: 2,
        baseDelayMs: 250,
        maxDelayMs: 1500,
        jitterRatio: 0.1,
      },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        {
          type: "piniaAction",
          storeId: "chat",
          action: "prependMessagesAction",
        },
      ],
      uiErrorMap: {
        FETCH_MESSAGES_MISSING_CHAT_ID: "Chat ID is required.",
        FETCH_MESSAGES_FAILED: "Could not load messages.",
      },
    },
  },
  "chat.fetchChatUsersData": {
    flowKind: "read",
    flow: fetchChatUsersDataFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      retry: {
        enabled: true,
        maxAttempts: 2,
        baseDelayMs: 250,
        maxDelayMs: 1500,
        jitterRatio: 0.1,
      },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: false },
      destinations: [
        {
          type: "piniaAction",
          storeId: "chat",
          action: "setChatUsersDataAction",
        },
      ],
      uiErrorMap: {
        FETCH_CHAT_USERS_FAILED: "Could not load chat user data.",
      },
    },
  },
  "chat.fetchUserChats": {
    flowKind: "read",
    flow: fetchUserChatsFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      retry: {
        enabled: true,
        maxAttempts: 2,
        baseDelayMs: 250,
        maxDelayMs: 1500,
        jitterRatio: 0.1,
      },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: false },
      destinations: [
        {
          type: "piniaAction",
          storeId: "chat",
          action: "fetchUserChatsAction",
        },
      ],
      uiErrorMap: {
        FETCH_USER_CHATS_FAILED: "Could not load your chats.",
      },
    },
  },
  "chat.getUnreadCount": {
    flowKind: "read",
    flow: getUnreadCountFlow,
    pipeline: {
      timeouts: { requestMs: 8000, totalFlowMs: 12000 },
      retry: { enabled: false },
      concurrency: {
        policy: "allowParallel",
        dedupe: false,
        keyByPayload: true,
      },
      destinations: [],
      uiErrorMap: {},
    },
  },
  "chat.sendBookingRequestMessage": {
    flowKind: "write",
    flow: sendBookingRequestMessageFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      retry: { enabled: false },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: false },
      destinations: [],
      uiErrorMap: {},
    },
  },
  "chat.updateBookingRequestMessage": {
    flowKind: "write",
    flow: updateBookingRequestMessageFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      retry: { enabled: false },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: false },
      destinations: [],
      uiErrorMap: {},
    },
  },
  "chat.updateMessage": {
    flowKind: "write",
    flow: updateMessageFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      retry: { enabled: false },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: false },
      destinations: [],
      uiErrorMap: {},
    },
  },
  "chat.sendChatActivityLog": {
    flowKind: "write",
    flow: sendChatActivityLogFlow,
    pipeline: {
      timeouts: { requestMs: 8000, totalFlowMs: 12000 },
      retry: { enabled: false },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: false },
      destinations: [],
      uiErrorMap: {},
    },
  },
  "chat.pinMessage": {
    flowKind: "write",
    flow: pinMessageFlow,
    pipeline: {
      timeouts: { requestMs: 8000, totalFlowMs: 12000 },
      retry: { enabled: false },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: false },
      destinations: [],
      uiErrorMap: {},
    },
  },
  "chat.markMessageDelivered": {
    flowKind: "write",
    flow: markMessageDeliveredFlow,
    pipeline: {
      timeouts: { requestMs: 8000, totalFlowMs: 12000 },
      retry: { enabled: false },
      concurrency: {
        policy: "allowParallel",
        dedupe: false,
        keyByPayload: true,
      },
      destinations: [],
      uiErrorMap: {},
    },
  },
  "chat.markMessageRead": {
    flowKind: "write",
    flow: markMessageReadFlow,
    pipeline: {
      timeouts: { requestMs: 8000, totalFlowMs: 12000 },
      retry: { enabled: false },
      concurrency: {
        policy: "allowParallel",
        dedupe: false,
        keyByPayload: true,
      },
      destinations: [],
      uiErrorMap: {},
    },
  },
  "chat.createGroupChat": {
    flowKind: "write",
    flow: createGroupChatFlow,
    pipeline: {
      timeouts: { requestMs: 15000, totalFlowMs: 20000 },
      retry: {
        enabled: true,
        maxAttempts: 1,
        baseDelayMs: 250,
        maxDelayMs: 1000,
        jitterRatio: 0.1,
      },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: false },
      destinations: [],
      uiErrorMap: {
        CREATE_GROUP_CHAT_FAILED: "Could not create group chat right now.",
      },
    },
  },
  "chat.addChatParticipant": {
    flowKind: "write",
    flow: addChatParticipantFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      retry: { enabled: false },
      concurrency: {
        policy: "allowParallel",
        dedupe: false,
        keyByPayload: false,
      },
      destinations: [],
      uiErrorMap: {
        ADD_CHAT_PARTICIPANT_FAILED: "Could not add participant to chat.",
      },
    },
  },
  "chat.fetchGroupUserIds": {
    flowKind: "read",
    flow: fetchGroupUserIdsFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      retry: {
        enabled: true,
        maxAttempts: 2,
        baseDelayMs: 250,
        maxDelayMs: 1500,
        jitterRatio: 0.1,
      },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [],
      uiErrorMap: {
        FETCH_GROUP_USER_IDS_FAILED: "Could not load users for this group.",
      },
    },
  },

  // Cart Flows
  "cart.fetch": {
    flowKind: "read",
    flow: fetchCartFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      retry: { enabled: true, maxAttempts: 2 },
      etag: { enabled: true, varyByPayload: true },
      concurrency: { policy: "latestWins", dedupe: true },
      readFrom: {
        enabled: true,
        priority: ["pinia"],
        sources: [{ type: "pinia", storeId: "cart" }],
      },
      destinations: [
        { type: "piniaAction", storeId: "cart", action: "setCartAction" },
      ],
      uiErrorMap: {
        FETCH_CART_FAILED: "Could not load your cart.",
      },
      onNotModified: [
        {
          type: "piniaPatch",
          storeId: "cart",
          patch: (state) => {
            state.metadata.checkedAt = new Date().toISOString();
          },
        },
      ],
    },
    refresh: { enabled: true, intervalMs: 60000, scopeKey: "cart.fetch" },
  },

  "cart.addItem": {
    flowKind: "write",
    flow: addItemToCartFlow,
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 18000 },
      concurrency: { policy: "firstWins" },
      destinations: [
        { type: "piniaAction", storeId: "cart", action: "setCartAction" },
      ],
      uiErrorMap: {
        ADD_ITEM_FAILED: "Failed to add item.",
      },
    },
  },

  "cart.removeItem": {
    flowKind: "write",
    flow: removeItemFromCartFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      destinations: [
        { type: "piniaAction", storeId: "cart", action: "setCartAction" },
      ],
    },
  },

  "cart.updateQuantity": {
    flowKind: "write",
    flow: updateItemQuantityFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      concurrency: { policy: "latestWins" },
      destinations: [
        { type: "piniaAction", storeId: "cart", action: "setCartAction" },
      ],
    },
  },
  "cart.rename": {
    flowKind: "write",
    flow: renameCartFlow,
    pipeline: {
      destinations: [
        { type: "piniaAction", storeId: "cart", action: "setCartAction" },
      ],
    },
  },
  "cart.applyCoupon": {
    flowKind: "write",
    flow: applyCouponFlow,
    pipeline: {
      destinations: [
        { type: "piniaAction", storeId: "cart", action: "setCartAction" },
      ],
    },
  },
  "cart.removeCoupon": {
    flowKind: "write",
    flow: removeCouponFlow,
    pipeline: {
      destinations: [
        { type: "piniaAction", storeId: "cart", action: "setCartAction" },
      ],
    },
  },
  "cart.applyFees": {
    flowKind: "write",
    flow: applyFeesFlow,
    pipeline: {
      destinations: [
        { type: "piniaAction", storeId: "cart", action: "setCartAction" },
      ],
    },
  },
  "cart.setAsDefault": {
    flowKind: "write",
    flow: setAsDefaultFlow,
    pipeline: {
      destinations: [
        { type: "piniaAction", storeId: "cart", action: "setCartAction" },
      ],
    },
  },
  "cart.mergeGuest": {
    flowKind: "write",
    flow: mergeGuestCartFlow,
    pipeline: {
      destinations: [
        { type: "piniaAction", storeId: "cart", action: "setCartAction" },
      ],
    },
  },
  "cart.attachLiveData": {
    flowKind: "write",
    flow: attachLiveDataFlow,
    pipeline: {
      destinations: [
        { type: "piniaAction", storeId: "cart", action: "setCartAction" },
      ],
    },
  },
  "cart.remind": {
    flowKind: "write",
    flow: remindAbandonedCartsFlow,
  },
  "orders.fetchOrders": {
    flowKind: "read",
    flow: fetchOrdersFlow,
    mapper: {
      fromResponse: mapOrdersFromResponse,
      toRequest: mapOrderToRequest,
    },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 25000 },
      retry: {
        enabled: true,
        maxAttempts: 2,
        baseDelayMs: 300,
        maxDelayMs: 2000,
        jitterRatio: 0.15,
      },
      etag: { enabled: false },
      localCache: {
        enabled: false,
      },
      readFrom: {
        enabled: false,
      },

      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        {
          type: "piniaAction",
          storeId: "orders",
          action: "setOrders",
          map: (data) => [
            data.items,
            {
              etag: data.etag,
              totalCount: data.totalCount,
              pagination: data.pagination,
            },
          ],
          hydrateOnReadHit: true,
        },
        {
          type: "local",
          key: "dash:orders:list",
          ttlMs: 60000,
          version: 1,
          hydrateOnReadHit: true,
        },
      ],
      uiErrorMap: {
        FETCH_ORDERS_FAILED:
          "Could not load orders. Please check your connection.",
        FETCH_ORDERS_UNEXPECTED:
          "An unexpected error occurred while loading orders.",
      },
    },
    refresh: {
      enabled: true,
      intervalMs: 1800000, // 30 minutes as requested
      scopeKey: "orders.fetchOrders",
    },
  },

  // --- MEDIA UPLOADER FLOWS ---
  "media.uploadFile": {
    flowKind: "write",
    flow: uploadMediaFlow,
    pipeline: {
      retry: { enabled: false },
      uiErrorMap: {
        UPLOAD_FAILED: "Media upload failed. Please try again.",
      },
    },
  },
  "media.submitUploader": {
    flowKind: "write",
    flow: submitUploaderFlow,
    pipeline: {
      uiErrorMap: {
        SUBMIT_FAILED: "Registration failed. Please check form data.",
      },
    },
  },
};
