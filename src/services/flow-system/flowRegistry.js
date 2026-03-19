import { createEventFlow } from "@/services/events/flows/createEventFlow.js";
import { fetchCreatorEventsFlow } from "@/services/events/flows/fetchCreatorEventsFlow.js";
import { createEventMapper } from "@/services/events/mappers/createEventMapper.js";
import { mapFetchCreatorEventsFromResponse } from "@/services/events/mappers/fetchCreatorEventsMapper.js";

import { createChatFlow } from "@/services/chat/flows/createChatFlow.js";
import { sendMessageFlow } from "@/services/chat/flows/sendMessageFlow.js";
import { fetchMessagesFlow } from "@/services/chat/flows/fetchMessagesFlow.js";
import { fetchSpendingRequirementItemsFlow } from "@/services/events/flows/fetchSpendingRequirementItemsFlow.js";
import { mapFetchSpendingRequirementItemsFromResponse } from "@/services/events/mappers/fetchSpendingRequirementItemsMapper.js";
import {
  validateFetchCreatorEventsPayload,
  validateFetchCreatorEventsResponse,
} from "@/services/events/validators/eventFlowValidators.js";
import { fetchCreatorBookingContextFlow } from "@/services/bookings/flows/fetchCreatorBookingContextFlow.js";
import { mapFetchCreatorBookingContextFromResponse } from "@/services/bookings/mappers/fetchCreatorBookingContextMapper.js";
import { createBookingFlow } from "@/services/bookings/flows/createBookingFlow.js";
import { mapCreateBookingToRequest } from "@/services/bookings/mappers/createBookingMapper.js";
import { createTemporaryHoldFlow } from "@/services/bookings/flows/createTemporaryHoldFlow.js";
import { getTemporaryHoldStatusFlow } from "@/services/bookings/flows/getTemporaryHoldStatusFlow.js";
import { releaseTemporaryHoldFlow } from "@/services/bookings/flows/releaseTemporaryHoldFlow.js";
import { reviewPendingBookingFlow } from "@/services/bookings/flows/reviewPendingBookingFlow.js";
import { cancelBookingFlow } from "@/services/bookings/flows/cancelBookingFlow.js";
import { mapCreateTemporaryHoldToRequest } from "@/services/bookings/mappers/createTemporaryHoldMapper.js";
import { mapReviewPendingBookingToRequest } from "@/services/bookings/mappers/reviewPendingBookingMapper.js";
import { mapCancelBookingToRequest } from "@/services/bookings/mappers/cancelBookingMapper.js";
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

