import { useCallback, useRef, useState } from "react";

const GRAPHQL_ENDPOINT = "https://indexer.hyperindex.xyz/28644e9/v1/graphql";
// Hardcoded as requested
const HARDCODED_ID = "1_0x7104b3e9e6fbbb878ade511f360901646836381a_1";

// ---------- low-level fetch helpers ----------
async function gqlRequest(query, variables = {}) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errors && json.errors.length) {
    const msg = json.errors.map((e) => e.message).join(" | ");
    throw new Error(`GraphQL error: ${msg}`);
  }
  return json.data;
}

// Introspect fields on the Art type so we can fetch "all columns"
async function getArtFieldNames() {
  const INTROSPECTION = /* GraphQL */ `
    query ArtFields {
      __type(name: "Art") {
        fields { name }
      }
    }
  `;
  const data = await gqlRequest(INTROSPECTION);
  const fields = data?.__type?.fields?.map((f) => f.name) || [];
  // Be safe: always include id and image_url first if present
  const prioritized = ["id", "image_url"];
  const rest = fields.filter((f) => !prioritized.includes(f));
  return [...prioritized.filter((f) => fields.includes(f)), ...rest];
}

// Build a query string using all field names (selection set)
function buildArtByPkQuery(fieldNames) {
  const selection = fieldNames.join("\n      ");
  return `
    query ArtByPk($id: String!) {
      Art_by_pk(id: $id) {
        ${selection}
      }
    }
  `;
}

// ---------- public: one-shot fetchers ----------
/**
 * Fetch ALL fields for Art_by_pk for the given id.
 * Uses introspection once per call, then queries with the full selection set.
 */
export async function fetchArtByPkOnce(id = HARDCODED_ID) {
  const fieldNames = await getArtFieldNames();
  const query = buildArtByPkQuery(fieldNames);
  const data = await gqlRequest(query, { id });
  return data?.Art_by_pk ?? null;
}

/**
 * Convenience: returns only the image_url (string | null).
 */
export async function getImageUrl(id = HARDCODED_ID) {
  // Fast path: try a focused query first; if it fails (schema mismatch), fall back to full fetch.
  const QUICK = `
    query ImageOnly($id: String!) {
      Art_by_pk(id: $id) { image_url }
    }
  `;
  try {
    const data = await gqlRequest(QUICK, { id });
    return data?.Art_by_pk?.image_url ?? null;
  } catch {
    const art = await fetchArtByPkOnce(id);
    return art?.image_url ?? null;
  }
}

// ---------- React hook: run-on-trigger pattern ----------
/**
 * React hook that prepares a trigger-able fetch for Art_by_pk.
 * Returns { data, loading, error, run, imageUrl }.
 *
 * Example:
 *   const { data, loading, error, run, imageUrl } = useArtByPk();
 *   // call run() in a click handler to fetch on demand
 */
export function useArtByPk(id = HARDCODED_ID) {
  const [data, setData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fieldsCacheRef = useRef(null); // cache field list for subsequent triggers

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // cache field names between triggers for speed
      if (!fieldsCacheRef.current) {
        fieldsCacheRef.current = await getArtFieldNames();
      }
      const query = buildArtByPkQuery(fieldsCacheRef.current);
      const result = await gqlRequest(query, { id });
      const art = result?.Art_by_pk ?? null;
      setData(art);
      setImageUrl(art?.image_url ?? null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setData(null);
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { data, imageUrl, loading, error, run };
}