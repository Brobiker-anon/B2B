export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  avatar: string;
  action: string;
  category: 'trade' | 'wallet' | 'security' | 'chat' | 'system' | 'mining' | 'real-estate' | 'staking' | 'referrals';
  status: 'success' | 'warning' | 'failed';
  severity: 'info' | 'warning' | 'error' | 'critical';
  ipAddress: string;
  location: string;
  browser: string;
  timestamp: string;
  details?: Record<string, any>;
}

// Pre-defined list of users to simulate realistic environment
export const MOCK_USERS = [
  { id: "usr-john-doe", name: "John Doe", email: "john.doe@brokerage.com", role: "Pro Member", avatar: "JD", ip: "192.168.1.104", location: "New York, USA", browser: "Chrome 124.0.0 (Windows 11)" },
  { id: "usr-sarah-jen", name: "Sarah Jenkins", email: "sarah.j@whalesec.org", role: "VVIP Investor", avatar: "SJ", ip: "74.125.19.147", location: "London, UK", browser: "Safari 17.2 (macOS Sonoma)" },
  { id: "usr-alex-riv", name: "Alex Rivera", email: "alex.r@brokerage.com", role: "System Admin", avatar: "AR", ip: "172.56.21.89", location: "San Francisco, USA", browser: "Firefox 125.0 (Ubuntu Linux)" },
  { id: "usr-dmitri-p", name: "Dmitri Petrov", email: "dmitri.bot@arb-algo.ru", role: "Standard Member", avatar: "DP", ip: "95.108.210.15", location: "Moscow, RU", browser: "Python-urllib/3.10" },
  { id: "usr-emma-wat", name: "Emma Watson", email: "emma.w@gmail.com", role: "Standard Member", avatar: "EW", ip: "198.51.100.42", location: "Toronto, Canada", browser: "Edge 123.0 (Windows 11)" },
  { id: "sys-daemon", name: "System Daemon", email: "core-node-01@brokerage.com", role: "System Automation", avatar: "SYS", ip: "127.0.0.1", location: "Ashburn AWS Cluster", browser: "Node.js/20.11" },
  { id: "usr-anonymous", name: "Anonymous Intruder", email: "unknown@darknet-tor.org", role: "Unauthenticated Guest", avatar: "??", ip: "185.220.101.4", location: "Tor Exit Node (Germany)", browser: "Tor Browser 13.0 (Linux)" }
];

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

