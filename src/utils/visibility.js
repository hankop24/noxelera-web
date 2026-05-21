export function isExamVisibleForCustomer(exam, customer) {
  if (!exam.active) return false;
  if (exam.visibility === "selected") return exam.visibleCustomerIds.includes(customer.id);
  return true;
}


