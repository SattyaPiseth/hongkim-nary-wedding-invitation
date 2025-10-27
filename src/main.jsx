// main.jsx
import { StrictMode, lazy, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import "aos/dist/aos.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { coverLoader } from "./routes/loaders.js";
import App from "./App.jsx";
import CoverPage from "./pages/CoverPage.jsx";

const ErrorPage = lazy(() => import("./routes/ErrorPage.jsx"));
const HomePage  = lazy(() => import("./pages/HomePage.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <CoverPage />, loader: coverLoader },
      { path: "home", element: <HomePage /> },
      { path: ":uuid", element: <CoverPage />, loader: coverLoader },
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);

// Wrapper component to manage MutationObserver
function MutationObserverWrapper() {
  useEffect(() => {
    const rootEl = document.getElementById("root");

    if (rootEl) {
      rootEl.removeAttribute("aria-hidden");
      rootEl.removeAttribute("data-aria-hidden");

      const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (
            m.type === "attributes" &&
            (m.attributeName === "aria-hidden" || m.attributeName === "data-aria-hidden")
          ) {
            rootEl.removeAttribute("aria-hidden");
            rootEl.removeAttribute("data-aria-hidden");
          }
        }
      });

      mo.observe(rootEl, {
        attributes: true,
        attributeFilter: ["aria-hidden", "data-aria-hidden"],
      });

      // Cleanup observer when the component unmounts
      return () => {
        mo.disconnect();
      };
    }
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return null; // No visible rendering needed
}

// App root component with Suspense and conditional SpeedInsights
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>

    {/* Render SpeedInsights only in production environment */}
    {process.env.NODE_ENV === "production" && <SpeedInsights />}

    <MutationObserverWrapper />
  </StrictMode>
);
