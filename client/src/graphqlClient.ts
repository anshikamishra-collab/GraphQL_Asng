const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql";

type GraphQLRequestOptions = {
  query: string;
  variables?: Record<string, unknown>;
  token?: string | null;
};

export async function graphqlRequest<T>({
  query,
  variables,
  token,
}: GraphQLRequestOptions): Promise<T> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (json.errors && json.errors.length > 0) {
    const message = json.errors[0].message ?? "Unknown GraphQL error";
    throw new Error(message);
  }

  return json.data as T;
}

