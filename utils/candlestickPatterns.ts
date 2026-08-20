export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ComputedCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  
  isBullish: boolean;
  isBearish: boolean;
  candleRange: number;
  bodyHigh: number;
  bodyLow: number;
  bodySize: number;
  upperWick: number;
  lowerWick: number;
  bodyMidpoint: number;
  hasSignificantUpperWick: boolean;
  hasSignificantLowerWick: boolean;
  bodyAvg14: number;
}

export interface PatternMatch {
  timestamp: number;
  patternName: string;
  type: "bull" | "bear" | "neutral";
  description: string;
}

// Pre-defined pattern catalog
export interface PatternInfo {
  id: string;
  name: string;
  type: "bull" | "bear" | "neutral";
  description: string;
}

export const PATTERNS_CATALOG: PatternInfo[] = [
  { id: "abandonedBabyBull", name: "Bullish Abandoned Baby", type: "bull", description: "A rare 3-candle bullish reversal pattern: strong bearish candle, a gap-down Doji, and a gap-up bullish candle." },
  { id: "abandonedBabyBear", name: "Bearish Abandoned Baby", type: "bear", description: "A rare 3-candle bearish reversal pattern: strong bullish candle, a gap-up Doji, and a gap-down bearish candle." },
  { id: "darkCloudCover", name: "Dark Cloud Cover", type: "bear", description: "A 2-candle bearish reversal pattern: strong bullish candle followed by a bearish candle opening above high and closing below its midpoint." },
  { id: "doji", name: "Doji", type: "neutral", description: "A single-candle indecision pattern where the open and close are extremely close with upper and lower wicks." },
  { id: "dojiStarBull", name: "Bullish Doji Star", type: "bull", description: "A 2-candle bullish reversal pattern: strong bearish candle followed by a gap-down Doji." },
  { id: "dojiStarBear", name: "Bearish Doji Star", type: "bear", description: "A 2-candle bearish reversal pattern: strong bullish candle followed by a gap-up Doji." },
  { id: "downsideTasukiGap", name: "Downside Tasuki Gap", type: "bear", description: "A 3-candle bearish continuation pattern: two bearish candles with a gap, followed by a bullish candle that partially fills it." },
  { id: "dragonflyDoji", name: "Dragonfly Doji", type: "bull", description: "A bullish single Doji candle with little to no upper wick and a long lower wick." },
  { id: "engulfingBull", name: "Bullish Engulfing", type: "bull", description: "A 2-candle bullish reversal pattern where a large bullish body completely engulfs the prior small bearish body." },
  { id: "engulfingBear", name: "Bearish Engulfing", type: "bear", description: "A 2-candle bearish reversal pattern where a large bearish body completely engulfs the prior small bullish body." },
  { id: "eveningDojiStar", name: "Evening Doji Star", type: "bear", description: "A 3-candle bearish reversal pattern: strong bullish candle, a gap-up Doji, and a strong bearish candle closing deep inside candle 1." },
  { id: "eveningStar", name: "Evening Star", type: "bear", description: "A 3-candle bearish reversal pattern: strong bullish candle, a small gap-up body, and a strong bearish candle closing deep inside candle 1." },
  { id: "fallingThreeMethods", name: "Falling Three Methods", type: "bear", description: "A 5-candle bearish continuation pattern: large bearish candle, 3 small rising bullish candles within its range, and a final large bearish breakout close." },
  { id: "fallingWindow", name: "Falling Window", type: "bear", description: "A bearish continuation gap between two candles." },
  { id: "gravestoneDoji", name: "Gravestone Doji", type: "bear", description: "A bearish single Doji candle with little to no lower wick and a long upper wick." },
  { id: "hammer", name: "Hammer", type: "bull", description: "A bullish single reversal candle with a small body near the top and a long lower wick (>= 2x body)." },
  { id: "hangingMan", name: "Hanging Man", type: "bear", description: "A bearish single reversal candle with a small body near the top and a long lower wick (>= 2x body) appearing in an uptrend." },
  { id: "haramiCrossBull", name: "Bullish Harami Cross", type: "bull", description: "A 2-candle bullish reversal pattern: large bearish candle engulfing a small Doji candle." },
  { id: "haramiCrossBear", name: "Bearish Harami Cross", type: "bear", description: "A 2-candle bearish reversal pattern: large bullish candle engulfing a small Doji candle." },
  { id: "haramiBull", name: "Bullish Harami", type: "bull", description: "A 2-candle bullish reversal pattern: large bearish candle containing a smaller bullish candle body." },
  { id: "haramiBear", name: "Bearish Harami", type: "bear", description: "A 2-candle bearish reversal pattern: large bullish candle containing a smaller bearish candle body." },
  { id: "invertedHammer", name: "Inverted Hammer", type: "bull", description: "A bullish single reversal candle with a small body near the bottom and a long upper wick (>= 2x body)." },
  { id: "kickingBull", name: "Bullish Kicking", type: "bull", description: "A strong 2-candle reversal: bearish Marubozu followed by a gap-up bullish Marubozu." },
  { id: "kickingBear", name: "Bearish Kicking", type: "bear", description: "A strong 2-candle reversal: bullish Marubozu followed by a gap-down bearish Marubozu." },
  { id: "longLowerShadow", name: "Long Lower Shadow", type: "bull", description: "A single candle where the lower wick exceeds 75% of the total candle range." },
  { id: "longUpperShadow", name: "Long Upper Shadow", type: "bear", description: "A single candle where the upper wick exceeds 75% of the total candle range." },
  { id: "marubozuBlack", name: "Marubozu Black", type: "bear", description: "A strong single bearish candle with no wicks (or wicks <= 5% of body size)." },
  { id: "marubozuWhite", name: "Marubozu White", type: "bull", description: "A strong single bullish candle with no wicks (or wicks <= 5% of body size)." },
  { id: "morningDojiStar", name: "Morning Doji Star", type: "bull", description: "A 3-candle bullish reversal pattern: strong bearish candle, a gap-down Doji, and a strong bullish candle closing deep inside candle 1." },
  { id: "morningStar", name: "Morning Star", type: "bull", description: "A 3-candle bullish reversal pattern: strong bearish candle, a small gap-down body, and a strong bullish candle closing deep inside candle 1." },
  { id: "onNeck", name: "On Neck", type: "bear", description: "A 2-candle bearish continuation pattern: strong bearish candle followed by a small bullish candle closing near the low of candle 1." },
  { id: "piercing", name: "Piercing", type: "bull", description: "A 2-candle bullish reversal pattern: strong bearish candle followed by a bullish candle opening below low and closing above its midpoint." },
  { id: "risingThreeMethods", name: "Rising Three Methods", type: "bull", description: "A 5-candle bullish continuation pattern: large bullish candle, 3 small falling bearish candles within its range, and a final large bullish breakout close." },
  { id: "risingWindow", name: "Rising Window", type: "bull", description: "A bullish continuation gap between two candles." },
  { id: "shootingStar", name: "Shooting Star", type: "bear", description: "A bearish single reversal candle with a small body near the bottom and a long upper wick (>= 2x body) appearing in an uptrend." },
  { id: "spinningTopBlack", name: "Spinning Top Black", type: "neutral", description: "A bearish neutral candle showing indecision: small bearish body, long upper/lower wicks, and not a Doji." },
  { id: "spinningTopWhite", name: "Spinning Top White", type: "neutral", description: "A bullish neutral candle showing indecision: small bullish body, long upper/lower wicks, and not a Doji." }
];

