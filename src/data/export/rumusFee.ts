export const CalculateFee = (value  : number) => {
  const fee = Math.max((value * 0.7) / 100).toFixed(0);
  console.log("fee : ", fee);
  return fee;
};

