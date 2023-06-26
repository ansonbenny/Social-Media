export const FiveDigit = () => {
  const digit = Math.random?.()?.toString?.()?.replace("0.", "") || "19354";

  let newDigit = "";

  while (newDigit?.length < 5) {
    newDigit += digit[newDigit?.length];

    if (newDigit?.length >= 5) {
      return newDigit;
    }
  }
};
