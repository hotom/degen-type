export const questions = [
  {
    text: "I often jump into new tokens or trends before doing full research.",
    type: "DB",
    positiveType: "D"
  },
  {
    text: "I trade based on charts and short-term signals rather than long-term vision.",
    type: "TV",
    positiveType: "T"
  },
  {
    text: "I prefer holding my coins for a long time rather than rotating often.",
    type: "HE",
    positiveType: "H"
  },
  {
    text: "I usually stick to one chain instead of exploring new ones.",
    type: "OM",
    positiveType: "M"
  },
  {
    text: "I actively farm airdrops and experiment on testnets and L2s.",
    type: "DB",
    positiveType: "D"
  },
  {
    text: "I mostly get alpha from on-chain tools and trading dashboards.",
    type: "TV",
    positiveType: "T"
  },
  {
    text: "My portfolio is small and curated, not scattered across random coins.",
    type: "HE",
    positiveType: "H"
  },
  {
    text: "I rarely bridge to new chains unless there's strong conviction.",
    type: "OM",
    positiveType: "M"
  },
  {
    text: "I often YOLO into coins without checking tokenomics or team.",
    type: "DB",
    positiveType: "D"
  },
  {
    text: "I believe patterns and indicators predict market moves better than narratives.",
    type: "TV",
    positiveType: "T"
  },
  {
    text: "I'm not tempted to sell, even during market pumps.",
    type: "HE",
    positiveType: "H"
  },
  {
    text: "I support one chain deeply instead of chasing ecosystems.",
    type: "OM",
    positiveType: "M"
  },
  {
    text: "I enjoy discovering low-cap gems before anyone else.",
    type: "DB",
    positiveType: "D"
  },
  {
    text: "I follow traders more than thought leaders or builders.",
    type: "TV",
    positiveType: "T"
  },
  {
    text: "I take pride in having the same bags for years.",
    type: "HE",
    positiveType: "H"
  },
  {
    text: "I don't move funds unless there's a massive incentive.",
    type: "OM",
    positiveType: "M"
  },
  {
    text: "I enjoy the thrill of aping into new projects on launch day.",
    type: "DB",
    positiveType: "D"
  },
  {
    text: "I spend time looking at trading volumes and RSI over whitepapers.",
    type: "TV",
    positiveType: "T"
  },
  {
    text: "I believe long-term conviction beats timing the market.",
    type: "HE",
    positiveType: "H"
  },
  {
    text: "I get overwhelmed by the number of new chains launching.",
    type: "OM",
    positiveType: "M"
  },
  {
    text: "I'd rather get in fast and exit early than wait too long.",
    type: "DB",
    positiveType: "D"
  },
  {
    text: "I trust my trading indicators more than community sentiment.",
    type: "TV",
    positiveType: "T"
  },
  {
    text: "I rarely chase trends because my bags are already solid.",
    type: "HE",
    positiveType: "H"
  },
  {
    text: "I'm chain agnostic and go where the opportunity is.",
    type: "OM",
    positiveType: "O"
  },
  {
    text: "I once bought a coin because someone said 'ngmi' in the replies.",
    type: "DB",
    positiveType: "D"
  },
  {
    text: "I've deployed a smart contract just to farm a Discord role.",
    type: "DB",
    positiveType: "B"
  },
  {
    text: "The more scuffed the website looks, the more bullish I get.",
    type: "DB",
    positiveType: "D"
  },
  {
    text: "I've used 50x leverage 'just to see what happens.'",
    type: "TV",
    positiveType: "T"
  },
  {
    text: "I believe a strong narrative can carry any project... even without a product.",
    type: "TV",
    positiveType: "V"
  },
  {
    text: "I've rage-bought a token because a chart looked like a duck.",
    type: "TV",
    positiveType: "T"
  },
  {
    text: "I've held a coin through a 90% drawdown out of pure spite.",
    type: "HE",
    positiveType: "H"
  },
  {
    text: "If it doesn't pump in 24 hours, I'm gone.",
    type: "HE",
    positiveType: "E"
  },
  {
    text: "I rotate between coins like I rotate my tabs — chaotically and constantly.",
    type: "HE",
    positiveType: "E"
  },
  {
    text: "I bridged $3 to an L2 and paid $9 in gas just to farm a meme quest.",
    type: "OM",
    positiveType: "O"
  },
  {
    text: "I believe my chain is the one true chain and everything else is a rug.",
    type: "OM",
    positiveType: "M"
  },
  {
    text: "I have bags on chains I can't even pronounce.",
    type: "OM",
    positiveType: "O"
  }
];

