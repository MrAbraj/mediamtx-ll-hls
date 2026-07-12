# Architecture

```text
                WebRTC (WHIP)
+--------+  ───────────────────▶  +-----------+
|  Host  |                        | MediaMTX  |
+--------+                        +-----------+
                                       │
                                       │ Generates LL-HLS
                                       ▼
                                 +-----------+
                                 |    CDN    |
                                 +-----------+
                                       │
                  ┌────────────────────┼────────────────────┐
                  ▼                    ▼                    ▼
             +---------+          +---------+          +---------+
             | Viewer  |          | Viewer  |    ...   | Viewer  |
             +---------+          +---------+          +---------+
```

## Flow

1. The **host** publishes audio/video to **MediaMTX** using **WebRTC (WHIP)**.
2. **MediaMTX** converts the incoming stream into **Low-Latency HLS (LL-HLS)**.
3. The generated HLS playlist, segments, and parts are cached and distributed by a **CDN**.
4. **Viewers** play the stream using **HLS.js**, achieving approximately **500 ms** end-to-end latency in local testing.

## Why this architecture?

A pure WebRTC broadcast requires the media server to maintain and forward a media stream to every connected viewer.

```
Host → Media Server → 1,000,000 WebRTC viewers
```

As the audience grows, the server's bandwidth and CPU usage increase significantly.

This project instead uses a hybrid architecture:

- **WebRTC (WHIP)** for ultra-low latency publishing.
- **Low-Latency HLS** for viewer playback.
- **CDN** for global distribution.

After MediaMTX generates LL-HLS segments, viewers simply download them over HTTP. Since the content is cacheable, most requests are served directly from the CDN rather than the MediaMTX server.

```
Host
   │
WebRTC (WHIP)
   │
MediaMTX
   │
LL-HLS
   │
CDN
   ├── Viewer 1
   ├── Viewer 2
   ├── Viewer 3
   └── ...
```

## Benefits

- 🚀 ~500 ms end-to-end latency (local testing)
- 🌍 CDN-powered global distribution
- 📈 Designed to scale to millions of concurrent viewers when deployed behind a CDN
- 💰 Lower infrastructure cost than large-scale WebRTC broadcasting
- ⚡ Minimal load on the origin server
- 🛠️ Simple architecture built on open standards

## Tech Stack

- **Next.js** – Frontend
- **React** – UI
- **TypeScript** – Type safety
- **Chakra UI** – Component library
- **MediaMTX** – Streaming server
- **WebRTC (WHIP)** – Host publishing
- **Low-Latency HLS** – Viewer playback
- **HLS.js** – Browser player