// src/effects/metadata.ts
import { experimental_createEffect, S } from "envio";

// Define the metadata schema matching your new Art schema
const nftMetadataSchema = S.schema({
    name: S.optional(S.string),
    image_url: S.optional(S.string),
    animation_url: S.optional(S.string),
    external_url: S.optional(S.string),
    // Note: removed description and attributes to match your schema
});

export type NFTMetadata = S.Infer<typeof nftMetadataSchema>;


// Rate limiting for IPFS/Arweave calls
let lastMetadataFetchTime = 0;
const MIN_METADATA_INTERVAL_MS = 500; // 500ms between metadata fetches

const waitForMetadataRateLimit = async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastMetadataFetchTime;
    
    if (timeSinceLastFetch < MIN_METADATA_INTERVAL_MS) {
        await new Promise(resolve => 
            setTimeout(resolve, MIN_METADATA_INTERVAL_MS - timeSinceLastFetch)
        );
    }
    lastMetadataFetchTime = Date.now();
};

// Helper function for timeout (your existing code)
const fetchWithTimeout = async (url: string, timeoutMs: number = 10000): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Envio-Indexer/1.0)'
            }
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const fetchNFTMetadata = experimental_createEffect(
    {
        name: "fetchNFTMetadata",
        input: S.schema({
            tokenURI: S.string,
            contractAddress: S.string,
            tokenId: S.bigint,
        }),
        output: nftMetadataSchema,
        cache: true, // Enable caching to avoid duplicate metadata fetches
    },
    async ({ input: { tokenURI, contractAddress, tokenId }, context }): Promise<NFTMetadata> => {
        const emptyResult: NFTMetadata = {
            name: undefined,
            image_url: undefined,
            animation_url: undefined,
            external_url: undefined,
        };

        // Apply rate limiting for IPFS/Arweave calls
        await waitForMetadataRateLimit();

        try {
            // Handle different URI schemes (your existing code)
            let fetchUrl = tokenURI;

            // Convert IPFS to HTTP if needed
            if (tokenURI.startsWith('ipfs://')) {
                const ipfsHash = tokenURI.replace('ipfs://', '');
                // Try multiple IPFS gateways for reliability
                const gateways = [
                    `https://ipfs.io/ipfs/${ipfsHash}`,
                    `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
                    `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
                ];

                // Try each gateway until one works
                for (const gateway of gateways) {
                    try {
                        const response = await fetchWithTimeout(gateway, 5000);
                        if (response.ok) {
                            fetchUrl = gateway;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }

            // Handle data URIs (base64 encoded)
            if (tokenURI.startsWith('data:')) {
                try {
                    const base64Data = tokenURI.split(',')[1];
                    const jsonString = Buffer.from(base64Data, 'base64').toString();
                    const metadata = JSON.parse(jsonString) as Record<string, unknown>;

                    return {
                        name: typeof metadata.name === 'string' ? metadata.name : undefined,
                        image_url: typeof metadata.image === 'string' ? metadata.image :
                            typeof metadata.image_url === 'string' ? metadata.image_url : undefined,
                        animation_url: typeof metadata.animation_url === 'string' ? metadata.animation_url : undefined,
                        external_url: typeof metadata.external_url === 'string' ? metadata.external_url : undefined,
                    };
                } catch (error) {
                    context.log.warn(`Failed to parse data URI for ${contractAddress}: ${error}`);
                    return emptyResult;
                }
            }

            // Fetch HTTP/HTTPS URLs
            const response = await fetchWithTimeout(fetchUrl, 10000);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const metadata = await response.json() as Record<string, unknown>;

            // Extract fields with fallbacks for different metadata standards
            return {
                name: typeof metadata.name === 'string' ? metadata.name :
                    typeof metadata.title === 'string' ? metadata.title : undefined,
                image_url: typeof metadata.image === 'string' ? metadata.image :
                    typeof metadata.image_url === 'string' ? metadata.image_url : undefined,
                animation_url: typeof metadata.animation_url === 'string' ? metadata.animation_url : undefined,
                external_url: typeof metadata.external_url === 'string' ? metadata.external_url :
                    typeof metadata.external_link === 'string' ? metadata.external_link : undefined,
            };

        } catch (error) {
            context.log.warn(`Failed to fetch metadata for ${contractAddress} token ${tokenId}: ${error}`);
            return emptyResult;
        }
    }
);