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
  { text: "I believe my chain is the one true chain and everything else is a rug.", type: "MO", positiveType: "M" },
  { text: "I've called other chains \"VC rugs\" in group chats.", type: "MO", positiveType: "M" },
  { text: "I rarely bridge — too risky and complex.", type: "MO", positiveType: "M" },
  { text: "I genuinely think this chain <enter name of your fav chain> will flip ETH or its the next Solana.", type: "MO", positiveType: "M" },
  { text: "I believe Bitcoin fixes more than just finance.", type: "MO", positiveType: "M" },
  { text: "I've bridged so many times I qualify for frequent flyer status.", type: "MO", positiveType: "O" },
  { text: "I've claimed airdrops I don't even remember farming.", type: "MO", positiveType: "O" },
  { text: "I get excited when a new L2 launches — even if it has no dApps.", type: "MO", positiveType: "O" },

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
  BDMT: { name: "Yield Architect 🧑‍🌾", tagline: "Patiently farming future gains.", description: "Disciplined, long-term token farmers, patiently building yield strategies on their favorite chain.", imageUrl: "/degen_avatar.png",
         detailedDescription: "As a Yield Architect, you approach the world of DeFi with the precision of an engineer and the patience of a monk. You're the kind of person who builds financial fortresses—staking, compounding, and strategizing for the long haul on your chosen chain. You don't chase pumps; you build resilient positions brick by brick, armed with spreadsheets, calculators, and long-term conviction. While others chase fleeting narratives, you're quietly constructing systems that weather every storm." },
  BDMN: { name: "Chain Curator 🎨", tagline: "Curating value, one NFT at a time.", description: "Strategic NFT collectors, deeply loyal, steadily curating valuable diamond-handed collections.", imageUrl: "/degen_avatar.png",
         detailedDescription: "You see NFTs as more than just assets—they're cultural artifacts, and you're their most discerning collector. As a Chain Curator, your loyalty to your home chain runs deep, and your eye for value is unmatched. While flippers come and go, your carefully cultivated gallery tells a story of consistency, taste, and strategic accumulation. You buy what others overlook, and years later, everyone wishes they had your vision." },
  BDOT: { name: "Yield Lord 👑", tagline: "Mastering yield across the chains.", description: "Skilled multi-chain farmers thoughtfully balancing yield opportunities across ecosystems.", imageUrl: "/degen_avatar.png",
         detailedDescription: "You don't just farm yields—you command them across the multichain frontier. As a Yield Lord, your portfolio spans ecosystems, and you masterfully juggle APRs, emissions, and impermanent loss. Your moves are intentional and calculated, never impulsive. People may think you're just chasing yield, but you're actually building a cross-chain empire—one that thrives in all market conditions, powered by data, discipline, and diamond hands." },
  BDON: { name: "NFT Curator 🎯", tagline: "Seeking gems across the metaverse.", description: "Selective NFT experts carefully curating high-value art collections from diverse blockchains.", imageUrl: "/degen_avatar.png",
         detailedDescription: "You're the tastemaker of the NFT multiverse. As an NFT Curator, you explore diverse blockchains not for quick flips, but to uncover true artistic and cultural gems. You're part archivist, part visionary—building a cross-ecosystem collection that reflects sophistication and permanence. You don't follow trends, you set them, and your gallery becomes a roadmap for collectors who want to play the long game." },

  // --- Ape / Paper Hand ---
  APMT: { name: "Token Raider ⚔️", tagline: "Loyal chain, fast exit.", description: "Fearless token traders loyal to their chain, but quick to exit at the slightest volatility.", imageUrl: "/degen_avatar.png",
         detailedDescription: "As a Token Raider, you live for adrenaline and volatility. You're loyal to your chain, but that doesn't mean you won't exit at warp speed when red candles flash. Your style is aggressive, fast, and fueled by FOMO—and it works because you're quick to cut losses and quicker to ape into the next opportunity. You're not here to build—you're here to conquer, one pump at a time." },
  APMN: { name: "Paperhand Picasso 🎭", tagline: "Chasing hype, flipping quick.", description: "Impulsive NFT flippers loyal to their home chain, rapidly trading to capture short-term hype.", imageUrl: "/degen_avatar.png",
         detailedDescription: "You flip NFTs like a DJ spins tracks—fast, loud, and with flair. As a Paperhand Picasso, you stay true to your chain but move through collections with lightning speed. You thrive in high-volume mint cycles, where hype and chaos reign. While others are still reading the roadmap, you've already minted, listed, and moved on. Your genius lies in timing, not patience." },
  APOT: { name: "Bridge Bandit 🦝", tagline: "Quick chains, quicker profits.", description: "Opportunistic traders who jump chains quickly, always chasing rapid profits in tokens.", imageUrl: "/degen_avatar.png",
         detailedDescription: "You are the quintessential degen explorer. As a Bridge Bandit, you treat chains like airports and tokens like lottery tickets. You move fast, take risks others wouldn't dare, and often score big—before disappearing into the next ecosystem. Stability bores you. You thrive in uncertainty, and your wallet's transaction history reads like a tour through every L2, sidechain, and bridge ever built." },
  APON: { name: "Mint Addict 🧃", tagline: "Minting hype, flipping fast.", description: "Fast-moving NFT traders minting everywhere, hopping ecosystems in pursuit of quick flips and hype cycles.", imageUrl: "/degen_avatar.png",
         detailedDescription: "You're here for the rush. As a Mint Addict, nothing excites you more than a fresh NFT drop and the thrill of hitting a rare. Your attention span may be short, but your minting finger is fast. Whether it's Solana, ETH, or obscure rollups, you're there—early, loud, and sometimes lucky. You don't marry NFTs—you date them, flip them, and chase the next dopamine hit." },

  // --- Ape / Diamond Hand ---
  ADMT: { name: "Diamond Chad 💎", tagline: "Bold holds on one chain.", description: "Bold token holders committed to one chain, confidently accumulating positions through market dips.", imageUrl: "/degen_avatar.png",
         detailedDescription: "You are unshakeable. As a Diamond Chad, you pick a chain and stick with it, regardless of what the market throws your way. Dips are buying opportunities, not exit signals. You're respected for your conviction and calm, and while others panic sell, you're adding to your bags. You believe in fundamentals, long-term narratives, and the kind of patience that turns FUD into generational wealth." },
  ADMN: { name: "JPEG Whale 🐳", tagline: "Unshaken collector, loyal chain.", description: "Loyal NFT collectors building substantial, prestigious collections, unfazed by market swings.", imageUrl: "/degen_avatar.png",
         detailedDescription: "Your wallet is a museum of prestige. As a JPEG Whale, you don't just buy blue chips—you become the story behind them. You're not in it for the flip; you're in it for legacy, influence, and status. You support artists, uplift communities, and quietly accumulate pieces that become iconic. When markets crash, you hold. When they moon, you're already ahead." },
  ADOT: { name: "Multichain Farmer 🚜", tagline: "Adventurous yield, confident holds.", description: "Adventurous yield-chasers holding tokens confidently across multiple ecosystems, treating dips as opportunities.", imageUrl: "/degen_avatar.png",
         detailedDescription: "As a Multichain Farmer, you blend degen courage with diamond discipline. You explore new chains with curiosity and allocate capital with confidence. Your portfolio thrives not because you avoid risk, but because you respect it—and manage it with care. You're the type to jump into a new yield farm, but not without checking the audit first. You bring strategy to the Wild West of crypto." },
  ADON: { name: "JPEG Nomad 🚀", tagline: "Building brave collections everywhere.", description: "Brave NFT collectors exploring diverse blockchains, carefully building diamond-handed collections everywhere.", imageUrl: "/degen_avatar.png",
         detailedDescription: "You're an NFT archaeologist with a rover wallet. As a JPEG Nomad, your collections span chains, trends, and timelines. You don't just mint—you discover. You have a gift for spotting early gems, and you hold them through thick and thin. While others sell during downturns, you're waiting for the culture to catch up with your vision. Every wallet of yours is a living portfolio of digital history." },

  // --- Builder / Paper Hand ---
  BPMT: { name: "Weak-Hand Wizard 🧙‍♂️", tagline: "Cautious chain, careful exit.", description: "Cautious token investors sticking closely to their favored chain, yet quick to exit when uncertainty strikes.", imageUrl: "/degen_avatar.png",
         detailedDescription: "You're cautious but capable. As a Weak-Hand Wizard, you stick to your chain but keep one foot near the exit. You believe in discipline, but you also know when to fold. You're not afraid to take small losses to avoid big ones, and that pragmatism is your edge. Your trades may not make headlines, but they make sense—and they keep you in the game long after others burn out." },
  BPMN: { name: "NFT Tourist 🌴", tagline: "Careful curator, cautious trader.", description: "Careful NFT traders staying close to their preferred chain but quick to move out when the market shakes.", imageUrl: "/degen_avatar.png",
         detailedDescription: "You're a sightseer in the NFT jungle. As an NFT Tourist, you explore collections with curiosity but rarely overcommit. You have taste, but not attachment. When the market gets shaky, you exit with grace and look for the next calm destination. You're not in it for community or clout—you're here for curiosity, optionality, and the occasional gem that makes it all worth it." },
  BPOT: { name: "Liquidity Nomad 🧳", tagline: "Savvy swaps, swift shifts.", description: "Savvy traders cautiously navigating multiple chains, swiftly rotating assets in search of stable profits.", imageUrl: "/degen_avatar.png",
         detailedDescription: "You move like water. As a Liquidity Nomad, you're always observing where capital flows, where incentives rise, and where danger lurks. You don't overstay your welcome in any one ecosystem. Your portfolio is flexible, your mindset adaptive, and your edge lies in avoiding emotional traps. You ride the waves, but you never get dragged by the undertow." },
  BPON: { name: "Floor Price Wanderer 🏕️", tagline: "Methodical moves, watched floors.", description: "Strategic NFT traders methodically hopping between chains, closely watching floor prices and quick to reposition.", imageUrl: "/degen_avatar.png",
         detailedDescription: "You're the data-driven flipper with a gentle soul. As a Floor Price Wanderer, you scan listings, track volume, and plot exits before you even enter. You don't chase art or community—you chase edges. You move through NFT ecosystems like a hiker through forests: aware, methodical, and quick to adjust your route. You might not diamond-hand, but you don't paper-hand either—you optimize." }
};

