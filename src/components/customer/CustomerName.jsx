import { useParams } from "react-router-dom";
import customers from "../../data/json/customer.json";

export default function CustomerName() {
  const { uuid } = useParams();

  // Find matching customer
  const customer = customers.find((c) => c.uuid === uuid);

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <h1 className="text-2xl font-bold">❌ Customers not found</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <span
        role="heading"
        aria-level={2}
        className="
          moul-regular text-center
          leading-normal lg:leading-tight
          tracking-[0.005em]
          text-lg sm:text-2xl lg:text-3xl xl:text-[1.875rem] 2xl:text-[2rem]
          text-[var(--gold)]
        "
      >
        {customer.full_name}
      </span>
    </div>
  );
}
