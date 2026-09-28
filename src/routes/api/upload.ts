import { createFileRoute } from "@tanstack/react-router";
import { handleUploadRequest } from "@/lib/server/upload";

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: ({ request }) => handleUploadRequest(request),
    },
  },
});
