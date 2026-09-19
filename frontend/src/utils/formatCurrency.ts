/**
 * Format an amount as Zambian Kwacha.
 *
 * Examples:
 * 500   -> K500.00
 * 1500  -> K1,500.00
 * 25000 -> K25,000.00
 */
export const formatZMW = (
  amount: number | string
): string => {
  const value = Number(amount);

  if (Number.isNaN(value)) {
    return "K0.00";
  }

  return `K${value.toLocaleString("en-ZM", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};