"use client";

import { WHIP_URL } from "@/config/config";

export const createWhipUrl = (streamKey: string) => {
  const url = new URL("whip", `${WHIP_URL}${streamKey}/publish`);

  url.searchParams.set("video-codec", "h264/90000");
  url.searchParams.set("audio-codec", "pcmu/8000");

  return url.toString();
};