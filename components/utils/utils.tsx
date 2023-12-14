import BigNumber from "bignumber.js";

export const formatBidAmount = (bidAmount: BigNumber.Value) => {
  // Convert the bid amount to BigNumber for precise calculations
  const amountInUgraviton = new BigNumber(bidAmount);

  // Convert ugraviton to graviton (1 graviton = 1,000,000 ugraviton)
  const amountInGraviton = amountInUgraviton.dividedBy(1000000);

  // If the amount is less than 1,000,000 ugraviton, format it with up to 5 decimal places
  if (amountInUgraviton.isLessThan(1000000)) {
    return amountInGraviton.toFormat();
  } else {
    // For amounts equal or above 1,000,000 ugraviton, show whole number or decimal if present
    return amountInGraviton.toFormat(
      amountInGraviton.decimalPlaces() || 0 > 0
        ? amountInGraviton.decimalPlaces() || 0
        : 0
    );
  }
};

export const formatTotalBidCost = (
  bidAmountInput: string,
  bidFeeAmount: string
) => {
  // Convert bidAmountInput to a number
  const bidAmountNumber = Number(bidAmountInput);

  // Convert bidFeeAmount to a number
  const bidFeeAmountNumber = Number(bidFeeAmount);

  // Calculate the total bid cost in smaller units (ugraviton)
  const totalBidCostUgraviton = bidAmountNumber + bidFeeAmountNumber;

  // Convert the total bid cost back to graviton (1 graviton = 1,000,000 ugraviton)
  const totalBidCostGraviton = totalBidCostUgraviton / 1e6;

  // Format and return the total bid cost
  return totalBidCostGraviton.toFixed(6).toString() + " GRAVITON";
};