export const flowRegistry = {
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
      retry: { enabled: true, maxAttempts: 2, baseDelayMs: 250, maxDelayMs: 2000, jitterRatio: 0.15 },
      etag: { enabled: true, varyByPayload: true },
      localCache: { enabled: true, ttlMs: 30000, version: 1, varyByPayload: true },
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
        { type: "stateEngine", key: "events.cachedResponse", mode: "set", hydrateOnReadHit: true },
        { type: "stateEngine", key: "events.list", mode: "set", select: "items", hydrateOnReadHit: true },
        { type: "stateEngine", key: "events.meta", mode: "set", select: "meta", hydrateOnReadHit: true },
        { type: "stateEngine", key: "events.meta", mode: "merge", value: { updatedAt: "@now" }, hydrateOnReadHit: true },
        { type: "local", key: "events:creator:list", ttlMs: 30000, version: 1, hydrateOnReadHit: true },
      ],
      onNotModified: [
        { type: "stateEngine", key: "events.meta", mode: "merge", value: { checkedAt: "@now" } },
      ],
      uiErrorMap: {
        MISSING_CREATOR_ID: "Creator id is required before loading events.",
        FETCH_CREATOR_EVENTS_FAILED: "Could not load events right now.",
      },
    },
    refresh: { enabled: true, intervalMs: 60000, scopeKey: "events.fetchCreatorEvents" },
  },

  "events.createEvent": {
    flowKind: "write",
    flow: createEventFlow,
    mapper: { toRequest: createEventMapper },
    pipeline: {
      timeouts: { requestMs: 15000, totalFlowMs: 24000 },
      retry: { enabled: false },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: true },
      idempotency: { enabled: true, headerName: "Idempotency-Key", keyFrom: "idempotencyKey" },
      destinations: [
        { type: "stateEngine", key: "events.lastCreated", mode: "set", select: "item" },
        { type: "stateEngine", key: "events.list", mode: "push", select: "item" },
        { type: "stateEngine", key: "events.meta", mode: "merge", value: { lastCreateAt: "@now" } },
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
      retry: { enabled: true, maxAttempts: 1, baseDelayMs: 250, maxDelayMs: 1200, jitterRatio: 0.1 },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      uiErrorMap: {
        MISSING_CREATOR_ID: "Creator id is required before loading spending requirement items.",
        MISSING_SPENDING_REQUIREMENT_TYPE: "Item type is required before loading spending requirement items.",
        FETCH_SPENDING_REQUIREMENT_ITEMS_FAILED: "Could not load spending requirement items right now.",
        FETCH_SPENDING_REQUIREMENT_ITEMS_UNEXPECTED: "Unexpected error while loading spending requirement items.",
      },
    },
  },

  "bookings.fetchCreatorBookingContext": {
    flowKind: "read",
    flow: fetchCreatorBookingContextFlow,
    mapper: { fromResponse: mapFetchCreatorBookingContextFromResponse },
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 22000 },
      retry: { enabled: true, maxAttempts: 2, baseDelayMs: 250, maxDelayMs: 2000, jitterRatio: 0.15 },
      etag: { enabled: true, varyByPayload: true },
      localCache: { enabled: true, ttlMs: 30000, version: 1, varyByPayload: true },
      readFrom: {
        enabled: true,
        ttlMs: 30000,
        mode: "staleWhileRevalidate",
        priority: ["stateEngine", "local"],
        sources: [
          {
            type: "stateEngine",
            key: "fanBooking.catalog.cachedResponse",
            etagKey: "fanBooking.catalog.meta.etag",
            updatedAtKey: "fanBooking.catalog.meta.updatedAt",
          },
          {
            type: "local",
            key: "fan-booking:creator-context",
            ttlMs: 30000,
            version: 1,
            etagKey: "meta.etag",
            updatedAtKey: "meta.updatedAt",
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
        { type: "stateEngine", key: "fanBooking.catalog.meta", mode: "set", select: "meta", hydrateOnReadHit: true },
        { type: "stateEngine", key: "fanBooking.catalog.meta", mode: "merge", value: { updatedAt: "@now" }, hydrateOnReadHit: true },
        { type: "local", key: "fan-booking:creator-context", ttlMs: 30000, version: 1, hydrateOnReadHit: true },
      ],
      onNotModified: [
        { type: "stateEngine", key: "fanBooking.catalog.meta", mode: "merge", value: { checkedAt: "@now" } },
      ],
      uiErrorMap: {
        MISSING_CREATOR_ID: "Creator id is required before loading booking context.",
        FETCH_CREATOR_EVENTS_FAILED: "Could not load events right now.",
        FETCH_CREATOR_BOOKED_SLOTS_FAILED: "Could not load booked slots right now.",
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
      idempotency: { enabled: true, headerName: "Idempotency-Key", keyFrom: "idempotencyKey" },
      destinations: [
        { type: "stateEngine", key: "fanBooking.booking.result", mode: "set" },
        { type: "stateEngine", key: "fanBooking.booking.bookingId", mode: "set", select: "bookingId" },
        { type: "stateEngine", key: "fanBooking.booking.paymentStatus", mode: "set", select: "item.paymentStatus" },
        { type: "stateEngine", key: "fanBooking.booking.txId", mode: "set", select: "item.txId" },
        { type: "stateEngine", key: "fanBooking.booking.validation", mode: "set", select: "validation" },
        { type: "stateEngine", key: "fanBooking.booking.meta", mode: "merge", value: { createdAt: "@now" } },
        { type: "localFlush", key: "fan-booking:creator-context" },
      ],
      uiErrorMap: {
        CREATE_BOOKING_MISSING_REQUIRED_FIELDS: "Booking request is missing required fields.",
        CREATE_BOOKING_FAILED: "Could not create booking. Please try again.",
        HTTP_422: "Booking validation failed. Please review your selection and balance.",
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
        { type: "stateEngine", key: "fanBooking.temporaryHold.status", mode: "set", value: "active" },
        { type: "stateEngine", key: "fanBooking.temporaryHold.createdAt", mode: "set", value: "@now" },
      ],
      uiErrorMap: {
        CREATE_TEMPORARY_HOLD_MISSING_REQUIRED_FIELDS: "Missing booking data for temporary hold.",
        CREATE_TEMPORARY_HOLD_FAILED: "Could not hold this slot. Please try another time.",
      },
    },
  },
  "bookings.getTemporaryHoldStatus": {
    flowKind: "read",
    flow: getTemporaryHoldStatusFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 16000 },
      retry: { enabled: true, maxAttempts: 1, baseDelayMs: 200, maxDelayMs: 800, jitterRatio: 0.1 },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        { type: "stateEngine", key: "fanBooking.temporaryHold", mode: "merge", select: "temporaryHold" },
        { type: "stateEngine", key: "fanBooking.temporaryHold.temporaryHoldId", mode: "set", select: "temporaryHoldId" },
        { type: "stateEngine", key: "fanBooking.temporaryHold.status", mode: "set", select: "status" },
        { type: "stateEngine", key: "fanBooking.temporaryHold.expiresAt", mode: "set", select: "expiresAt" },
        { type: "stateEngine", key: "fanBooking.temporaryHold.secondsRemaining", mode: "set", select: "secondsRemaining" },
        { type: "stateEngine", key: "fanBooking.temporaryHold.checkedAt", mode: "set", value: "@now" },
      ],
      uiErrorMap: {
        GET_TEMPORARY_HOLD_STATUS_MISSING_ID: "Temporary hold id is missing.",
        GET_TEMPORARY_HOLD_STATUS_FAILED: "Could not refresh temporary hold status.",
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
        } },
      ],
      uiErrorMap: {
        RELEASE_TEMPORARY_HOLD_MISSING_ID: "Temporary hold id is missing.",
        RELEASE_TEMPORARY_HOLD_FAILED: "Could not release temporary hold.",
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
        { type: "stateEngine", key: "events.meta", mode: "merge", value: { lastReviewAt: "@now" } },
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
        { type: "stateEngine", key: "events.meta", mode: "merge", value: { lastCancelAt: "@now" } },
        { type: "localFlush", key: "fan-booking:creator-context" },
      ],
      uiErrorMap: {
        CANCEL_BOOKING_MISSING_ID: "Booking id is required.",
        CANCEL_BOOKING_FAILED: "Could not cancel booking.",
        HTTP_400: "This booking cannot be cancelled in its current status.",
        HTTP_402: "Could not reverse token hold for cancellation.",
      },
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
      retry: { enabled: true, maxAttempts: 3, baseDelayMs: 250, maxDelayMs: 2000, jitterRatio: 0.2 },
      etag: { enabled: true, varyByPayload: true },
      localCache: { enabled: true, ttlMs: 45000, version: 2, varyByPayload: true },
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
        { type: "stateEngine", key: "rental.catalog.items", mode: "set", select: "items" },
        { type: "stateEngine", key: "rental.catalog.meta", mode: "merge", value: { updatedAt: "@now" } },
        { type: "stateEngine", key: "rental.audit.trail", mode: "push", value: { at: "@now", action: "catalog_loaded" } },
        { type: "piniaAction", storeId: "rental", action: "setCatalog", select: "items" },
        { type: "piniaAction", storeId: "rental", action: "mergeCatalogMeta", value: { updatedAt: "@now" } },
        { type: "piniaPatch", storeId: "rental", patch: (data) => ({ catalogEnvelope: data }), hydrateOnReadHit: true },
        { type: "local", key: "rental:catalog", ttlMs: 45000, version: 2 },
        { type: "object", key: "rental.lastCatalogRun", value: { at: "@now" } },
      ],
      onNotModified: [
        { type: "stateEngine", key: "rental.catalog.meta", mode: "merge", value: { checkedAt: "@now" } },
        { type: "piniaAction", storeId: "rental", action: "mergeCatalogMeta", value: { checkedAt: "@now" } },
      ],
      uiErrorMap: {
        MISSING_CREATOR_ID: "Creator id is required before loading rentals.",
        FETCH_RENTAL_CATALOG_FAILED: "Could not load rental catalog right now.",
      },
    },
    refresh: { enabled: true, intervalMs: 60000, scopeKey: "rental.fetchCatalog" },
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
      retry: { enabled: true, maxAttempts: 2, baseDelayMs: 200, maxDelayMs: 1000, jitterRatio: 0.1 },
      etag: { enabled: true, varyByPayload: true },
      localCache: { enabled: true, ttlMs: 15000, version: 1, varyByPayload: true },
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
        { type: "stateEngine", key: "rental.availability.current", mode: "set" },
        { type: "stateEngine", key: "rental.availability.meta", mode: "merge", value: { updatedAt: "@now" } },
        { type: "piniaAction", storeId: "rental", action: "setAvailability" },
        { type: "local", key: "rental:availability", ttlMs: 15000, version: 1 },
      ],
      onNotModified: [
        { type: "stateEngine", key: "rental.availability.meta", mode: "merge", value: { checkedAt: "@now" } },
      ],
      uiErrorMap: {
        MISSING_RENTAL_ID: "Please select a rental first.",
        MISSING_DATE: "Please select a date first.",
        FETCH_RENTAL_AVAILABILITY_FAILED: "Could not load availability right now.",
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
      retry: { enabled: true, maxAttempts: 2, baseDelayMs: 250, maxDelayMs: 1200, jitterRatio: 0.1 },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: true },
      idempotency: { enabled: true, headerName: "Idempotency-Key", keyFrom: "idempotencyKey" },
      destinations: [
        { type: "stateEngine", key: "rental.reservation.pending", mode: "set" },
        { type: "stateEngine", key: "rental.audit.trail", mode: "push", value: { at: "@now", action: "reservation_created" } },
        { type: "piniaAction", storeId: "rental", action: "setActiveReservation" },
        { type: "piniaAction", storeId: "rental", action: "pushAction", value: { at: "@now", action: "reservation_created" } },
        { type: "local", key: "rental:lastReservation", ttlMs: 300000, version: 1 },
        { type: "object", key: "rental.lastCreateReservation", value: { at: "@now" } },
      ],
      uiErrorMap: {
        CREATE_RENTAL_RESERVATION_FAILED: "Could not create reservation. Please retry.",
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
      idempotency: { enabled: true, headerName: "Idempotency-Key", keyFrom: "idempotencyKey" },
      destinations: [
        { type: "stateEngine", key: "rental.reservation.pending", mode: "merge", value: { status: "confirmed", confirmedAt: "@now" } },
        { type: "piniaPatch", storeId: "rental", patch: (data) => ({ activeReservation: data }) },
        { type: "piniaAction", storeId: "rental", action: "pushAction", value: { at: "@now", action: "reservation_confirmed" } },
        { type: "localFlush", key: "rental:availability" },
      ],
      uiErrorMap: {
        CONFIRM_RENTAL_RESERVATION_FAILED: "Could not confirm reservation. Please retry.",
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
      concurrency: { policy: "allowParallel", dedupe: false, keyByPayload: true },
      destinations: [
        { type: "stateEngine", key: "rental.reservation.pending", mode: "merge", value: { status: "cancelled", cancelledAt: "@now" } },
        { type: "piniaAction", storeId: "rental", action: "pushAction", value: { at: "@now", action: "reservation_cancelled" } },
        { type: "localFlush", key: "rental:lastReservation" },
      ],
      uiErrorMap: {
        CANCEL_RENTAL_RESERVATION_FAILED: "Could not cancel reservation right now.",
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

  "chat.createChat": {
    flowKind: "write",
    flow: createChatFlow,
    pipeline: {
      timeouts: { requestMs: 10000, totalFlowMs: 15000 },
      retry: { enabled: true, maxAttempts: 1, baseDelayMs: 250, maxDelayMs: 1000, jitterRatio: 0.1 },
      concurrency: { policy: "firstWins", dedupe: false, keyByPayload: false },
      destinations: [
        { type: "stateEngine", key: "chat.createResult", mode: "set", select: "chatId" }
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
      retry: { enabled: true, maxAttempts: 3, baseDelayMs: 500, maxDelayMs: 3000, jitterRatio: 0.2 },
      concurrency: { policy: "allowParallel", dedupe: false, keyByPayload: true },
      destinations: [
        { type: "piniaAction", storeId: "chat", action: "addMessageAction" },
      ],
      uiErrorMap: {
        SEND_MESSAGE_MISSING_CHAT_ID: "Chat ID is missing.",
        SEND_MESSAGE_FAILED: "Message could not be sent.",
      },
    },
  },
  "chat.fetchMessages": {
    flowKind: "read",
    flow: fetchMessagesFlow,
    pipeline: {
      timeouts: { requestMs: 12000, totalFlowMs: 20000 },
      retry: { enabled: true, maxAttempts: 2, baseDelayMs: 250, maxDelayMs: 1500, jitterRatio: 0.1 },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [
        { type: "piniaAction", storeId: "chat", action: "prependMessagesAction" },
      ],
      uiErrorMap: {
        FETCH_MESSAGES_MISSING_CHAT_ID: "Chat ID is required.",
        FETCH_MESSAGES_FAILED: "Could not load messages.",
      },
    },
  },
};