function calculateEMA(values: number[], period: number): number[] {
  const ema: number[] = new Array(values.length).fill(0);
  if (values.length === 0) return ema;
  
  const k = 2 / (period + 1);
  
  // Calculate initial SMA
  let sum = 0;
  const limit = Math.min(period, values.length);
  for (let i = 0; i < limit; i++) {
    sum += values[i];
  }
  let prevEma = sum / limit;
  for (let i = 0; i < limit; i++) {
    ema[i] = prevEma;
  }
  
  for (let i = limit; i < values.length; i++) {
    const currentEma = values[i] * k + prevEma * (1 - k);
    ema[i] = currentEma;
    prevEma = currentEma;
  }
  
  return ema;
}

export function computeCandleProps(data: OHLCV[], bodyAvgLength = 14): ComputedCandle[] {
  const baseProps = data.map((c) => {
    const isBullish = c.open < c.close;
    const isBearish = c.open > c.close;
    const candleRange = c.high - c.low;
    const bodyHigh = Math.max(c.close, c.open);
    const bodyLow = Math.min(c.close, c.open);
    const bodySize = bodyHigh - bodyLow;
    const upperWick = c.high - bodyHigh;
    const lowerWick = bodyLow - c.low;
    const bodyMidpoint = bodyLow + bodySize / 2;
    const hasSignificantUpperWick = upperWick > 0.05 * bodySize;
    const hasSignificantLowerWick = lowerWick > 0.05 * bodySize;
    
    return {
      timestamp: c.timestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      isBullish,
      isBearish,
      candleRange,
      bodyHigh,
      bodyLow,
      bodySize,
      upperWick,
      lowerWick,
      bodyMidpoint,
      hasSignificantUpperWick,
      hasSignificantLowerWick
    };
  });
  
  const bodySizes = baseProps.map(b => b.bodySize);
  const ema14 = calculateEMA(bodySizes, bodyAvgLength);
  
  return baseProps.map((b, i) => ({
    ...b,
    bodyAvg14: ema14[i]
  }));
}

