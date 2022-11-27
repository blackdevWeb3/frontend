// Note: ideally this would be written in ts as vercel claims they support it natively.
// However, when written in ts, the imports seem to fail, so this is in js for now.

import { HubPool__factory } from "@across-protocol/contracts-v2";
import { VercelResponse } from "@vercel/node";
import { ethers } from "ethers";
import { BLOCK_TAG_LAG, disabledL1Tokens, maxRelayFeePct } from "./_constants";
import { isPromiseRejectedResult, isString } from "./_typeguards";
import { LimitsInputRequest } from "./_types";

import {
  getLogger,
  InputError,
  getRelayerFeeDetails,
  getCachedTokenPrice,
  getTokenDetails,
  getBalance,
  maxBN,
  minBN,
  isRouteEnabled,
  handleErrorCondition,
} from "./_utils";

const handler = async (
  { query: { token, destinationChainId, originChainId } }: LimitsInputRequest,
  response: VercelResponse
) => {
  const logger = getLogger();
  try {
    const {
      REACT_APP_PUBLIC_INFURA_ID,
      REACT_APP_FULL_RELAYERS, // These are relayers running a full auto-rebalancing strategy.
      REACT_APP_TRANSFER_RESTRICTED_RELAYERS, // These are relayers whose funds stay put.
      REACT_APP_USDC_LP_CUSHION,
      REACT_APP_WETH_LP_CUSHION,
      REACT_APP_DAI_LP_CUSHION,
      REACT_APP_WBTC_LP_CUSHION,
      REACT_APP_BAL_LP_CUSHION,
      REACT_APP_UMA_LP_CUSHION,
      REACT_APP_BOBA_LP_CUSHION,
    } = process.env;
    const providerUrl = `https://mainnet.infura.io/v3/${REACT_APP_PUBLIC_INFURA_ID}`;
    const provider = new ethers.providers.StaticJsonRpcProvider(providerUrl);
    logger.debug({ at: "limits", message: `Using provider at ${providerUrl}` });

    const fullRelayers = !REACT_APP_FULL_RELAYERS
      ? []
      : (JSON.parse(REACT_APP_FULL_RELAYERS) as string[]).map((relayer) => {
          return ethers.utils.getAddress(relayer);
        });
    const transferRestrictedRelayers = !REACT_APP_TRANSFER_RESTRICTED_RELAYERS
      ? []
      : (JSON.parse(REACT_APP_TRANSFER_RESTRICTED_RELAYERS) as string[]).map(
          (relayer) => {
            return ethers.utils.getAddress(relayer);
          }
        );
    if (!isString(token) || !isString(destinationChainId))
      throw new InputError(
        "Must provide token and destinationChainId as query params"
      );

    if (originChainId === destinationChainId) {
      throw new InputError("Origin and destination chains cannot be the same");
    }

    token = ethers.utils.getAddress(token);

    const { l1Token, chainId: computedOriginChainId } = await getTokenDetails(
      provider,
      undefined,
      token,
      originChainId
    );

    const [tokenDetailsResult, routeEnabledResult] = await Promise.allSettled([
      getTokenDetails(provider, l1Token, undefined, destinationChainId),
      isRouteEnabled(computedOriginChainId, Number(destinationChainId), token),
    ]);
    // If any of the above fails or the route is not enabled, we assume that the
    if (
      disabledL1Tokens.includes(l1Token.toLowerCase()) ||
      tokenDetailsResult.status === "rejected" ||
      routeEnabledResult.status === "rejected" ||
      !routeEnabledResult.value
    ) {
      // Add the raw error (if any) to ensure that the user sees the real error if it's something unexpected, like a provider issue.
      const rawError =
        (isPromiseRejectedResult(tokenDetailsResult) &&
          tokenDetailsResult.reason) ||
        (isPromiseRejectedResult(routeEnabledResult) && routeEnabledResult);

      const errorString = rawError
        ? `Raw Error: ${rawError.stack || rawError.toString()}`
        : "";
      throw new InputError(
        `Route from chainId ${computedOriginChainId} to chainId ${destinationChainId} with origin token address ${token} is not enabled. ${errorString}`
      );
    }

    const { l2Token: destinationToken } = tokenDetailsResult.value;
    const hubPool = HubPool__factory.connect(
      "0xc186fA914353c44b2E33eBE05f21846F1048bEda",
      provider
    );

    const multicallInput = [
      hubPool.interface.encodeFunctionData("sync", [l1Token]),
      hubPool.interface.encodeFunctionData("pooledTokens", [l1Token]),
    ];

    // @todo: Generalise the resolution of chainId => gasToken.
    const baseCurrency = destinationChainId === "137" ? "matic" : "eth";
    const tokenPrice = await getCachedTokenPrice(l1Token, baseCurrency);

    const [
      relayerFeeDetails,
      multicallOutput,
      fullRelayerBalances,
      transferRestrictedBalances,
      fullRelayerMainnetBalances,
    ] = await Promise.all([
      getRelayerFeeDetails(
        l1Token,
        ethers.BigNumber.from("10").pow(18),
        Number(destinationChainId),
        tokenPrice
      ),
      hubPool.callStatic.multicall(multicallInput, { blockTag: BLOCK_TAG_LAG }),
      Promise.all(
        fullRelayers.map((relayer) =>
          getBalance(
            destinationChainId!,
            destinationToken,
            relayer,
            BLOCK_TAG_LAG
          )
        )
      ),
      Promise.all(
        transferRestrictedRelayers.map((relayer) =>
          getBalance(
            destinationChainId!,
            destinationToken,
            relayer,
            BLOCK_TAG_LAG
          )
        )
      ),
      Promise.all(
        fullRelayers.map((relayer) =>
          destinationChainId === "1"
            ? ethers.BigNumber.from("0")
            : getBalance("1", l1Token, relayer, BLOCK_TAG_LAG)
        )
      ),
    ]);

    let { liquidReserves } = hubPool.interface.decodeFunctionResult(
      "pooledTokens",
      multicallOutput[1]
    );

    // Subtract by any env-defined cushion amount.
    const lpCushions: { [address: string]: [string | undefined, number] } = {
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": [
        REACT_APP_WETH_LP_CUSHION,
        18,
      ],
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": [
        REACT_APP_USDC_LP_CUSHION,
        6,
      ],
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": [
        REACT_APP_WBTC_LP_CUSHION,
        8,
      ],
      "0x6B175474E89094C44Da98b954EedeAC495271d0F": [
        REACT_APP_DAI_LP_CUSHION,
        18,
      ],
      "0xba100000625a3754423978a60c9317c58a424e3D": [
        REACT_APP_BAL_LP_CUSHION,
        18,
      ],
      "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828": [
        REACT_APP_UMA_LP_CUSHION,
        18,
      ],
      "0x42bBFa2e77757C645eeaAd1655E0911a7553Efbc": [
        REACT_APP_BOBA_LP_CUSHION,
        18,
      ],
    };
    const [lpCushion, decimals] = lpCushions[
      ethers.utils.getAddress(l1Token)
    ] ?? [0, 18];
    if (lpCushion && decimals)
      liquidReserves = liquidReserves.sub(
        ethers.utils.parseUnits(lpCushion, decimals)
      );

    if (liquidReserves.lt(0)) liquidReserves = ethers.BigNumber.from(0);

    const maxGasFee = ethers.utils
      .parseEther(maxRelayFeePct.toString())
      .sub(relayerFeeDetails.capitalFeePercent);

    const transferBalances = fullRelayerBalances.map((balance, i) =>
      balance.add(fullRelayerMainnetBalances[i])
    );

    const responseJson = {
      minDeposit: ethers.BigNumber.from(relayerFeeDetails.gasFeeTotal)
        .mul(ethers.utils.parseEther("1"))
        .div(maxGasFee)
        .toString(),
      maxDeposit: liquidReserves.toString(),
      // Note: max is used here rather than sum because relayers currently do not partial fill.
      maxDepositInstant: minBN(
        maxBN(...fullRelayerBalances, ...transferRestrictedBalances),
        liquidReserves
      ).toString(),
      // Same as above.
      maxDepositShortDelay: minBN(
        maxBN(...transferBalances, ...transferRestrictedBalances),
        liquidReserves
      ).toString(),
    };

    // Instruct Vercel to cache limit data for this token for 5 minutes. Caching can be used to limit number of
    // Vercel invocations and run time for this serverless function and trades off potential inaccuracy in times of
    // high volume. "max-age=0" instructs browsers not to cache, while s-maxage instructs Vercel edge caching
    // to cache the responses and invalidate when deployments update.
    response.setHeader("Cache-Control", "s-maxage=300");
    response.status(200).json(responseJson);
  } catch (error: unknown) {
    return handleErrorCondition("limits", response, logger, error);
  }
};

export default handler;