export const likertOptions = [
  { // Strongly Agree (Darkest Green)
    value: 2, 
    label: 'Strongly Agree', 
    defaultClasses: 'bg-slate-700/50 border-slate-600 text-slate-300',
    hoverClasses: 'hover:bg-emerald-700/80 hover:border-emerald-600 hover:text-white', // Adjusted opacity/shade
    selectedClasses: 'bg-gradient-to-r from-emerald-600 to-green-700 text-white border-transparent shadow-md scale-105' 
  },
  { // Agree (Lighter Green, same style pattern)
    value: 1, 
    label: 'Agree', 
    defaultClasses: 'bg-slate-700/50 border-slate-600 text-slate-300',
    hoverClasses: 'hover:bg-emerald-500/70 hover:border-emerald-400 hover:text-white', // Lighter hover
    selectedClasses: 'bg-gradient-to-r from-emerald-400 to-green-500 text-white border-transparent shadow-md scale-105' // Lighter selected, matching style
  },
  { // Neutral (Grey)
    value: 0, 
    label: 'Neutral', 
    defaultClasses: 'bg-slate-700/50 border-slate-600 text-slate-300',
    hoverClasses: 'hover:bg-slate-600/70 hover:border-slate-500 hover:text-white',
    selectedClasses: 'bg-slate-500 text-white border-transparent shadow-md scale-105'
  },
  { // Disagree (Lighter Red, same style pattern)
    value: -1, 
    label: 'Disagree', 
    defaultClasses: 'bg-slate-700/50 border-slate-600 text-slate-300',
    hoverClasses: 'hover:bg-red-500/70 hover:border-red-400 hover:text-white', // Lighter hover
    selectedClasses: 'bg-gradient-to-r from-red-400 to-rose-500 text-white border-transparent shadow-md scale-105' // Lighter selected, matching style
  },
  { // Strongly Disagree (Darkest Red)
    value: -2, 
    label: 'Strongly Disagree', 
    defaultClasses: 'bg-slate-700/50 border-slate-600 text-slate-300',
    hoverClasses: 'hover:bg-red-700/80 hover:border-red-600 hover:text-white', // Adjusted opacity/shade
    selectedClasses: 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-transparent shadow-md scale-105' 
  },
];
