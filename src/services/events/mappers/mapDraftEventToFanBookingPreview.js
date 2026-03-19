import { createEventMapper } from "@/services/events/mappers/createEventMapper.js";
import { mapSingleEventFromResponse } from "@/services/events/mappers/fetchCreatorEventsMapper.js";

function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function htmlToPreviewText(value) {
  if (typeof value !== "string") return "";
  const noTags = value.replace(/<[^>]*>/g, " ");
  const collapsed = noTags.replace(/\s+/g, " ").trim();
  return collapsed;
}

function hasAnySlotRows(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return false;
  return rows.some((row) => {
    const slots = Array.isArray(row?.slots) ? row.slots : [];
    return slots.some((slot) => {
      const start = typeof slot?.startTime === "string" ? slot.startTime.trim() : "";
      const end = typeof slot?.endTime === "string" ? slot.endTime.trim() : "";
      return Boolean(start && end);
    });
  });
}

function hasExplicitDraftSchedule(draftState = {}) {
  const repeatRule = String(draftState?.repeatRule || "weekly");
  if (repeatRule === "doesNotRepeat") {
    return hasAnySlotRows(draftState?.oneTimeAvailability);
  }
  return hasAnySlotRows(draftState?.weeklyAvailability);
}

export function mapDraftEventToFanBookingPreview(draftState = {}, options = {}) {
  const creatorId = toNumber(options.creatorId ?? draftState?.creatorId, 1);
  const syntheticEventId = String(options.previewEventId || `preview_event_${creatorId}`);

  const rawEvent = createEventMapper(
    {
      ...(draftState || {}),
      creatorId,
    },
    { creatorId },
  );

  const eventRecord = {
    ...rawEvent,
    id: syntheticEventId,
    eventId: syntheticEventId,
    creatorId,
    status: "active",
    description: htmlToPreviewText(rawEvent?.description || draftState?.eventDescription || ""),
  };

  const hasExplicitSchedule = hasExplicitDraftSchedule(draftState);
  if (!hasExplicitSchedule) {
    eventRecord.slots = [];
    eventRecord.eventTime = null;
  }

  const mapped = mapSingleEventFromResponse(eventRecord);

  if (!hasExplicitSchedule) {
    mapped.localStartHm = null;
    mapped.localEndHm = null;
    mapped.start = null;
    mapped.end = null;
  }

  return {
    ...mapped,
    id: syntheticEventId,
    eventId: syntheticEventId,
    status: "active",
    raw: eventRecord,
  };
}