// Helpers corresponding to Pine Script logic
function isDojiBody(candle: ComputedCandle, maxBodyPercent: number): boolean {
  return candle.candleRange > 0 && candle.bodySize <= candle.candleRange * maxBodyPercent / 100;
}

function isDojiCandle(candle: ComputedCandle, maxBodyPercent: number): boolean {
  if (!isDojiBody(candle, maxBodyPercent)) return false;
  if (candle.upperWick === candle.lowerWick) return true;
  const lowerDiff = Math.abs(candle.upperWick - candle.lowerWick) / (candle.lowerWick || 0.00001) * 100;
  const upperDiff = Math.abs(candle.lowerWick - candle.upperWick) / (candle.upperWick || 0.00001) * 100;
  return lowerDiff < 100 && upperDiff < 100;
}

function isBodySmallerThanAvg(candle: ComputedCandle, enableCheck: boolean, bodyAvg: number): boolean {
  return enableCheck ? candle.bodySize < bodyAvg : true;
}

function isBodyLargerThanAvg(candle: ComputedCandle, enableCheck: boolean, bodyAvg: number): boolean {
  return enableCheck ? candle.bodySize > bodyAvg : true;
}

export function detectPatterns(data: OHLCV[], enabledPatternIds?: string[]): PatternMatch[] {
  if (data.length < 5) return [];
  
  const candles = computeCandleProps(data);
  const matches: PatternMatch[] = [];
  
  // Set defaults for checks
  const maxBodyRange = 5.0; // 5% Doji
  
  const isEnabled = (id: string) => !enabledPatternIds || enabledPatternIds.includes(id);

  for (let i = 4; i < candles.length; i++) {
    const timestamp = candles[i].timestamp;
    
    // 1. Abandoned Baby Bull
    if (isEnabled("abandonedBabyBull")) {
      const isBull = candles[i-2].isBearish &&
                     isDojiBody(candles[i-1], maxBodyRange) &&
                     candles[i-2].low > candles[i-1].high &&
                     candles[i].isBullish &&
                     candles[i-1].high < candles[i].low;
      if (isBull) {
        matches.push({ timestamp, patternName: "Bullish Abandoned Baby", type: "bull", description: "A rare 3-candle bullish reversal pattern: strong bearish candle, a gap-down Doji, and a gap-up bullish candle." });
      }
    }
    
    // 1b. Abandoned Baby Bear
    if (isEnabled("abandonedBabyBear")) {
      const isBear = candles[i-2].isBullish &&
                     isDojiBody(candles[i-1], maxBodyRange) &&
                     candles[i-2].high < candles[i-1].low &&
                     candles[i].isBearish &&
                     candles[i-1].low > candles[i].high;
      if (isBear) {
        matches.push({ timestamp, patternName: "Bearish Abandoned Baby", type: "bear", description: "A rare 3-candle bearish reversal pattern: strong bullish candle, a gap-up Doji, and a gap-down bearish candle." });
      }
    }
    
    // 2. Dark Cloud Cover
    if (isEnabled("darkCloudCover")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const ok = candles[i-1].isBullish && candle1BodyLrg &&
                 candles[i].isBearish &&
                 candles[i].open >= candles[i-1].high &&
                 candles[i].close < candles[i-1].bodyMidpoint &&
                 candles[i].close > candles[i-1].open;
      if (ok) {
        matches.push({ timestamp, patternName: "Dark Cloud Cover", type: "bear", description: "A 2-candle bearish reversal pattern: strong bullish candle followed by a bearish candle opening above high and closing below its midpoint." });
      }
    }
    
    // 3. Doji
    if (isEnabled("doji")) {
      const c = candles[i];
      const dojiCandle = isDojiCandle(c, maxBodyRange);
      const dojiBodyVal = isDojiBody(c, maxBodyRange);
      const ok = dojiCandle &&
                 !(dojiBodyVal && c.upperWick <= c.bodySize) &&
                 !(dojiBodyVal && c.lowerWick <= c.bodySize);
      if (ok) {
        matches.push({ timestamp, patternName: "Doji", type: "neutral", description: "A single-candle indecision pattern where the open and close are extremely close with upper and lower wicks." });
      }
    }
    
    // 4. Doji Star Bull
    if (isEnabled("dojiStarBull")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const candle2Doji = isDojiBody(candles[i], maxBodyRange);
      const ok = candles[i-1].isBearish && candle1BodyLrg &&
                 candle2Doji && candles[i].bodyHigh < candles[i-1].bodyLow;
      if (ok) {
        matches.push({ timestamp, patternName: "Bullish Doji Star", type: "bull", description: "A 2-candle bullish reversal pattern: strong bearish candle followed by a gap-down Doji." });
      }
    }
    
    // 4b. Doji Star Bear
    if (isEnabled("dojiStarBear")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const candle2Doji = isDojiBody(candles[i], maxBodyRange);
      const ok = candles[i-1].isBullish && candle1BodyLrg &&
                 candle2Doji && candles[i].bodyLow > candles[i-1].bodyHigh;
      if (ok) {
        matches.push({ timestamp, patternName: "Bearish Doji Star", type: "bear", description: "A 2-candle bearish reversal pattern: strong bullish candle followed by a gap-up Doji." });
      }
    }
    
    // 5. Downside Tasuki Gap
    if (isEnabled("downsideTasukiGap")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-2], true, candles[i-2].bodyAvg14);
      const candle2BodySml = isBodySmallerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const ok = candle1BodyLrg && candle2BodySml &&
                 candles[i-2].isBearish && candles[i-1].bodyHigh < candles[i-2].bodyLow &&
                 candles[i-1].isBearish &&
                 candles[i].isBullish &&
                 candles[i].bodyHigh <= candles[i-2].bodyLow &&
                 candles[i].bodyHigh >= candles[i-1].bodyHigh;
      if (ok) {
        matches.push({ timestamp, patternName: "Downside Tasuki Gap", type: "bear", description: "A 3-candle bearish continuation pattern: two bearish candles with a gap, followed by a bullish candle that partially fills it." });
      }
    }
    
    // 6. Dragonfly Doji
    if (isEnabled("dragonflyDoji")) {
      const ok = isDojiBody(candles[i], maxBodyRange) && candles[i].upperWick <= candles[i].bodySize;
      if (ok) {
        matches.push({ timestamp, patternName: "Dragonfly Doji", type: "bull", description: "A bullish single Doji candle with little to no upper wick and a long lower wick." });
      }
    }
    
    // 7. Engulfing Bull
    if (isEnabled("engulfingBull")) {
      const candle1BodySml = isBodySmallerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const candle2BodyLrg = isBodyLargerThanAvg(candles[i], true, candles[i].bodyAvg14);
      const ok = candles[i].isBullish && candle2BodyLrg &&
                 candles[i-1].isBearish && candle1BodySml &&
                 candles[i].close >= candles[i-1].open && candles[i].open <= candles[i-1].close &&
                 (candles[i].close > candles[i-1].open || candles[i].open < candles[i-1].close);
      if (ok) {
        matches.push({ timestamp, patternName: "Bullish Engulfing", type: "bull", description: "A 2-candle bullish reversal pattern where a large bullish body completely engulfs the prior small bearish body." });
      }
    }
    
    // 7b. Engulfing Bear
    if (isEnabled("engulfingBear")) {
      const candle1BodySml = isBodySmallerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const candle2BodyLrg = isBodyLargerThanAvg(candles[i], true, candles[i].bodyAvg14);
      const ok = candles[i].isBearish && candle2BodyLrg &&
                 candles[i-1].isBullish && candle1BodySml &&
                 candles[i].close <= candles[i-1].open && candles[i].open >= candles[i-1].close &&
                 (candles[i].close < candles[i-1].open || candles[i].open > candles[i-1].close);
      if (ok) {
        matches.push({ timestamp, patternName: "Bearish Engulfing", type: "bear", description: "A 2-candle bearish reversal pattern where a large bearish body completely engulfs the prior small bullish body." });
      }
    }
    
    // 8. Evening Doji Star
    if (isEnabled("eveningDojiStar")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-2], true, candles[i-2].bodyAvg14);
      const candle3BodyLrg = isBodyLargerThanAvg(candles[i], true, candles[i].bodyAvg14);
      const candle2Doji = isDojiBody(candles[i-1], maxBodyRange);
      const ok = candle1BodyLrg && candles[i-2].isBullish &&
                 candle2Doji && candles[i-1].bodyLow > candles[i-2].bodyHigh &&
                 candle3BodyLrg && candles[i].isBearish &&
                 candles[i].bodyLow <= candles[i-2].bodyMidpoint &&
                 candles[i].bodyLow > candles[i-2].bodyLow &&
                 candles[i-1].bodyLow > candles[i].bodyHigh;
      if (ok) {
        matches.push({ timestamp, patternName: "Evening Doji Star", type: "bear", description: "A 3-candle bearish reversal pattern: strong bullish candle, a gap-up Doji, and a strong bearish candle closing deep inside candle 1." });
      }
    }
    
    // 9. Evening Star
    if (isEnabled("eveningStar")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-2], true, candles[i-2].bodyAvg14);
      const candle2BodySml = isBodySmallerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const candle3BodyLrg = isBodyLargerThanAvg(candles[i], true, candles[i].bodyAvg14);
      const ok = candle1BodyLrg && candles[i-2].isBullish &&
                 candle2BodySml && candles[i-1].bodyLow > candles[i-2].bodyHigh &&
                 candle3BodyLrg && candles[i].isBearish &&
                 candles[i].bodyLow <= candles[i-2].bodyMidpoint &&
                 candles[i].bodyLow > candles[i-2].bodyLow &&
                 candles[i-1].bodyLow > candles[i].bodyHigh;
      if (ok) {
        matches.push({ timestamp, patternName: "Evening Star", type: "bear", description: "A 3-candle bearish reversal pattern: strong bullish candle, a small gap-up body, and a strong bearish candle closing deep inside candle 1." });
      }
    }
    
    // 10. Falling Three Methods
    if (isEnabled("fallingThreeMethods")) {
      const candle1Valid = isBodyLargerThanAvg(candles[i-4], true, candles[i-4].bodyAvg14) && candles[i-4].isBearish;
      const candle2Valid = isBodySmallerThanAvg(candles[i-3], true, candles[i-3].bodyAvg14) && candles[i-3].isBullish && candles[i-3].open > candles[i-4].low && candles[i-3].close < candles[i-4].high;
      const candle3Valid = isBodySmallerThanAvg(candles[i-2], true, candles[i-2].bodyAvg14) && candles[i-2].isBullish && candles[i-2].open > candles[i-4].low && candles[i-2].close < candles[i-4].high;
      const candle4Valid = isBodySmallerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14) && candles[i-1].isBullish && candles[i-1].open > candles[i-4].low && candles[i-1].close < candles[i-4].high;
      const candle5Valid = isBodyLargerThanAvg(candles[i], true, candles[i].bodyAvg14) && candles[i].isBearish && candles[i].close < candles[i-4].close;
      if (candle1Valid && candle2Valid && candle3Valid && candle4Valid && candle5Valid) {
        matches.push({ timestamp, patternName: "Falling Three Methods", type: "bear", description: "A 5-candle bearish continuation pattern: large bearish candle, 3 small rising bullish candles within its range, and a final large bearish breakout close." });
      }
    }
    
    // 11. Falling Window
    if (isEnabled("fallingWindow")) {
      const ok = candles[i].candleRange !== 0 && candles[i-1].candleRange !== 0 && candles[i].high < candles[i-1].low;
      if (ok) {
        matches.push({ timestamp, patternName: "Falling Window", type: "bear", description: "A bearish continuation gap between two candles." });
      }
    }
    
    // 12. Gravestone Doji
    if (isEnabled("gravestoneDoji")) {
      const ok = isDojiBody(candles[i], maxBodyRange) && candles[i].lowerWick <= candles[i].bodySize;
      if (ok) {
        matches.push({ timestamp, patternName: "Gravestone Doji", type: "bear", description: "A bearish single Doji candle with little to no lower wick and a long upper wick." });
      }
    }
    
    // 13. Hammer
    if (isEnabled("hammer")) {
      const candleBodySml = isBodySmallerThanAvg(candles[i], true, candles[i].bodyAvg14);
      const ok = candleBodySml && candles[i].bodySize > 0 &&
                 candles[i].bodyLow > (candles[i].high + candles[i].low)/2 &&
                 candles[i].lowerWick >= 2.0 * candles[i].bodySize &&
                 !candles[i].hasSignificantUpperWick;
      if (ok) {
        matches.push({ timestamp, patternName: "Hammer", type: "bull", description: "A bullish single reversal candle with a small body near the top and a long lower wick (>= 2x body)." });
      }
    }
    
    // 14. Hanging Man
    if (isEnabled("hangingMan")) {
      const candleBodySml = isBodySmallerThanAvg(candles[i], true, candles[i].bodyAvg14);
      const ok = candleBodySml && candles[i].bodySize > 0 &&
                 candles[i].bodyLow > (candles[i].high + candles[i].low)/2 &&
                 candles[i].lowerWick >= 2.0 * candles[i].bodySize &&
                 !candles[i].hasSignificantUpperWick;
      if (ok) {
        matches.push({ timestamp, patternName: "Hanging Man", type: "bear", description: "A bearish single reversal candle with a small body near the top and a long lower wick (>= 2x body) appearing in an uptrend." });
      }
    }
    
    // 15. Harami Cross Bull
    if (isEnabled("haramiCrossBull")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const ok = candle1BodyLrg && candles[i-1].isBearish &&
                 isDojiBody(candles[i], 5.0) &&
                 candles[i].high <= candles[i-1].bodyHigh && candles[i].low >= candles[i-1].bodyLow;
      if (ok) {
        matches.push({ timestamp, patternName: "Bullish Harami Cross", type: "bull", description: "A 2-candle bullish reversal pattern: large bearish candle engulfing a small Doji candle." });
      }
    }
    
    // 15b. Harami Cross Bear
    if (isEnabled("haramiCrossBear")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const ok = candle1BodyLrg && candles[i-1].isBullish &&
                 isDojiBody(candles[i], 5.0) &&
                 candles[i].high <= candles[i-1].bodyHigh && candles[i].low >= candles[i-1].bodyLow;
      if (ok) {
        matches.push({ timestamp, patternName: "Bearish Harami Cross", type: "bear", description: "A 2-candle bearish reversal pattern: large bullish candle engulfing a small Doji candle." });
      }
    }
    
    // 16. Harami Bull
    if (isEnabled("haramiBull")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const candle2BodySml = isBodySmallerThanAvg(candles[i], true, candles[i].bodyAvg14);
      const ok = candle1BodyLrg && candles[i-1].isBearish &&
                 candles[i].isBullish && candle2BodySml &&
                 candles[i].high <= candles[i-1].bodyHigh && candles[i].low >= candles[i-1].bodyLow;
      if (ok) {
        matches.push({ timestamp, patternName: "Bullish Harami", type: "bull", description: "A 2-candle bullish reversal pattern: large bearish candle containing a smaller bullish candle body." });
      }
    }
    
    // 16b. Harami Bear
    if (isEnabled("haramiBear")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const candle2BodySml = isBodySmallerThanAvg(candles[i], true, candles[i].bodyAvg14);
      const ok = candle1BodyLrg && candles[i-1].isBullish &&
                 candles[i].isBearish && candle2BodySml &&
                 candles[i].high <= candles[i-1].bodyHigh && candles[i].low >= candles[i-1].bodyLow;
      if (ok) {
        matches.push({ timestamp, patternName: "Bearish Harami", type: "bear", description: "A 2-candle bearish reversal pattern: large bullish candle containing a smaller bearish candle body." });
      }
    }
    
    // 17. Inverted Hammer
    if (isEnabled("invertedHammer")) {
      const candleBodySml = isBodySmallerThanAvg(candles[i], true, candles[i].bodyAvg14);
      const ok = candleBodySml && candles[i].bodySize > 0 &&
                 candles[i].bodyHigh < (candles[i].high + candles[i].low)/2 &&
                 candles[i].upperWick >= 2.0 * candles[i].bodySize &&
                 !candles[i].hasSignificantLowerWick;
      if (ok) {
        matches.push({ timestamp, patternName: "Inverted Hammer", type: "bull", description: "A bullish single reversal candle with a small body near the bottom and a long upper wick (>= 2x body)." });
      }
    }
    
    // 18. Kicking Bull
    if (isEnabled("kickingBull")) {
      const marubozu1 = isBodyLargerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14) && candles[i-1].upperWick <= 0.05 * candles[i-1].bodySize && candles[i-1].lowerWick <= 0.05 * candles[i-1].bodySize;
      const marubozu2 = isBodyLargerThanAvg(candles[i], true, candles[i].bodyAvg14) && candles[i].upperWick <= 0.05 * candles[i].bodySize && candles[i].lowerWick <= 0.05 * candles[i].bodySize;
      const ok = marubozu1 && candles[i-1].isBearish &&
                 marubozu2 && candles[i].isBullish &&
                 candles[i-1].high < candles[i].low;
      if (ok) {
        matches.push({ timestamp, patternName: "Bullish Kicking", type: "bull", description: "A strong 2-candle reversal: bearish Marubozu followed by a gap-up bullish Marubozu." });
      }
    }
    
    // 18b. Kicking Bear
    if (isEnabled("kickingBear")) {
      const marubozu1 = isBodyLargerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14) && candles[i-1].upperWick <= 0.05 * candles[i-1].bodySize && candles[i-1].lowerWick <= 0.05 * candles[i-1].bodySize;
      const marubozu2 = isBodyLargerThanAvg(candles[i], true, candles[i].bodyAvg14) && candles[i].upperWick <= 0.05 * candles[i].bodySize && candles[i].lowerWick <= 0.05 * candles[i].bodySize;
      const ok = marubozu1 && candles[i-1].isBullish &&
                 marubozu2 && candles[i].isBearish &&
                 candles[i-1].low > candles[i].high;
      if (ok) {
        matches.push({ timestamp, patternName: "Bearish Kicking", type: "bear", description: "A strong 2-candle reversal: bullish Marubozu followed by a gap-down bearish Marubozu." });
      }
    }
    
    // 19. Long Lower Shadow
    if (isEnabled("longLowerShadow")) {
      const minLowerWickPercent = 75.0;
      const ok = candles[i].lowerWick > (candles[i].candleRange * minLowerWickPercent / 100);
      if (ok) {
        matches.push({ timestamp, patternName: "Long Lower Shadow", type: "bull", description: "A single candle where the lower wick exceeds 75% of the total candle range." });
      }
    }
    
    // 20. Long Upper Shadow
    if (isEnabled("longUpperShadow")) {
      const minUpperWickPercent = 75.0;
      const ok = candles[i].upperWick > (candles[i].candleRange * minUpperWickPercent / 100);
      if (ok) {
        matches.push({ timestamp, patternName: "Long Upper Shadow", type: "bear", description: "A single candle where the upper wick exceeds 75% of the total candle range." });
      }
    }
    
    // 21. Marubozu Black
    if (isEnabled("marubozuBlack")) {
      const ok = candles[i].isBearish &&
                 isBodyLargerThanAvg(candles[i], true, candles[i].bodyAvg14) &&
                 candles[i].upperWick <= 0.05 * candles[i].bodySize &&
                 candles[i].lowerWick <= 0.05 * candles[i].bodySize;
      if (ok) {
        matches.push({ timestamp, patternName: "Marubozu Black", type: "bear", description: "A strong single bearish candle with no wicks (or wicks <= 5% of body size)." });
      }
    }
    
    // 22. Marubozu White
    if (isEnabled("marubozuWhite")) {
      const ok = candles[i].isBullish &&
                 isBodyLargerThanAvg(candles[i], true, candles[i].bodyAvg14) &&
                 candles[i].upperWick <= 0.05 * candles[i].bodySize &&
                 candles[i].lowerWick <= 0.05 * candles[i].bodySize;
      if (ok) {
        matches.push({ timestamp, patternName: "Marubozu White", type: "bull", description: "A strong single bullish candle with no wicks (or wicks <= 5% of body size)." });
      }
    }
    
    // 23. Morning Doji Star
    if (isEnabled("morningDojiStar")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-2], true, candles[i-2].bodyAvg14);
      const candle3BodyLrg = isBodyLargerThanAvg(candles[i], true, candles[i].bodyAvg14);
      const candle2Doji = isDojiBody(candles[i-1], maxBodyRange);
      const ok = candle1BodyLrg && candles[i-2].isBearish &&
                 candle2Doji && candles[i-1].bodyHigh < candles[i-2].bodyLow &&
                 candle3BodyLrg && candles[i].isBullish &&
                 candles[i].bodyHigh >= candles[i-2].bodyMidpoint &&
                 candles[i].bodyHigh < candles[i-2].bodyHigh &&
                 candles[i-1].bodyHigh < candles[i].bodyLow;
      if (ok) {
        matches.push({ timestamp, patternName: "Morning Doji Star", type: "bull", description: "A 3-candle bullish reversal pattern: strong bearish candle, a gap-down Doji, and a strong bullish candle closing deep inside candle 1." });
      }
    }
    
    // 24. Morning Star
    if (isEnabled("morningStar")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-2], true, candles[i-2].bodyAvg14);
      const candle2BodySml = isBodySmallerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const candle3BodyLrg = isBodyLargerThanAvg(candles[i], true, candles[i].bodyAvg14);
      const ok = candle1BodyLrg && candles[i-2].isBearish &&
                 candle2BodySml && candles[i-1].bodyHigh < candles[i-2].bodyLow &&
                 candle3BodyLrg && candles[i].isBullish &&
                 candles[i].bodyHigh >= candles[i-2].bodyMidpoint &&
                 candles[i].bodyHigh < candles[i-2].bodyHigh &&
                 candles[i-1].bodyHigh < candles[i].bodyLow;
      if (ok) {
        matches.push({ timestamp, patternName: "Morning Star", type: "bull", description: "A 3-candle bullish reversal pattern: strong bearish candle, a small gap-down body, and a strong bullish candle closing deep inside candle 1." });
      }
    }
    
    // 25. On Neck
    if (isEnabled("onNeck")) {
      const closeNearLow = Math.abs(candles[i].close - candles[i-1].low) <= candles[i].bodyAvg14 * 0.05;
      const ok = candles[i-1].isBearish &&
                 isBodyLargerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14) &&
                 candles[i].isBullish &&
                 isBodySmallerThanAvg(candles[i], true, candles[i].bodyAvg14) &&
                 candles[i].open < candles[i-1].close &&
                 candles[i].candleRange !== 0 &&
                 closeNearLow;
      if (ok) {
        matches.push({ timestamp, patternName: "On Neck", type: "bear", description: "A 2-candle bearish continuation pattern: strong bearish candle followed by a small bullish candle closing near the low of candle 1." });
      }
    }
    
    // 26. Piercing
    if (isEnabled("piercing")) {
      const candle1BodyLrg = isBodyLargerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14);
      const ok = candles[i-1].isBearish && candle1BodyLrg &&
                 candles[i].isBullish &&
                 candles[i].open <= candles[i-1].low &&
                 candles[i].close > candles[i-1].bodyMidpoint &&
                 candles[i].close < candles[i-1].open;
      if (ok) {
        matches.push({ timestamp, patternName: "Piercing", type: "bull", description: "A 2-candle bullish reversal pattern: strong bearish candle followed by a bullish candle opening below low and closing above its midpoint." });
      }
    }
    
    // 27. Rising Three Methods
    if (isEnabled("risingThreeMethods")) {
      const candle1Valid = isBodyLargerThanAvg(candles[i-4], true, candles[i-4].bodyAvg14) && candles[i-4].isBullish;
      const candle2Valid = isBodySmallerThanAvg(candles[i-3], true, candles[i-3].bodyAvg14) && candles[i-3].isBearish && candles[i-3].open < candles[i-4].high && candles[i-3].close > candles[i-4].low;
      const candle3Valid = isBodySmallerThanAvg(candles[i-2], true, candles[i-2].bodyAvg14) && candles[i-2].isBearish && candles[i-2].open < candles[i-4].high && candles[i-2].close > candles[i-4].low;
      const candle4Valid = isBodySmallerThanAvg(candles[i-1], true, candles[i-1].bodyAvg14) && candles[i-1].isBearish && candles[i-1].open < candles[i-4].high && candles[i-1].close > candles[i-4].low;
      const candle5Valid = isBodyLargerThanAvg(candles[i], true, candles[i].bodyAvg14) && candles[i].isBullish && candles[i].close > candles[i-4].close;
      if (candle1Valid && candle2Valid && candle3Valid && candle4Valid && candle5Valid) {
        matches.push({ timestamp, patternName: "Rising Three Methods", type: "bull", description: "A 5-candle bullish continuation pattern: large bullish candle, 3 small falling bearish candles within its range, and a final large bullish breakout close." });
      }
    }
    
    // 28. Rising Window
    if (isEnabled("risingWindow")) {
      const ok = candles[i].candleRange !== 0 && candles[i-1].candleRange !== 0 && candles[i].low > candles[i-1].high;
      if (ok) {
        matches.push({ timestamp, patternName: "Rising Window", type: "bull", description: "A bullish continuation gap between two candles." });
      }
    }
    
    // 29. Shooting Star
    if (isEnabled("shootingStar")) {
      const candleBodySml = isBodySmallerThanAvg(candles[i], true, candles[i].bodyAvg14);
      const ok = candleBodySml && candles[i].bodySize > 0 &&
                 candles[i].bodyHigh < (candles[i].high + candles[i].low)/2 &&
                 candles[i].upperWick >= 2.0 * candles[i].bodySize &&
                 !candles[i].hasSignificantLowerWick;
      if (ok) {
        matches.push({ timestamp, patternName: "Shooting Star", type: "bear", description: "A bearish single reversal candle with a small body near the bottom and a long upper wick (>= 2x body) appearing in an uptrend." });
      }
    }
    
    // 30. Spinning Top Black
    if (isEnabled("spinningTopBlack")) {
      const minLowerWickPercent = 34.0;
      const minUpperWickPercent = 34.0;
      const isDoji = isDojiBody(candles[i], 5.0);
      const ok = candles[i].lowerWick >= candles[i].candleRange * minLowerWickPercent / 100 &&
                 candles[i].upperWick >= candles[i].candleRange * minUpperWickPercent / 100 &&
                 !isDoji && candles[i].isBearish;
      if (ok) {
        matches.push({ timestamp, patternName: "Spinning Top Black", type: "neutral", description: "A bearish neutral candle showing indecision: small bearish body, long upper/lower wicks, and not a Doji." });
      }
    }
    
    // 31. Spinning Top White
    if (isEnabled("spinningTopWhite")) {
      const minLowerWickPercent = 34.0;
      const minUpperWickPercent = 34.0;
      const isDoji = isDojiBody(candles[i], 5.0);
      const ok = candles[i].lowerWick >= candles[i].candleRange * minLowerWickPercent / 100 &&
                 candles[i].upperWick >= candles[i].candleRange * minUpperWickPercent / 100 &&
                 !isDoji && candles[i].isBullish;
      if (ok) {
        matches.push({ timestamp, patternName: "Spinning Top White", type: "neutral", description: "A bullish neutral candle showing indecision: small bullish body, long upper/lower wicks, and not a Doji." });
      }
    }
  }
  
  return matches;
}
