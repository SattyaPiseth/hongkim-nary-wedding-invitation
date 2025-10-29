import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import "aos/dist/aos.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { coverLoader } from "./routes/loaders.js";
import App from "./App.jsx";
import CoverPage from "./pages/CoverPage.jsx";
import Spinner from "./components/button/Spinner.jsx";

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

// App root component with Suspense and conditional SpeedInsights
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={
        <div className="min-h-screen grid place-items-center">
          <Spinner size="lg" label="Loading application" />
        </div>
      }>
      <RouterProvider router={router} />
    </Suspense>

    {/* Render SpeedInsights only in production environment */}
    {import.meta.env.PROD && <SpeedInsights />}
  </StrictMode>
);
