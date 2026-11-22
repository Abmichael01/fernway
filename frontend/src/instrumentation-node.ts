import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { getHistory, getSpotPrices } from "@/server/services/prices";

/*
 * - Gives each address 5 s to connect before Node tries the next one. Node's default (250 ms) is
 *   too short on slow links: the IPv4 attempt gets cut off and the request fails on an IPv6
 *   address the network can't reach (seen with the price API).
 * - Loads today's crypto prices in the background so the first person to open Crypto (or buy)
 *   doesn't wait on the price API. Startup never waits for it.
 */
setDefaultAutoSelectFamilyAttemptTimeout(5_000);
void getSpotPrices().then(() => getHistory("BTC", 30));
