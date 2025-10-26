🧠 Stream of Consciousness -- Decentralised Art Discovery Engine
===============================================================

> **"The value of art isn't in the standalone work, but in the constellation of stories that surround it."**

* * * * *

🧱 Architecture Overview
------------------------

*(Insert your `architecture.png` here once uploaded)*

**Stream of Consciousness** integrates four distinct but interlinked systems:

1.  **Envio Indexer** -- Tracks every NFT mint across Ethereum and listens for *awakening* events (curation updates).

2.  **Effects Layer** -- Cleans and normalizes unstandardized NFT metadata and external data (off-chain sources).

3.  **Agent Layer** -- AI-driven web searchers and curators that contextualize artworks with social, historical, and cultural meaning.

4.  **Frontend** -- A React interface visualizing artworks as living, floating entities within a "stream of consciousness."

Each layer speaks to the next --- the indexer awakens data, the effects layer cleans it, the agent interprets it, and the frontend visualizes the evolving story.

* * * * *

🌍 Vision
---------

Art has always been more than pigment, pixels, or price. Its true worth lies in the stories that surround it --- who created it, who collected it, what it defied, and how it survived.

In theory, NFTs promised every artist an immortal place in digital memory.\
In reality, **curation remains centralized**. Museums, marketplaces, and algorithms still decide whose stories are told.

**Stream of Consciousness** envisions a world where:

-   Curation is **decentralised** and **autonomous**.

-   Every artwork can be **awakened** --- made conscious of its on-chain and off-chain existence.

-   Discovery feels **intentional and immersive**, not like scrolling through content.

Ultimately, the project aims to seed a new **decentralised cultural infrastructure**: a living, permanent record of human art and meaning.

* * * * *

✨ What It Is
------------

**Stream of Consciousness** is a decentralised discovery engine that unifies on-chain and off-chain information about every artwork ever minted as an NFT.

It:

-   Tracks NFT mint and awakening events via an **Envio indexer**.

-   Cleans massive volumes of unstandardised data via the **Effects** layer.

-   Uses AI agents to **curate**, **summarize**, and **contextualize** each piece into a living digital archive.

Each artwork gains its own *"stream of consciousness"* --- an evolving narrative that connects blockchain provenance, social data, exhibitions, and creator context.

* * * * *

🧩 Project Structure
--------------------

`stream-of-consciousness/
│
├── indexer/
│   ├── config.yaml           # Envio configuration (networks, contracts)
│   ├── schema.graphql        # Entity schema for NFTs and awakenings
│   ├── EventHandlers.ts      # Core logic for event processing
│   ├── helpers/              # Helper utilities for data parsing
│
├── Effects/
│   ├── metaData.ts           # Aggregates metadata from tokenURI and APIs
│   ├── sanitize.ts           # Cleans and normalizes messy NFT data
│   ├── tokenURI.ts           # Fetches and validates tokenURI JSON
│
├── frontend/
│   ├── src/components/       # Animated and interactive UI components
│   ├── src/data/             # Data fetching & curation card logic
│   └── package.json
│
└── agents/
    ├── agent1q0vj2cyvlwef78s2q2vmqwj0r0hudqylt776q67s4ckqal7uled7wzw2e4w
    └── (requires Bright Data API key)`

* * * * *

⚙️ Indexer Overview
-------------------

The **indexer** (Envio) continuously tracks:

-   All **NFT mints** on Ethereum.

-   The **Awakening contract**, which triggers every time a curation is generated.

When an awakening occurs, the **curation link** is automatically updated in the database.

### Example `.env` Configuration

`# To create or update a token visit https://envio.dev/app/api-tokens
ENVIO_API_TOKEN="<YOUR-API-TOKEN>"

# Multiple RPCs for redundancy
ENVIO_RPC_URL_0=
ENVIO_RPC_URL_1=
ENVIO_RPC_URL_2=
ENVIO_RPC_URL_3=
ENVIO_RPC_URL_4=
ENVIO_RPC_URL_5=

UPDATER_CONTRACT=
TEST_PRIVATE_KEY=
SEP_RPC=`

### Running the Indexer

`pnpm envio init       # Initialize Envio indexer
pnpm codegen          # Generate TypeScript bindings
pnpm dev              # Start in development mode`

* * * * *

🧠 Effects Layer
----------------

NFT data is wildly inconsistent --- URLs that break, metadata that's malformed, and schemas that change across platforms.\
The **Effects** layer solves this by enforcing clean, normalized structures before they reach the frontend or agent.

-   **metaData.ts** → Aggregates and merges all metadata sources.

-   **sanitize.ts** → Standardizes formats and removes noise.

-   **tokenURI.ts** → Fetches and validates tokenURI JSON (IPFS/Arweave/HTTP).

* * * * *

🎨 Frontend
-----------

The **React frontend** brings the entire system to life.\
Each artwork is visualized as a floating card with dynamically loaded curation data --- both on-chain and off-chain.

-   `src/components/` → Animated UI elements (cards, modals, transitions).

-   `src/data/` → Handles data fetching, caching, and card generation.

Run locally:

`npm run start`

* * * * *

🕵️ Agents Layer
----------------

The **Agents** are the soul of Stream of Consciousness --- AI curators that analyze, search, and synthesize.

Each agent performs:

1.  **Analysis** -- Gathers raw data from the indexer, OpenSea, and user-supplied context.

2.  **Search** -- Uses Bright Data API to scrape relevant web information (articles, exhibitions, socials).

3.  **Curation** -- Synthesizes findings into a cohesive curatorial record and caches the resulting file for future lookups.

Every awakened artwork gains a permanent curation link --- its consciousness --- updated on-chain and retrievable through the frontend.

* * * * *

🚀 Future Vision
----------------

Imagine a future where:

-   Every artist, known or unknown, has a permanent on-chain memory.

-   Every artwork is discoverable through its living consciousness.

-   Every curation is a democratic act of cultural preservation.

The **Stream of Consciousness** ecosystem can one day evolve into the **largest decentralised archive of art** --- a library of human creativity, built on the permaweb.