// Pre-defined set of activities for simulation
const MOCK_ACTIVITIES = [
  // Trade Category
  {
    action: "Bought 0.05 BTC at $64,250.00 USDT",
    category: "trade",
    status: "success",
    severity: "info",
    details: { pair: "BTC/USDT", amount: 0.05, price: 64250, total: 3212.5, type: "market_buy" }
  },
  {
    action: "Sold 1.50 ETH at $3,120.00 USDT",
    category: "trade",
    status: "success",
    severity: "info",
    details: { pair: "ETH/USDT", amount: 1.5, price: 3120, total: 4680, type: "limit_sell" }
  },
  {
    action: "Placed limit buy order for 10.0 SOL at $135.00 USDT",
    category: "trade",
    status: "success",
    severity: "info",
    details: { pair: "SOL/USDT", amount: 10.0, price: 135, total: 1350, type: "limit_buy" }
  },
  {
    action: "Subscribed to High-Volatility Scalping Signals Feed",
    category: "trade",
    status: "success",
    severity: "info",
    details: { subscription_id: "sig-scalp-high", cost: "$99/mo", auto_renew: true }
  },
  
  // Wallet Category
  {
    action: "Deposited $5,000.00 USDT",
    category: "wallet",
    status: "success",
    severity: "info",
    details: { amount: 5000, asset: "USDT", gateway: "ERC-20 smart wallet", txHash: "0x7a83d...f92a1" }
  },
  {
    action: "Withdrew 1.25 ETH",
    category: "wallet",
    status: "success",
    severity: "info",
    details: { amount: 1.25, asset: "ETH", destination: "0x9812a...77be4", gasFee: "0.004 ETH", status: "Completed" }
  },
  {
    action: "Connected Wallet MetaMask",
    category: "wallet",
    status: "success",
    severity: "info",
    details: { wallet: "MetaMask", address: "0xf39fd...92266", network: "Ethereum Mainnet" }
  },
  {
    action: "Wallet connection timed out",
    category: "wallet",
    status: "failed",
    severity: "warning",
    details: { provider: "WalletConnect", error: "Connection request rejected by user" }
  },

  // Security Category
  {
    action: "Initiated 48h time-lock cold storage vault release request",
    category: "security",
    status: "warning",
    severity: "warning",
    details: { vaultId: "vault-btc-cold", amount: "12.50 BTC", approvalsNeeded: 2, timeRemaining: "47h 59m" }
  },
  {
    action: "Multi-signature hardware key authorized successfully",
    category: "security",
    status: "success",
    severity: "info",
    details: { keyId: "hsm-sig-02", device: "YubiKey 5C", locationId: "secure-bunker-swiss" }
  },
  {
    action: "Security Settings changed: Enabled 2FA via Authenticator",
    category: "security",
    status: "success",
    severity: "info",
    details: { factor: "TOTP", backupCodesGenerated: 10 }
  },
  {
    action: "Brute-force login attempt blocked on Admin account",
    category: "security",
    status: "failed",
    severity: "critical",
    details: { target: "admin@brokerage.com", attemptsCount: 15, blockDuration: "24h", threatClass: "Automated Dictionary Attack" }
  },
  {
    action: "SQL injection payload detected and sanitized by Web Application Firewall (WAF)",
    category: "security",
    status: "failed",
    severity: "critical",
    details: { uri: "/api/trade/query", query: "UNION SELECT username, password FROM users --", sanitized: true }
  },

  // System Category
  {
    action: "Core HSM Deep Cold Storing database connection - Nominal state",
    category: "system",
    status: "success",
    severity: "info",
    details: { node: "node-airgap-primary", latency: "14ms", integrityChecksum: "sha256-a9b8c7" }
  },
  {
    action: "System database backup completed successfully",
    category: "system",
    status: "success",
    severity: "info",
    details: { backupSize: "4.82 GB", destination: "AWS S3 Glacier", duration: "124s" }
  },
  {
    action: "Automated security audit: All offline vault certificates are up to date",
    category: "system",
    status: "success",
    severity: "info",
    details: { vaultCount: 3, certExpiry: "2027-12-05" }
  },
  {
    action: "Primary API node load spike: CPU usage exceeded 85%",
    category: "system",
    status: "warning",
    severity: "warning",
    details: { cpuUsage: "89.2%", activeUsers: 1420, autoScaled: true, newInstanceIp: "10.0.4.152" }
  },

  // Staking
  {
    action: "Staked 1,500.00 MATIC",
    category: "staking",
    status: "success",
    severity: "info",
    details: { amount: 1500, asset: "MATIC", apr: "8.4%", lockPeriod: "30 Days", estPayout: "10.3 MATIC" }
  },
  {
    action: "Unstaked 5,000.00 SOL",
    category: "staking",
    status: "success",
    severity: "info",
    details: { amount: 5000, asset: "SOL", rewardClaimed: "142.15 SOL", status: "Returned to hot wallet" }
  },

  // Mining
  {
    action: "Allocated 450 TH/s Cloud Mining power to SHA-256 pool",
    category: "mining",
    status: "success",
    severity: "info",
    details: { hashPower: "450 TH/s", contractDuration: "12 Months", dailyEstRevenue: "$24.18 USDT" }
  },
  {
    action: "Cloud Mining payout distributed successfully",
    category: "mining",
    status: "success",
    severity: "info",
    details: { pool: "AntPool Shared", totalDistributed: "0.01452 BTC", minerCount: 342 }
  },

  // Real Estate
  {
    action: "Bought 0.05 fractions (5%) of Premium Tokyo Commercial Hub",
    category: "real-estate",
    status: "success",
    severity: "info",
    details: { property: "Tokyo Hub #15", cost: "$5,250.00 USDT", estYield: "7.8% APR" }
  },

  // Referrals
  {
    action: "Referral signup completed via user link",
    category: "referrals",
    status: "success",
    severity: "info",
    details: { code: "B2B_PRO_X12", newUserId: "usr-921a8", rewardShared: "$25.00 USDT" }
  },

  // Chat
  {
    action: "Sent message to community general chat channel",
    category: "chat",
    status: "success",
    severity: "info",
    details: { channel: "Global Crypto Lounge", messageSnippet: "Anyone watching the BTC breakout?..." }
  },
  {
    action: "Opened premium support ticket: Dispute on staking reward calculation",
    category: "chat",
    status: "success",
    severity: "info",
    details: { ticketId: "ticket-481", topic: "Staking Rewards", queuePosition: 2 }
  }
];

