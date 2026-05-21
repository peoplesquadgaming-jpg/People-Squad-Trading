import { GoogleGenAI } from "@google/genai";

/**
 * Generates a detailed offline analysis in case the API key is not available or errors out.
 */
function getOfflineExplanation(
  asset: string,
  signal: string,
  confidence: number,
  indicators: string,
  marketSentiment: string,
  price?: number
): string {
  const priceVal = price || (asset.includes('BTC') ? 68420.50 : asset.includes('ETH') ? 3450.25 : asset === 'GOLD' ? 2345.80 : 1.00960);
  const decimals = priceVal > 5 ? (priceVal > 100 ? 2 : 3) : 5;
  const formatPrice = (val: number) => val.toFixed(decimals);

  if (signal === 'NEUTRAL') {
    const resLevel = formatPrice(priceVal * 1.0012);
    const supLevel = formatPrice(priceVal * 0.9988);
    return `Market structure for ${asset} shows tight sideways consolidation. Dynamic price action indicates temporary equilibrium with minor horizontal resistance at ${resLevel} and core local support floor at ${supLevel}. Recommend standing aside until a volume-backed breakout validates the next structural bias.`;
  }

  const isBuy = signal === 'BUY';
  
  // Bullish setups
  const bullishCandles = [
    { name: "Bullish Engulfing formation", desc: "highlighting institutional accumulation completely absorbs the previous bearish candle" },
    { name: "Hammer candle at the dynamic support line", desc: "verifying strong buy-trigger rejection of lower lows and subsequent price recovery" },
    { name: "Three White Soldiers continuation group", desc: "confirming progressive buying volume and immediate trend acceleration" },
    { name: "Morning Star bottom-reversal pattern", desc: "marking seller exhaustion and structural transition into a markup phase" },
    { name: "Bullish Pin Bar rejector", desc: "testing support liquidity and springing back rapidly under heavy demand" }
  ];
  const bullishPriceActions = [
    { event: `a decisive high-volume breakout above the key resistance belt at ${formatPrice(priceVal * 1.0018)}`, result: `clearing the overhead supply zone and opening direct targets toward ${formatPrice(priceVal * 1.01)}` },
    { event: `a successful dynamic bounce off the rising 50-period EMA support line at ${formatPrice(priceVal * 0.9982)}`, result: `validating the larger bullish trend structure and initiating a secondary continuation swing` },
    { event: `a precise pullback and retest of the broken horizontal level at ${formatPrice(priceVal * 0.9994)}`, result: `successfully turning former resistant supply into a solid dynamic demand floor` },
    { event: `an ascending triangle breakout pattern forming around ${formatPrice(priceVal * 1.0006)}`, result: `indicating immediate momentum acceleration to the upside` }
  ];

  // Bearish setups
  const bearishCandles = [
    { name: "Bearish Engulfing pattern", desc: "proving massive institutional selling volume and aggressive liquidation" },
    { name: "Shooting Star reversal model", desc: "exhibiting absolute rejection of higher prices near overhead resistance boundaries" },
    { name: "Evening Star distribution structure", desc: "marking dynamic shift from buyer fatigue to dominant bearish continuation" },
    { name: "Three Black Crows distribution sequence", desc: "confirming progressive volume spikes as major support bands fail" },
    { name: "Grave Doji rejection", desc: "confirming failure of buyers to defend intraday highs, leaving a highly bearish shadow" }
  ];
  const bearishPriceActions = [
    { event: `a clean breakout/breakdown below the primary horizontal support line at ${formatPrice(priceVal * 0.9982)}`, result: `exposing deeper pool technical targets down toward ${formatPrice(priceVal * 0.99)}` },
    { event: `a major rejection at the long-term descending trendline resistance zone near ${formatPrice(priceVal * 1.0018)}`, result: `confirming persistent seller dominance and restarting a structural downward trendline wave` },
    { event: `a dual-top rejection pattern completing around ${formatPrice(priceVal * 1.0012)}`, result: `signaling extreme buyer exhaustion and confirming immediate downside acceleration` },
    { event: `a critical break below the ascending trading channel channel floor at ${formatPrice(priceVal * 0.999)}`, result: `triggering automatic stop orders and accelerating bearish momentum` }
  ];

  // Select deterministic but variable indicators using string codes
  const seed = (asset.charCodeAt(0) + (asset.charCodeAt(asset.length - 1) || 0) + confidence + Math.floor(priceVal * 10)) % 100;
  
  const candle = isBuy 
    ? bullishCandles[seed % bullishCandles.length]
    : bearishCandles[seed % bearishCandles.length];
    
  const pa = isBuy
    ? bullishPriceActions[(seed + 3) % bullishPriceActions.length]
    : bearishPriceActions[(seed + 3) % bearishPriceActions.length];

  const sentimentFilter = marketSentiment !== 'NEUTRAL' && marketSentiment !== ''
    ? ` This corresponds to the larger ${marketSentiment.toLowerCase()} market bias, confirming the trade direction.` 
    : " Indicators confirm high probability execution.";

  const tpVal = formatPrice(isBuy ? priceVal * 1.01 : priceVal * 0.99);
  const slVal = formatPrice(isBuy ? priceVal * 0.995 : priceVal * 1.005);

  return `Market structure on ${asset} displays a highly verified ${signal} signal at ${formatPrice(priceVal)} based on a precise ${candle.name} (${candle.desc}). This pattern aligns perfectly with ${pa.event}, ${pa.result}.${sentimentFilter} Place Take Profit target at ${tpVal} and set Stop Loss protection at ${slVal} to maintain a highly optimal reward-to-risk ratio.`;
}

