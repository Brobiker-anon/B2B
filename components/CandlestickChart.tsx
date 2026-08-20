"use client";

import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Check, Award, Activity, ShieldCheck, Zap } from 'lucide-react';
import { detectPatterns, PATTERNS_CATALOG } from '@/utils/candlestickPatterns';

interface CandlestickDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  chartData: CandlestickDataPoint[];
  selectedAsset: string;
  height?: number;
  onHoverCandle?: (hoverData: { open: number; high: number; low: number; close: number; isBullish: boolean; change: number } | null) => void;
}

const getPatternAbbrByName = (name: string) => {
  const mapping: Record<string, string> = {
    "Bullish Abandoned Baby": "BAB",
    "Bearish Abandoned Baby": "BAB",
    "Dark Cloud Cover": "DCC",
    "Doji": "DOJ",
    "Bullish Doji Star": "DS",
    "Bearish Doji Star": "DS",
    "Downside Tasuki Gap": "DTG",
    "Dragonfly Doji": "DFD",
    "Bullish Engulfing": "ENG",
    "Bearish Engulfing": "ENG",
    "Evening Doji Star": "EDS",
    "Evening Star": "EVS",
    "Falling Three Methods": "FTM",
    "Gravestone Doji": "GVD",
    "Hammer": "HAM",
    "Hanging Man": "HGM",
    "Bullish Harami Cross": "HC",
    "Bearish Harami Cross": "HC",
    "Bullish Harami": "HAR",
    "Bearish Harami": "HAR",
    "Inverted Hammer": "IVH",
    "Bullish Kicking": "KIK",
    "Bearish Kicking": "KIK",
    "Marubozu Black": "MB",
    "Marubozu White": "MW",
    "Morning Doji Star": "MDS",
    "Morning Star": "MNS",
    "On Neck": "ON",
    "Piercing": "PRC",
    "Rising Three Methods": "RTM",
    "Shooting Star": "SST",
    "Spinning Top Black": "STB",
    "Spinning Top White": "STW",
    "Three Black Crows": "TBC",
    "Three White Soldiers": "TWS",
    "Tweezer Bottom": "TZB",
    "Tweezer Top": "TZT",
    "Upside Gap Two Crows": "UG2",
    "Upside Tasuki Gap": "UTG"
  };
  return mapping[name] || "PAT";
};

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  chartData,
  selectedAsset,
  height = 380,
  onHoverCandle
}) => {
  const [showPatternSettings, setShowPatternSettings] = useState(false);
  const [showBottomDeck, setShowBottomDeck] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1m");
  const [enabledPatternTypes, setEnabledPatternTypes] = useState<Record<string, boolean>>({
    bull: true,
    bear: true,
    neutral: true
  });
  const [enabledPatterns, setEnabledPatterns] = useState<string[]>(
    PATTERNS_CATALOG.map(p => p.id).filter(id => 
      id !== "risingWindow" && 
      id !== "fallingWindow" && 
      id !== "longLowerShadow" && 
      id !== "longUpperShadow"
    )
  );

  // Normalize chart data ensuring valid numeric timestamps and candle values
  const normalizedData = useMemo(() => {
    const now = Date.now();
    return chartData.map((d, idx) => {
      const ts = (typeof d.timestamp === 'number' && !isNaN(d.timestamp) && d.timestamp > 0)
        ? d.timestamp
        : now - (chartData.length - idx) * 3600000;
      return {
        timestamp: ts,
        open: Number(d.open) || 0,
        high: Number(d.high) || 0,
        low: Number(d.low) || 0,
        close: Number(d.close) || 0
      };
    });
  }, [chartData]);

  // Compute latest price and direction
  const lastCandle = normalizedData.length > 0 ? normalizedData[normalizedData.length - 1] : null;
  const currentPrice = lastCandle ? lastCandle.close : 0;
  const isCurrentBullish = lastCandle ? lastCandle.close >= lastCandle.open : true;

  // Run candlestick patterns detector
  const detectedPatterns = useMemo(() => {
    return detectPatterns(normalizedData, enabledPatterns).filter((p) => enabledPatternTypes[p.type]);
  }, [normalizedData, enabledPatterns, enabledPatternTypes]);

  // Compute ApexCharts series format
  const series = useMemo(() => [
    {
      name: `${selectedAsset}/USD`,
      data: normalizedData.map((d) => ({
        x: d.timestamp,
        y: [d.open, d.high, d.low, d.close]
      }))
    }
  ], [normalizedData, selectedAsset]);

  // Compute ApexCharts configuration with non-overlapping Y-axis badge
  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'candlestick',
      height: height,
      background: 'transparent',
      toolbar: {
        show: false
      },
      animations: {
        enabled: false
      },
      events: {
        mouseMove: function(event, chartContext, config) {
          if (config && typeof config.dataPointIndex === 'number' && config.dataPointIndex > -1 && onHoverCandle) {
            const d = chartData[config.dataPointIndex];
            if (d) {
              const change = ((d.close - d.open) / (d.open || 1)) * 100;
              onHoverCandle({
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
                isBullish: d.close >= d.open,
                change
              });
            }
          }
        },
        mouseLeave: function() {
          if (onHoverCandle) onHoverCandle(null);
        }
      }
    },
    theme: {
      mode: 'dark'
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#089981',
          downward: '#f23645'
        },
        wick: {
          useFillColor: true
        }
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.06)',
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: 'rgba(255, 255, 255, 0.4)',
          fontSize: '9px',
          fontFamily: 'monospace'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        hideOverlappingLabels: true,
        style: {
          colors: 'rgba(255, 255, 255, 0.45)',
          fontSize: '10px',
          fontFamily: 'monospace'
        },
        formatter: (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
    },
    annotations: {
      yaxis: currentPrice ? [
        {
          y: currentPrice,
          borderColor: isCurrentBullish ? '#089981' : '#f23645',
          strokeDashArray: 3,
          label: {
            borderColor: isCurrentBullish ? '#089981' : '#f23645',
            borderRadius: 4,
            text: currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            style: {
              color: '#ffffff',
              background: isCurrentBullish ? '#089981' : '#f23645',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: {
                left: 6,
                right: 6,
                top: 2,
                bottom: 2
              }
            }
          }
        }
      ] : [],
      points: detectedPatterns.map((p) => {
        const candle = normalizedData.find(c => c.timestamp === p.timestamp);
        const yVal = candle ? (p.type === 'bear' ? candle.high : candle.low) : 0;
        const abbr = getPatternAbbrByName(p.patternName);
        const markerSymbol = p.type === 'bull' ? '▲' : p.type === 'bear' ? '▼' : '◆';
        
        return {
          x: p.timestamp,
          y: yVal,
          marker: {
            size: 0
          },
          label: {
            borderColor: p.type === 'bull' ? '#089981' : p.type === 'bear' ? '#f23645' : '#4b5563',
            borderWidth: 1,
            borderRadius: 4,
            text: `${markerSymbol} ${abbr}`,
            style: {
              color: '#ffffff',
              background: p.type === 'bull' ? 'rgba(8, 153, 129, 0.95)' : p.type === 'bear' ? 'rgba(242, 54, 69, 0.95)' : 'rgba(75, 85, 99, 0.95)',
              fontSize: '8px',
              fontWeight: 'bold',
              padding: {
                left: 3,
                right: 3,
                top: 1,
                bottom: 1
              }
            }
          }
        };
      })
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy HH:mm'
      }
    }
  }), [chartData, currentPrice, isCurrentBullish, detectedPatterns, height, onHoverCandle]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0b0e11] border border-white/10 rounded-xl p-4 shadow-2xl relative">
      
      {/* Top Navigation & Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowBottomDeck(!showBottomDeck)}
            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition-colors"
            title="Toggle Bottom Deck Widgets"
          >
            {showBottomDeck ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <span className="font-bold text-white text-sm tracking-wide">{selectedAsset}/USD</span>
          
          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-xs font-semibold">
            {["1m", "5m", "15m", "1H", "4H", "1D"].map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  selectedTimeframe === tf 
                    ? "bg-[#089981] text-white font-bold" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <span className="text-[10px] bg-[#089981]/20 text-[#089981] border border-[#089981]/40 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
            LIVE FEED
          </span>
        </div>

        <div className="flex items-center gap-3">
          {detectedPatterns.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[#089981]/15 text-[#089981] border border-[#089981]/30 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Latest: {detectedPatterns[detectedPatterns.length - 1].patternName}</span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowPatternSettings(!showPatternSettings)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                showPatternSettings
                  ? "bg-[#089981] border-[#089981] text-white"
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#089981]" />
              <span>Pattern AI ({detectedPatterns.length})</span>
            </button>

            <AnimatePresence>
              {showPatternSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-[#12161a] border border-white/10 rounded-xl p-4 shadow-2xl z-50 text-xs text-slate-200 space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-bold text-white">Pattern Options</span>
                    <button
                      onClick={() => {
                        setEnabledPatterns(PATTERNS_CATALOG.map(p => p.id));
                        setEnabledPatternTypes({ bull: true, bear: true, neutral: true });
                      }}
                      className="text-[10px] text-[#089981] hover:underline cursor-pointer"
                    >
                      Reset Defaults
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Trend Filter</span>
                    <div className="flex gap-2">
                      {(["bull", "bear", "neutral"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setEnabledPatternTypes(prev => ({ ...prev, [type]: !prev[type] }))}
                          className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            enabledPatternTypes[type]
                              ? type === "bull"
                                ? "bg-[#089981]/25 border-[#089981]/60 text-green-400"
                                : type === "bear"
                                ? "bg-[#f23645]/25 border-[#f23645]/60 text-red-400"
                                : "bg-white/15 border-white/30 text-white"
                              : "bg-transparent border-white/5 text-muted-foreground"
                          }`}
                        >
                          {type.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      <span>Enabled Patterns</span>
                      <div className="flex gap-2 text-[9px] text-[#089981]">
                        <button onClick={() => setEnabledPatterns(PATTERNS_CATALOG.map(p => p.id))} className="hover:underline cursor-pointer">All</button>
                        <button onClick={() => setEnabledPatterns([])} className="hover:underline cursor-pointer">None</button>
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {PATTERNS_CATALOG.map((p) => {
                        const checked = enabledPatterns.includes(p.id);
                        return (
                          <label key={p.id} className="flex items-start gap-2 hover:bg-white/5 p-1 rounded cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setEnabledPatterns(prev => prev.filter(id => id !== p.id));
                                } else {
                                  setEnabledPatterns(prev => [...prev, p.id]);
                                }
                              }}
                              className="mt-0.5 rounded border-white/15 bg-black/25 text-[#089981] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                            <div>
                              <div className="font-semibold text-white text-[11px]">{p.name}</div>
                              <div className="text-[9px] text-muted-foreground leading-tight">{p.description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="w-full flex-grow mt-2 min-h-[180px] relative">
        <Chart
          options={options}
          series={series}
          type="candlestick"
          height={height}
        />
      </div>

      {/* Fixed Bottom HUD Deck: Positioned cleanly BELOW chart canvas without obscuring candles or volume data */}
      <AnimatePresence>
        {showBottomDeck && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 z-10"
          >
            {/* Card 1: User Verification Badge */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-sm truncate">Shane Coleman</div>
                <button 
                  onClick={() => alert("Verification portal opened")}
                  className="text-xs text-[#10b981] hover:underline font-semibold flex items-center gap-1 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify your account</span>
                </button>
              </div>
            </div>

            {/* Card 2: Signal Strength & AI Matching */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span>Signal Strength</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold">HIGH</span>
                </div>
                <div className="text-xs text-slate-400 truncate">
                  AI matching optimization: <span className="text-white font-semibold">98% positive accuracy</span>.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CandlestickChart;

