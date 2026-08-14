// import * as FileSystem from "expo-file-system/legacy";

//  const OCR_API_KEY = "K87050801888957"; // free key from https://ocr.space/ocrapi

// export async function ocrFile(uri, mimeType = "image/jpeg") {
//   const base64 = await FileSystem.readAsStringAsync(uri, {
//     encoding: FileSystem.EncodingType.Base64,
//   });

//   const body = new FormData();
//   body.append("base64Image", `data:${mimeType};base64,${base64}`);
//   body.append("language", "eng");
//   body.append("isTable", "true");
//   body.append("OCREngine", "2");
//   if (mimeType === "application/pdf") body.append("filetype", "PDF");

//   const res = await fetch("https://api.ocr.space/parse/image", {
//     method: "POST",
//     headers: { apikey: OCR_API_KEY },
//     body,
//   });
//   const json = await res.json();
//   if (json.IsErroredOnProcessing) {
//     throw new Error(json.ErrorMessage?.[0] || "Could not read that file");
//   }
//   return (json.ParsedResults || []).map((r) => r.ParsedText).join("\n");
// }

// const CATEGORY_RULES = [
//   { name: "Food & Drinks", words: ["restaurant", "cafe", "coffee", "pizza", "food", "kfc", "bar", "eatery", "kitchen", "bakery"] },
//   { name: "Shopping", words: ["mall", "store", "shop", "mart", "supermarket", "boutique", "market"] },
//   { name: "Transportation", words: ["uber", "bolt", "taxi", "fuel", "petrol", "diesel", "transport", "bus", "flight", "airway"] },
//   { name: "Entertainment", words: ["cinema", "movie", "netflix", "spotify", "game", "concert", "ticket"] },
//   { name: "Bills", words: ["electric", "water", "internet", "airtime", "data", "subscription", "utility", "rent", "invoice", "bill"] },
//   { name: "Income", words: ["salary", "payroll", "credited", "credit alert", "received", "payment received", "refund", "deposit"] },
//   { name: "Transfer", words: ["transfer", "wire", "remittance", "sent to"] },
// ];

// const INCOME_WORDS = ["credit alert", "credited", "salary", "payment received", "received from", "deposit", "refund", "income"];

// // Pick the most likely transaction amount
// function extractAmount(text) {
//   const lines = text.split(/\r?\n/);
//   const numberRe = /(?:₦|NGN|N|\$|€|£)?\s?((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)/gi;
//   const priority = ["grand total", "total amount", "amount paid", "total due", "total", "amount", "balance"];

//   for (const key of priority) {
//     for (const line of lines) {
//       if (line.toLowerCase().includes(key)) {
//         const matches = [...line.matchAll(numberRe)].map((m) => parseFloat(m[1].replace(/,/g, "")));
//         const valid = matches.filter((n) => !isNaN(n) && n > 0);
//         if (valid.length) return Math.max(...valid);
//       }
//     }
//   }
//   // fallback: largest number in the document
//   const all = [...text.matchAll(numberRe)]
//     .map((m) => parseFloat(m[1].replace(/,/g, "")))
//     .filter((n) => !isNaN(n) && n > 0 && n < 100000000);
//   return all.length ? Math.max(...all) : null;
// }

// function extractTitle(text) {
//   const lines = text
//     .split(/\r?\n/)
//     .map((l) => l.trim())
//     .filter((l) => l.length > 2 && !/^[\d\W]+$/.test(l));
//   if (!lines.length) return "";
//   const merchant = lines.find((l) => /[A-Za-z]{3,}/.test(l)) || lines[0];
//   return merchant.replace(/\s+/g, " ").slice(0, 40);
// }

// export function parseReceiptText(text) {
//   const lower = text.toLowerCase();
//   const isIncome = INCOME_WORDS.some((w) => lower.includes(w));
//   const rule = CATEGORY_RULES.find((c) => c.words.some((w) => lower.includes(w)));

//   return {
//     title: extractTitle(text),
//     amount: extractAmount(text),
//     isExpense: !isIncome,
//     category: isIncome ? "Income" : rule ? rule.name : "Other",
//     rawText: text,
//   };
// }

// export async function scanFile(uri, mimeType) {
//   const text = await ocrFile(uri, mimeType);
//   return parseReceiptText(text);
// }







import * as FileSystem from "expo-file-system/legacy";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Paste your key here (or better yet, put it in your .env file as EXPO_PUBLIC_GEMINI_API_KEY)
// const GEMINI_API_KEY = "your_gemini_api_key_here"; // Replace with

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function scanFile(uri, mimeType = "image/jpeg") {
  try {
    // 1. Read the image as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 2. Initialize the fast Vision model
   const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    // 3. Give it explicit instructions to return JSON
    const prompt = `
      Analyze this receipt, invoice, or financial document. 
      Extract the data and return it STRICTLY as a valid JSON object with NO markdown formatting, NO backticks, and NO extra text.
      
      Use exactly these keys:
      - "title": The merchant name, store name, or sender.
      - "amount": The final total amount paid or received (as a pure number, no currency symbols).
      - "isExpense": true if this is a receipt/bill/payment. false if it is an income/credit/deposit.
      - "category": Categorize the transaction into EXACTLY one of these strings: "Food & Drinks", "Shopping", "Transportation", "Entertainment", "Bills", "Income", "Transfer", or "Other".
    `;

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: mimeType, // Supports image/jpeg, image/png, application/pdf
      },
    };

    // 4. Send to Gemini
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // 5. Clean the response (sometimes AI adds ```json wrapping, we strip that out)
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // 6. Parse and return the perfect object!
    const parsedData = JSON.parse(cleanedText);
    return parsedData;

  } catch (error) {
    console.error("Scanning Error:", error);
    throw new Error("Failed to read the receipt. Please try taking a clearer photo.");
  }
}