export const likertOptions = [
  { text: "Strongly Disagree", value: -2 },
  { text: "Disagree", value: -1 },
  { text: "Neutral", value: 0 },
  { text: "Agree", value: 1 },
  { text: "Strongly Agree", value: 2 }
];

export const typeDescriptions = {
  // Degen Types
  DTVM: { 
    name: "The FOMO Oracle", 
    description: "Apes hard, dreams harder. Swears this next token is 'the one.'",
    tagline: "Ape now, reflect later.",
    color: "var(--accent)"
  },
  DTEO: { 
    name: "The Multichain Menace", 
    description: "Farms before dawn. Bridges before gas spikes. Eats testnets for breakfast.",
    tagline: "Where there's yield, there's me.",
    color: "var(--accent)"
  },
  DTEM: { 
    name: "The Exit Liquidity Legend", 
    description: "Buys tops, bridges fast, gets rugged faster — and somehow still bullish.",
    tagline: "I am the liquidity.",
    color: "var(--accent)"
  },
  DTEH: { 
    name: "The Rug Magnet", 
    description: "Launchpad degen with six rugs in a week. Still checking Dexscreener.",
    tagline: "Every chart looks like opportunity.",
    color: "var(--accent)"
  },
  DTHO: {
    name: "The Bridge Bandit",
    description: "Lives on bridges, farms everything. Gas fees are just a suggestion.",
    tagline: "Where there's a bridge, there's a way.",
    color: "var(--accent)"
  },
  DTHM: {
    name: "The Chain Loyalist",
    description: "One chain to rule them all. Never bridges, never betrays.",
    tagline: "My chain, my rules.",
    color: "var(--accent)"
  },
  DTVO: {
    name: "The Visionary Voyager",
    description: "Sees potential everywhere. Bridges to build, not to farm.",
    tagline: "The future is multichain.",
    color: "var(--accent)"
  },
  DTVH: {
    name: "The Diamond Dreamer",
    description: "HODLs with conviction, dreams of moon shots.",
    tagline: "Diamond hands, diamond dreams.",
    color: "var(--accent)"
  },

  // Builder Types
  BHVM: { 
    name: "The Sacred HODLer", 
    description: "Built for the long haul. Still holding his Genesis mint.",
    tagline: "Conviction is utility.",
    color: "var(--accent)"
  },
  BHVO: { 
    name: "The On-Chain Ascetic", 
    description: "Loyal to one chain, one vision, one bag.",
    tagline: "Price is noise. Blocks are truth.",
    color: "var(--accent)"
  },
  BVEO: {
    name: "The Visionary Explorer",
    description: "Builds across chains, exits when the vision is complete.",
    tagline: "Build everywhere, exit wisely.",
    color: "var(--accent)"
  },
  BHEM: { 
    name: "The Ghost Wallet", 
    description: "Moves size in silence. Leaves whales guessing.",
    tagline: "Never brag. Always bag.",
    color: "var(--accent)"
  },
  BHEO: { 
    name: "The Bag Whisperer", 
    description: "Portfolio is all vibe plays. Somehow up bad, spiritually up.",
    tagline: "These bags chose me.",
    color: "var(--accent)"
  },
  BTHO: {
    name: "The Trader HODLer",
    description: "Trades with conviction, holds with purpose, bridges with wisdom.",
    tagline: "Trade smart, hold strong.",
    color: "var(--accent)"
  },
  BVEH: {
    name: "The Visionary HODLer",
    description: "Builds with conviction, holds with purpose, exits with wisdom.",
    tagline: "Build to last, hold to win.",
    color: "var(--accent)"
  },

  // Exit Liquidity Types
  DTOM: { 
    name: "The Chain Hopper", 
    description: "L2 today, Solana tomorrow. Always airdrop hunting.",
    tagline: "One bridge away from greatness.",
    color: "var(--accent)"
  },
  DTOH: { 
    name: "The Airdrop Addict", 
    description: "Has 42 wallets. Can't stop clicking Galxe quests.",
    tagline: "Did someone say retroactive?",
    color: "var(--accent)"
  },
  DTEV: { 
    name: "The Trend Surfer", 
    description: "Memecoin today, NFT mint tomorrow. Always chasing heat.",
    tagline: "First in, first rugged.",
    color: "var(--accent)"
  },
  BTEM: { 
    name: "The Bagcycler", 
    description: "Trades fast, rotates faster, burns gas like a Tesla on turbo.",
    tagline: "Buy, flip, repeat.",
    color: "var(--accent)"
  },

  // Builder Visionaries
  BTOM: { 
    name: "The APY Alchemist", 
    description: "Rotates LPs like a chef flipping DeFi pancakes.",
    tagline: "Compound wisdom.",
    color: "var(--accent)"
  },
  BTVM: { 
    name: "The Vault Crafter", 
    description: "Custom vaults, custom strats. Nobody knows what they're doing — except them.",
    tagline: "I build the meta.",
    color: "var(--accent)"
  },
  BTVH: { 
    name: "The Protocol Hermit", 
    description: "Contributes code, avoids Discord. Wallet is the resume.",
    tagline: "If you know, you know.",
    color: "var(--accent)"
  },
  BTOH: { 
    name: "The Bridge Architect", 
    description: "Keeps ETH on 5 chains. Gas optimizer in human form.",
    tagline: "My bags are everywhere.",
    color: "var(--accent)"
  },
  BTHE: {
    name: "The Strategic Trader",
    description: "Trades with precision, holds with patience, exits with timing.",
    tagline: "Trade the plan, hold the vision.",
    color: "var(--accent)"
  },
  BTVE: {
    name: "The Visionary Trader",
    description: "Sees the future, trades the present, exits with purpose.",
    tagline: "Trade the trend, build the future.",
    color: "var(--accent)"
  },
  BVEM: {
    name: "The Visionary Maxi",
    description: "Builds with vision, committed to one chain, exits strategically.",
    tagline: "One chain, infinite possibilities.",
    color: "var(--accent)"
  },
  BTHM: {
    name: "The Chain Builder",
    description: "Builds steadily on one chain, holds through storms, never wavers.",
    tagline: "Build deep, not wide.",
    color: "var(--accent)"
  },
  BTEO: {
    name: "The Chain Explorer",
    description: "Trades across chains, always seeking the next big opportunity.",
    tagline: "Every chain has potential.",
    color: "var(--accent)"
  },
  BTVO: {
    name: "The Trading Voyager",
    description: "Charts the future across multiple chains, trading with vision.",
    tagline: "Trade globally, think locally.",
    color: "var(--accent)"
  },
  BVHM: {
    name: "The Visionary Maxi Builder",
    description: "Builds with long-term vision, committed to one ecosystem.",
    tagline: "One chain, endless innovation.",
    color: "var(--accent)"
  },
  BVHO: {
    name: "The Multichain Visionary",
    description: "Builds and holds across chains, guided by long-term vision.",
    tagline: "Build everywhere, hold forever.",
    color: "var(--accent)"
  }
};
