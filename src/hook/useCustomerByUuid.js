// src/hook/useCustomerByUuid.js
import { useParams } from "react-router-dom";
import { findCustomerByUuid } from "../lib/customers";

export default function useCustomerByUuid() {
  const { uuid } = useParams();
  return findCustomerByUuid(uuid);
}
