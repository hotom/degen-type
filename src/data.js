export const questions = [
  // Risk Instinct: Ape vs Builder (AB)
  { text: "I enjoy the thrill of aping into new projects on launch day.", type: "AB", positiveType: "A" },
  { text: "I often YOLO into coins without checking tokenomics or team.", type: "AB", positiveType: "A" },
  { text: "I've joined a Telegram group, bought the token, and THEN asked \"what does this do?\"", type: "AB", positiveType: "A" },
  { text: "I consider \"DEXTools Trending\" a reliable investment strategy.", type: "AB", positiveType: "A" },
  { text: "I've bought tokens just because they had \"AI\" or \"ZK\" in the name.", type: "AB", positiveType: "A" },
  { text: "I always research tokenomics and teams before buying.", type: "AB", positiveType: "B" },
  { text: "I prefer steady, proven projects over hype.", type: "AB", positiveType: "B" },
  { text: "I believe long-term conviction beats timing the market.", type: "AB", positiveType: "B" },
  { text: "I say things like \"this is the AWS of crypto\" in real conversations.", type: "AB", positiveType: "B" },
  { text: "I believe a strong narrative can carry any project... even without a product.", type: "AB", positiveType: "B" },

  // Holding Style: Diamond vs Paper (DP)
  { text: "I've held through an 80% drawdown and called it \"accumulation.\"", type: "DP", positiveType: "D" },
  { text: "I've used the phrase \"I'm not selling until it hits $1\" unironically.", type: "DP", positiveType: "D" },
  { text: "I tell myself \"it's only a loss if you sell\" even when my portfolio bleeds red.", type: "DP", positiveType: "D" },
  { text: "I'm emotionally attached to some coins in my portfolio.", type: "DP", positiveType: "D" },
  { text: "I celebrate dip days with \"buy the fear\" memes.", type: "DP", positiveType: "D" },
  { text: "I feel personally attacked by red candles.", type: "DP", positiveType: "P" },
  { text: "I once sold the bottom and bought back higher, twice, same day.", type: "DP", positiveType: "P" },
  { text: "I said \"exit liquidity\" out loud — about myself.", type: "DP", positiveType: "P" },
  { text: "I sold at break-even and felt like Warren Buffett.", type: "DP", positiveType: "P" },
  { text: "I've regretted not selling sooner many times.", type: "DP", positiveType: "P" },

  // Chain Loyalty: Maxi vs Omni (MO)
  { text: "I have bags on chains I can't even pronounce.", type: "MO", positiveType: "O" },
  { text: "My wallet has gas for 8 chains and I still bridged to the wrong one.", type: "MO", positiveType: "O" },
  { text: "I've bridged so many times I qualify for frequent flyer status.", type: "MO", positiveType: "O" },
  { text: "I've claimed airdrops I don't even remember farming.", type: "MO", positiveType: "O" },
  { text: "I get excited when a new L2 launches — even if it has no dApps.", type: "MO", positiveType: "O" },
  { text: "I believe my chain is the one true chain and everything else is a rug.", type: "MO", positiveType: "M" },
  { text: "I've called other chains \"VC rugs\" in group chats.", type: "MO", positiveType: "M" },
  { text: "I rarely bridge — too risky and complex.", type: "MO", positiveType: "M" },
  { text: "I genuinely think this chain <enter name of your fav chain> will flip ETH or its the next Solana.", type: "MO", positiveType: "M" },
  { text: "I believe Bitcoin fixes more than just finance.", type: "MO", positiveType: "M" },

  // Asset Identity: Token vs NFT (TN)
  { text: "I mostly get alpha from on-chain tools and trading dashboards.", type: "TN", positiveType: "T" },
  { text: "I watch token charts more than I check my messages.", type: "TN", positiveType: "T" },
  { text: "I've farmed, staked, dumped — all before my coffee.", type: "TN", positiveType: "T" },
  { text: "I've chased 4-digit APY without knowing what the token does.", type: "TN", positiveType: "T" },
  { text: "My tokens have no use case, but they're staked somewhere.", type: "TN", positiveType: "T" },
  { text: "I've listed an NFT, canceled it, relisted higher — then watched it not sell.", type: "TN", positiveType: "N" },
  { text: "I've used phrases like \"long-term utility\" or \"floor sweep coming\" in serious tones.", type: "TN", positiveType: "N" },
  { text: "I've held an NFT through a -90% drop and called it conviction.", type: "TN", positiveType: "N" },
  { text: "I've explained the importance of metadata to someone IRL.", type: "TN", positiveType: "N" },
  { text: "I've used \"gm\" as a greeting more than \"hello.\"", type: "TN", positiveType: "N" },
];

