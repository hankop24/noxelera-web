export function formatCurrency(value) {
  return `₺${Math.round(value || 0).toLocaleString("tr-TR")}`;
}

export function formatDate(value) {
  if (!value) return "Tarih seçilmedi";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function recommendedDateText(exam) {
  const start = exam.recommendedStartDate;
  const end = exam.recommendedEndDate;
  if (!start && !end) return "Tarih belirlenmedi";
  if (!end || end === start) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
}
