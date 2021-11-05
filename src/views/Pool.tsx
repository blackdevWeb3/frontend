import { FC, useState, useEffect } from "react";
import { ethers } from "ethers";
import Layout from "components/Layout";
import PoolSelection from "components/PoolSelection";
import PoolForm from "components/PoolForm";
import DepositSuccess from "components/PoolForm/DepositSuccess";
import {
  DEFAULT_TO_CHAIN_ID,
  TOKENS_LIST,
  ChainId,
  Token,
  UnsupportedChainIdError,
} from "utils";
import { useAppSelector, useConnection, useBalance } from "state/hooks";
import get from "lodash/get";
import { poolClient } from "state/poolsApi";
import styled from "@emotion/styled";
import BouncingDotsLoader from "components/BouncingDotsLoader";

import { BounceType } from "components/BouncingDotsLoader/BouncingDotsLoader";

const Pool: FC = () => {
  const [token, setToken] = useState<Token>(TOKENS_LIST[ChainId.MAINNET][2]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [depositUrl, setDepositUrl] = useState("");
  const [loadingPoolState, setLoadingPoolState] = useState(false);

  const pool = useAppSelector((state) => state.pools.pools[token.bridgePool]);
  const connection = useAppSelector((state) => state.connection);
  const userPosition = useAppSelector((state) =>
    get(state, [
      "pools",
      "users",
      state?.connection?.account || "",
      token.bridgePool,
    ])
  );

  const { isConnected, account, provider, error, chainId } = useConnection();

  const queries = useAppSelector((state) => state.api.queries);

  const { balance } = useBalance({
    chainId: ChainId.MAINNET,
    account,
    tokenAddress: token.address,
  });

  const wrongNetwork =
    provider &&
    (error instanceof UnsupportedChainIdError ||
      chainId !== DEFAULT_TO_CHAIN_ID);

  // Update pool info when token changes
  useEffect(() => {
    setLoadingPoolState(true);

    poolClient.updatePool(token.bridgePool).then((res) => {
      setLoadingPoolState(false);
    });
  }, [token, setLoadingPoolState]);

  useEffect(() => {
    if (isConnected && connection.account && token.bridgePool) {
      poolClient.updateUser(connection.account, token.bridgePool);
    }
  }, [isConnected, connection.account, token.bridgePool]);

  return (
    <Layout>
      {!showSuccess ? (
        <>
          <PoolSelection
            wrongNetwork={wrongNetwork}
            token={token}
            setToken={setToken}
          />
          {!loadingPoolState ? (
            <PoolForm
              wrongNetwork={wrongNetwork}
              symbol={token.symbol}
              icon={token.logoURI}
              decimals={token.decimals}
              tokenAddress={token.address}
              totalPoolSize={
                pool && pool.totalPoolSize
                  ? ethers.BigNumber.from(pool.totalPoolSize)
                  : ethers.BigNumber.from("0")
              }
              apy={
                pool && pool.estimatedApy
                  ? `${Number(pool.estimatedApy) * 100}%`
                  : "0%"
              }
              position={
                userPosition
                  ? ethers.BigNumber.from(userPosition.totalDeposited)
                  : ethers.BigNumber.from("0")
              }
              feesEarned={
                userPosition
                  ? ethers.BigNumber.from(userPosition.feesEarned)
                  : ethers.BigNumber.from("0")
              }
              totalPosition={
                userPosition
                  ? ethers.BigNumber.from(userPosition.positionValue)
                  : ethers.BigNumber.from("0")
              }
              lpTokens={
                userPosition
                  ? ethers.BigNumber.from(userPosition.lpTokens)
                  : ethers.BigNumber.from("0")
              }
              bridgeAddress={token.bridgePool}
              ethBalance={
                account
                  ? // Very odd key assigned to these values.
                    queries[`ethBalance({"account":"${account}","chainId":1})`]
                  : null
              }
              erc20Balances={
                account
                  ? queries[`balances({"account":"${account}","chainId":1})`]
                  : null
              }
              setShowSuccess={setShowSuccess}
              setDepositUrl={setDepositUrl}
              balance={balance}
            />
          ) : (
            <LoadingWrapper>
              <LoadingInfo>
                <LoadingLogo src={token.logoURI} />
                <InfoText>{token.symbol} Pool</InfoText>
                <BouncingDotsLoader type={"big" as BounceType} />
              </LoadingInfo>
              <LoadingPositionWrapper />
              <BigLoadingPositionWrapper />
            </LoadingWrapper>
          )}
        </>
      ) : (
        <DepositSuccess
          depositUrl={depositUrl}
          setShowSuccess={setShowSuccess}
          setDepositUrl={setDepositUrl}
        />
      )}
    </Layout>
  );
};
export default Pool;

const LoadingWrapper = styled.div`
  height: 82vh;
  background-color: #6cf9d8;
  border-radius: 12px;
`;

const LoadingInfo = styled.div`
  text-align: center;
`;

const LoadingLogo = styled.img`
  width: 30px;
  height: 30px;
  object-fit: cover;
  margin-right: 10px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 4px;
  margin-top: 12px;
`;

const InfoText = styled.h3`
  font-family: "Barlow";
  font-size: 1.5rem;
  color: hsla(231, 6%, 19%, 1);
  margin-bottom: 1rem;
`;

const LoadingPositionWrapper = styled.div`
  background-color: rgba(45, 46, 51, 0.25);
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  padding: 1rem;
  font-family: "Barlow";
  border-radius: 5px;
  min-height: 4rem;
  margin-top: 1.25rem;
`;

const BigLoadingPositionWrapper = styled(LoadingPositionWrapper)`
  min-height: 20rem;
  margin-top: 2rem;
`;
