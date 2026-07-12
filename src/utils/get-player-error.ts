import { ErrorData, ErrorDetails } from "hls.js";

export function getPlayerError(data: ErrorData) {
  if (
    data.details === ErrorDetails.MANIFEST_INCOMPATIBLE_CODECS_ERROR
  ) {
    return "Unsupported codecs";
  }

  if (
    data.response?.code === 404 ||
    data.details === ErrorDetails.MANIFEST_LOAD_ERROR
  ) {
    return "Waiting for stream...";
  }

  return "Connection lost. Reconnecting...";
}