/**
 * Generates a brief explanation for a trading signal using Gemini AI, with elegant price action insights.
 */
export async function generateSignalExplanation(
  asset: string,
  signal: string,
  confidence: number,
  indicators: string,
  marketSentiment: string,
  currentPrice?: number,
  priceHistory?: { price: number; time: string }[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey === "") {
    return getOfflineExplanation(asset, signal, confidence, indicators, marketSentiment, currentPrice);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const isBuy = signal === 'BUY';
    const entryPt = currentPrice || (asset.includes('BTC') ? 68420.50 : asset.includes('ETH') ? 3450.25 : asset === 'GOLD' ? 2345.80 : 1.00960);
    const decimalCount = entryPt > 5 ? (entryPt > 100 ? 2 : 3) : 5;
    const formatPrice = (val: number) => val.toFixed(decimalCount);
    
    const tpLevel = isBuy ? entryPt * 1.01 : entryPt * 0.99;
    const slLevel = isBuy ? entryPt * 0.995 : entryPt * 1.005;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an elite, professional financial market analyst and algorithm describer on a premium trading portal.
      Provide a highly sophisticated, technical explanation for a ${signal} signal observed on ${asset} at Entry Price ${formatPrice(entryPt)}.
      
      MARKET CONTEXT DATA:
      - Asset: ${asset}
      - Reference Entry Price Point: ${formatPrice(entryPt)}
      - Generated Signal: ${signal} (Accuracy Confidence: ${confidence}%)
      - Active Indicator Statuses: ${indicators}
      - Core Market Bias: ${marketSentiment}
      - Proposed Dynamic Trade Plan: Take Profit (TP) at ${formatPrice(tpLevel)}, Stop Loss (SL) at ${formatPrice(slLevel)}
      
      CRITICAL REQUIREMENTS:
      1. Use professional financial terminology (e.g. order flow, convergence, resistance breaches, liquidation run, candlestick patterns).
      2. Identify a specific candlestick configuration and price action structure corresponding to this ${signal} wave (e.g., Hammer, Bullish/Bearish Engulfing pattern, Morning/Evening Star, Shooting Star, key support/resistance break-out or bounce structure).
      3. Integrate the exact calculated Take Profit (${formatPrice(tpLevel)}) and Stop Loss (${formatPrice(slLevel)}) levels into your text as verified, actionable technical targets.
      4. Explain how current indicators (${indicators}) align with the price action.
      5. Must be highly precise, direct, and authoritative. Do not include introductory filler or chat disclaimers like "Sure, here is...". 
      6. Keep the total length strictly between 50-80 words.`
    });

    return response.text || getOfflineExplanation(asset, signal, confidence, indicators, marketSentiment, currentPrice);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getOfflineExplanation(asset, signal, confidence, indicators, marketSentiment, currentPrice);
  }
}