export const typeDescriptions = {
  // --- Builder / Diamond Hand ---
  BDMT: { name: "Yield Architect 🧑‍🌾", tagline: "Patiently farming future gains.", description: "Disciplined, long-term token farmers, patiently building yield strategies on their favorite chain.", imageUrl: "/degen_avatar.png" },
  BDMN: { name: "Chain Curator 🎨", tagline: "Curating value, one NFT at a time.", description: "Strategic NFT collectors, deeply loyal, steadily curating valuable diamond-handed collections.", imageUrl: "/degen_avatar.png" },
  BDOT: { name: "Yield Lord 👑", tagline: "Mastering yield across the chains.", description: "Skilled multi-chain farmers thoughtfully balancing yield opportunities across ecosystems.", imageUrl: "/degen_avatar.png" },
  BDON: { name: "NFT Curator 🎯", tagline: "Seeking gems across the metaverse.", description: "Selective NFT experts carefully curating high-value art collections from diverse blockchains.", imageUrl: "/degen_avatar.png" },

  // --- Ape / Paper Hand ---
  APMT: { name: "Token Raider ⚔️", tagline: "Loyal chain, fast exit.", description: "Fearless token traders loyal to their chain, but quick to exit at the slightest volatility.", imageUrl: "/degen_avatar.png" },
  APMN: { name: "Paperhand Picasso 🎭", tagline: "Chasing hype, flipping quick.", description: "Impulsive NFT flippers loyal to their home chain, rapidly trading to capture short-term hype.", imageUrl: "/degen_avatar.png" },
  APOT: { name: "Bridge Bandit 🦝", tagline: "Quick chains, quicker profits.", description: "Opportunistic traders who jump chains quickly, always chasing rapid profits in tokens.", imageUrl: "/degen_avatar.png" },
  APON: { name: "Mint Addict 🧃", tagline: "Minting hype, flipping fast.", description: "Fast-moving NFT traders minting everywhere, hopping ecosystems in pursuit of quick flips and hype cycles.", imageUrl: "/degen_avatar.png" },

  // --- Ape / Diamond Hand ---
  ADMT: { name: "Diamond Chad 💎", tagline: "Bold holds on one chain.", description: "Bold token holders committed to one chain, confidently accumulating positions through market dips.", imageUrl: "/degen_avatar.png" },
  ADMN: { name: "JPEG Whale 🐳", tagline: "Unshaken collector, loyal chain.", description: "Loyal NFT collectors building substantial, prestigious collections, unfazed by market swings.", imageUrl: "/degen_avatar.png" },
  ADOT: { name: "Multichain Farmer 🚜", tagline: "Adventurous yield, confident holds.", description: "Adventurous yield-chasers holding tokens confidently across multiple ecosystems, treating dips as opportunities.", imageUrl: "/degen_avatar.png" },
  ADON: { name: "JPEG Nomad 🚀", tagline: "Building brave collections everywhere.", description: "Brave NFT collectors exploring diverse blockchains, carefully building diamond-handed collections everywhere.", imageUrl: "/degen_avatar.png" },

  // --- Builder / Paper Hand ---
  BPMT: { name: "Weak-Hand Wizard 🧙‍♂️", tagline: "Cautious chain, careful exit.", description: "Cautious token investors sticking closely to their favored chain, yet quick to exit when uncertainty strikes.", imageUrl: "/degen_avatar.png" },
  BPMN: { name: "NFT Tourist 🌴", tagline: "Careful curator, cautious trader.", description: "Careful NFT traders staying close to their preferred chain but quick to move out when the market shakes.", imageUrl: "/degen_avatar.png" },
  BPOT: { name: "Liquidity Nomad 🧳", tagline: "Savvy swaps, swift shifts.", description: "Savvy traders cautiously navigating multiple chains, swiftly rotating assets in search of stable profits.", imageUrl: "/degen_avatar.png" },
  BPON: { name: "Floor Price Wanderer 🏕️", tagline: "Methodical moves, watched floors.", description: "Strategic NFT traders methodically hopping between chains, closely watching floor prices and quick to reposition.", imageUrl: "/degen_avatar.png" }
};

export const likertOptions = [
  { value: 2, label: 'Strongly Agree' },
  { value: 1, label: 'Agree' },
  { value: 0, label: 'Neutral' },
  { value: -1, label: 'Disagree' },
  { value: -2, label: 'Strongly Disagree' },
];