// Generate 50 realistic historical log entries
export const generateInitialLogs = (): ActivityLog[] => {
  const logs: ActivityLog[] = [];
  const now = new Date();
  
  for (let i = 50; i >= 0; i--) {
    // Generate a timestamp stretching back in time
    const logTime = new Date(now.getTime() - i * 15 * 60 * 1000 - Math.random() * 12 * 60 * 1000); // roughly every 15-27 mins
    
    // Choose user randomly, biasing towards standard users and system, with a few intruders
    let userIndex = 0;
    const r = Math.random();
    if (r < 0.35) userIndex = 0; // John Doe (active user)
    else if (r < 0.50) userIndex = 1; // Sarah Jenkins
    else if (r < 0.65) userIndex = 4; // Emma Watson
    else if (r < 0.80) userIndex = 5; // System Daemon
    else if (r < 0.88) userIndex = 3; // Dmitri Petrov
    else if (r < 0.94) userIndex = 2; // Alex Rivera (admin)
    else userIndex = 6; // Anonymous Intruder

    const user = MOCK_USERS[userIndex];

    // Filter activities suitable for this user
    let activities = MOCK_ACTIVITIES;
    if (user.id === "usr-anonymous") {
      // Intruders only do security threats/failed logins
      activities = MOCK_ACTIVITIES.filter(a => a.severity === 'critical' || a.category === 'security' || a.status === 'failed');
    } else if (user.id === "sys-daemon") {
      // System daemon only does system events or automated actions
      activities = MOCK_ACTIVITIES.filter(a => a.category === 'system' || a.action.includes("distributed") || a.action.includes("audit"));
    } else {
      // Normal users don't do SQL injections or internal HSM status logs
      activities = MOCK_ACTIVITIES.filter(a => !a.action.includes("sanitized") && !a.action.includes("HSM Deep Cold"));
    }

    const activity = activities[Math.floor(Math.random() * activities.length)];

    logs.push({
      id: generateId(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      avatar: user.avatar,
      action: activity.action,
      category: activity.category as any,
      status: activity.status as any,
      severity: activity.severity as any,
      ipAddress: user.ip,
      location: user.location,
      browser: user.browser,
      timestamp: logTime.toISOString(),
      details: activity.details
    });
  }

  // Sort logs by time descending (most recent first)
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Retrieve activity logs from localStorage
export const getLogs = (): ActivityLog[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("brokerage_activity_logs");
  if (!stored) {
    const initial = generateInitialLogs();
    localStorage.setItem("brokerage_activity_logs", JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

// Save activity logs to localStorage and dispatch update event
export const saveLogs = (logs: ActivityLog[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("brokerage_activity_logs", JSON.stringify(logs));
  // Dispatch dynamic custom event for active component updates
  window.dispatchEvent(new Event("activity-log-updated"));
};

// Add a single custom log entry
export const addLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
  const currentLogs = getLogs();
  const newEntry: ActivityLog = {
    ...log,
    id: generateId(),
    timestamp: new Date().toISOString()
  };
  const updated = [newEntry, ...currentLogs].slice(0, 1000); // limit to 1000 items
  saveLogs(updated);
  return newEntry;
};

// Helper for quick logging John Doe's active events
export const logUserAction = (action: string, category: ActivityLog['category'], status: ActivityLog['status'] = 'success', severity: ActivityLog['severity'] = 'info', details?: Record<string, any>) => {
  const johnDoe = MOCK_USERS[0];
  return addLog({
    userId: johnDoe.id,
    userName: johnDoe.name,
    userEmail: johnDoe.email,
    userRole: johnDoe.role,
    avatar: johnDoe.avatar,
    action,
    category,
    status,
    severity,
    ipAddress: johnDoe.ip,
    location: johnDoe.location,
    browser: johnDoe.browser,
    details
  });
};

// Clear logs and re-initialize with minimal setup
export const clearLogs = () => {
  const systemInitLog: ActivityLog = {
    id: generateId(),
    userId: "sys-daemon",
    userName: "System Daemon",
    userEmail: "core-node-01@brokerage.com",
    userRole: "System Automation",
    avatar: "SYS",
    action: "Activity Logging database reset and system re-initialized by Administrator action",
    category: "system",
    status: "success",
    severity: "warning",
    ipAddress: "127.0.0.1",
    location: "Ashburn AWS Cluster",
    browser: "Node.js/20.11",
    timestamp: new Date().toISOString()
  };
  saveLogs([systemInitLog]);
};

// Generate and append one random mock user activity log
export const generateRandomMockLog = (): ActivityLog => {
  // Choose user randomly, bias towards mock users rather than admin/John Doe
  const rand = Math.random();
  let userIndex = 1; // Default Emma
  if (rand < 0.2) userIndex = 1; // Sarah
  else if (rand < 0.4) userIndex = 3; // Dmitri
  else if (rand < 0.7) userIndex = 4; // Emma
  else if (rand < 0.9) userIndex = 5; // System
  else userIndex = 6; // Intruder

  const user = MOCK_USERS[userIndex];
  
  // Choose an activity
  let activities = MOCK_ACTIVITIES;
  if (user.id === "usr-anonymous") {
    activities = MOCK_ACTIVITIES.filter(a => a.severity === 'critical' || a.category === 'security' || a.status === 'failed');
  } else if (user.id === "sys-daemon") {
    activities = MOCK_ACTIVITIES.filter(a => a.category === 'system');
  } else {
    activities = MOCK_ACTIVITIES.filter(a => !a.action.includes("sanitized") && !a.action.includes("HSM Deep Cold"));
  }

  const activity = activities[Math.floor(Math.random() * activities.length)];

  // Randomize some figures in actions to make it feel fresh
  let actionStr = activity.action;
  let detailsObj = activity.details ? { ...activity.details } : undefined;

  if (activity.category === 'trade' && detailsObj) {
    const sizeMult = Math.random() * 2 + 0.1;
    if (detailsObj.pair === 'BTC/USDT') {
      const btcAmount = (0.01 * sizeMult).toFixed(4);
      actionStr = `Bought ${btcAmount} BTC at $64,250.00 USDT`;
      detailsObj.amount = parseFloat(btcAmount);
      detailsObj.total = parseFloat((parseFloat(btcAmount) * 64250).toFixed(2));
    } else if (detailsObj.pair === 'ETH/USDT') {
      const ethAmount = (0.5 * sizeMult).toFixed(2);
      actionStr = `Sold ${ethAmount} ETH at $3,120.00 USDT`;
      detailsObj.amount = parseFloat(ethAmount);
      detailsObj.total = parseFloat((parseFloat(ethAmount) * 3120).toFixed(2));
    }
  } else if (activity.category === 'wallet' && detailsObj && detailsObj.amount) {
    const amount = Math.floor(Math.random() * 8000 + 100);
    actionStr = `Deposited $${amount.toLocaleString()}.00 USDT`;
    detailsObj.amount = amount;
  }

  return addLog({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    avatar: user.avatar,
    action: actionStr,
    category: activity.category as any,
    status: activity.status as any,
    severity: activity.severity as any,
    ipAddress: user.ip,
    location: user.location,
    browser: user.browser,
    details: detailsObj
  });
};

// Simulation engine manager
let simulationIntervalId: any = null;

export const startActivitySimulation = (onLogAdded?: (log: ActivityLog) => void) => {
  if (typeof window === "undefined") return () => {};

  // Clean up any existing simulation first
  if (simulationIntervalId) {
    clearInterval(simulationIntervalId);
  }

  const triggerNext = () => {
    // Generate log with 8-15 seconds randomness
    const newLog = generateRandomMockLog();
    if (onLogAdded) {
      onLogAdded(newLog);
    }
    
    // Reschedule
    const delay = Math.random() * 8000 + 6000;
    simulationIntervalId = setTimeout(triggerNext, delay);
  };

  // Start the chain after a small delay
  simulationIntervalId = setTimeout(triggerNext, 5000);

  return () => {
    if (simulationIntervalId) {
      clearTimeout(simulationIntervalId);
      simulationIntervalId = null;
    }
  };
};
