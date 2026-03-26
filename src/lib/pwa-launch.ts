export function getLaunchDestination(
  token: string | null,
): "/inbox" | "/sign-in" {
  return token ? "/inbox" : "/sign-in";
}
