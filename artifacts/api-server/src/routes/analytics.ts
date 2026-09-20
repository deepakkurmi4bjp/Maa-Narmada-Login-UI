import { Router, type IRouter } from "express";

const router: IRouter = Router();

/**
 * Analytics integration endpoint
 * 
 * Note: Vercel Web Analytics is designed for client-side/frontend applications.
 * This endpoint provides information for frontend applications that consume this API.
 */
router.get("/analytics/info", (_req, res) => {
  res.json({
    name: "Vercel Web Analytics",
    version: "2.0.1",
    package: "@vercel/analytics",
    type: "client-side",
    description: "Web Analytics is a client-side analytics solution for tracking page views and user interactions in frontend applications",
    documentation: "https://vercel.com/docs/analytics/quickstart",
    note: "This API server has the @vercel/analytics package installed. To use Web Analytics, integrate it in your frontend application according to the framework-specific instructions in the documentation.",
    supportedFrameworks: [
      "Next.js",
      "React",
      "Vue",
      "Svelte",
      "Remix",
      "Astro",
      "Nuxt",
      "SvelteKit"
    ]
  });
});

export default router;
