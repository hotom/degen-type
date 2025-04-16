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
  ADMT: { name: "The Chain Crusader", tagline: "All in, never out.", description: "You ape fast, never sell, ride one chain to the end, and farm tokens like there's no tomorrow.", imageUrl: "/degen_avatar.png" },
  ADMN: { name: "The JPEG Berserker", tagline: "Buy now, list later.", description: "You ape into NFTs on one chain and diamond hand them through the apocalypse.", imageUrl: "/degen_avatar.png" },
  ADOT: { name: "The Multi-Farm Degen", tagline: "Airdrops are my love language.", description: "Omni-chain, high-risk token hunter who rotates farms like fashion trends.", imageUrl: "/degen_avatar.png" },
  ADON: { name: "The NFT Nomad", tagline: "Mint now, explain later.", description: "You live across chains, hoard JPEGs, and refuse to let go. Culture over liquidity.", imageUrl: "/degen_avatar.png" },
  APMT: { name: "The Exit Scammer", tagline: "Bought the top. Selling the bottom.", description: "Apes hard, paper hands every dip, loyal to one chain, and addicted to token flips.", imageUrl: "/degen_avatar.png" },
  APMN: { name: "The Chain-Cope Collector", tagline: "Still holding the NFT... emotionally.", description: "Lives on one chain, flips NFTs, but sells too early and regrets it forever.", imageUrl: "/degen_avatar.png" },
  APOT: { name: "The Rug Tourist", tagline: "Bridge. Buy. Bail.", description: "Omni-chain explorer who buys hype tokens, sells fast, and survives off copium.", imageUrl: "/degen_avatar.png" },
  APON: { name: "The JPEG Flipper", tagline: "List. Delist. Regret.", description: "Mint everything, list everything, never sure why you bought it in the first place.", imageUrl: "/degen_avatar.png" },
  BDMT: { name: "The Maximalist Strategist", tagline: "Slow, steady, and always staked.", description: "Deep research, strong conviction, loyal to one chain, farming responsibly since day one.", imageUrl: "/degen_avatar.png" },
  BDMN: { name: "The NFT Philosopher", tagline: "This PFP is my thesis.", description: "Buys only what makes sense long-term. On one chain. Vibes over volume.", imageUrl: "/degen_avatar.png" },
  BDOT: { name: "The Multi-Chain Yieldnerd", tagline: "DYOR across 12 chains.", description: "Thoughtful ape, omni-chain optimizer, always looking for yield… but sustainably.", imageUrl: "/degen_avatar.png" },
  BDON: { name: "The NFT Historian", tagline: "This JPEG will be in museums.", description: "Cross-chain collector with long-term taste. You'll never sell, and that's the point.", imageUrl: "/degen_avatar.png" },
  BPMT: { name: "The Conservative Trader", tagline: "I'll bridge later.", description: "Low risk, fast to sell, only trust one chain, and barely touch NFTs.", imageUrl: "/degen_avatar.png" },
  BPMN: { name: "The Defensive Collector", tagline: "I'm in for the vibes... unless it dips.", description: "Picks a chain, loves a project, but paper hands when the floor shakes.", imageUrl: "/degen_avatar.png" },
  BPOT: { name: "The Yield Cautious", tagline: "Quick profit. Quick exit.", description: "Diversified, low-conviction, quick to bridge and quicker to swap.", imageUrl: "/degen_avatar.png" },
  BPON: { name: "The NFT Tourist", tagline: "It looked cute, okay?", description: "Scans every chain for art, flips emotionally, and always blames the floor gods.", imageUrl: "/degen_avatar.png" }
};

export const likertOptions = [
  { value: 2, label: 'Strongly Agree' },
  { value: 1, label: 'Agree' },
  { value: 0, label: 'Neutral' },
  { value: -1, label: 'Disagree' },
  { value: -2, label: 'Strongly Disagree' },
];
