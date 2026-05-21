export function getNetPrice(listPrice, discountRate) {
  return Number(listPrice || 0) * (1 - Number(discountRate || 0) / 100);
}


