import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const err = useRouteError();
  return (
    <div style={{ padding: 24 }}>
      <h1>Something went wrong</h1>
      <pre>{(err && (err.statusText || err.message)) || String(err)}</pre>
    </div>
  );
}