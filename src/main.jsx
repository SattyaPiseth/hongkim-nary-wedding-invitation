// main.jsx
import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { coverLoader } from "./routes/loaders.js";
import App from "./App.jsx";
import Spinner from "./components/button/Spinner.jsx";

const ErrorPage = lazy(() => import("./routes/ErrorPage.jsx"));
const HomePage  = lazy(() => import("./pages/HomePage.jsx"));
const CoverPage = lazy(() => import("./pages/CoverPage.jsx")); // ⬅️ make lazy

const RouteFallback = (
  <div className="fixed inset-0 z-[70] grid place-items-center bg-black/5 backdrop-blur-[2px]">
    <Spinner size="lg" label="Loading page…" />
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: (
      <Suspense fallback={RouteFallback}>
        <ErrorPage />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={RouteFallback}>
            <CoverPage />
          </Suspense>
        ),
        loader: coverLoader,
      },
      {
        path: "home",
        element: (
          <Suspense fallback={RouteFallback}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: ":uuid",
        element: (
          <Suspense fallback={RouteFallback}>
            <CoverPage />
          </Suspense>
        ),
        loader: coverLoader,
      },
      {
        path: "*",
        element: (
          <Suspense fallback={RouteFallback}>
            <ErrorPage />
          </Suspense>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center">
          <Spinner size="lg" label="Loading application" />
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
    {import.meta.env.PROD && <SpeedInsights />}
  </StrictMode>
);
