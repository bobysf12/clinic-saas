const formatter = new Intl.NumberFormat("id-ID", {
  currency: "IDR",
  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  maximumFractionDigits: 2, // (causes 2500.99 to be printed as $2,501)
});

export function formatCurrency(amount: number) {
  return formatter.format(amount);
}

export function formatIDR(amount: number) {
  return "Rp" + formatCurrency(amount);
}
