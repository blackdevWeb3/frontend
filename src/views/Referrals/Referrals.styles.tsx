import styled from "@emotion/styled";
import { QUERIESV2 } from "utils";

export const Wrapper = styled.div`
  background-color: #2d2e33;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: calc(100% - 72px);

  @media ${QUERIESV2.sm.andDown} {
    min-height: calc(100% - 64px);
  }
`;

export const Content = styled.div`
  width: 100%;
  max-width: calc(1140px + 80px);
  padding: ${32 / 16}rem 0;
  margin: 0 auto;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;

  @media ${QUERIESV2.tb.andDown} {
    padding: ${16 / 16}rem 0rem ${48 / 16}rem;
  }

  @media ${QUERIESV2.sm.andDown} {
    padding: ${16 / 16}rem 0rem ${48 / 16}rem;
  }
`;

export const InnerContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 64px;
  width: 100%;

  @media ${QUERIESV2.sm.andDown} {
    gap: 24px;
  }
`;

export const ReferralMediumWrapper = styled.div`
  width: 100%; ;
`;
