export const parseReceiptAIResponse = (aiText: string) => {

  const text = aiText.toLowerCase();

  const amountMatch =
    text.match(/total[^0-9]*(\d+\.\d{2})/) ||
    text.match(/amount[^0-9]*(\d+\.\d{2})/) ||
    text.match(/(\d+\.\d{2})/g);

  const dateMatch = text.match(
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/
  );

  const lines = text.split("\\n");

  return {

    title: lines[0] || "Receipt",

    amount: amountMatch
      ? parseFloat(
          Array.isArray(amountMatch)
            ? amountMatch[1] || amountMatch[0]
            : amountMatch[0]
        )
      : null,

    date: dateMatch ? dateMatch[0] : null,

    description: text.substring(0, 200),

    category: "expense",

    paymentMethod: text.includes("visa")
      ? "card"
      : text.includes("cash")
      ? "cash"
      : "unknown",

    type: "expense",

  };

};

