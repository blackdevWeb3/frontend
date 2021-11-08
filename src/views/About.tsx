import { FC } from "react";
import styled from "@emotion/styled";
import heroBg from "assets/hero-across-bg.png";
import BulletImg from "assets/Across-logo-bullet.svg";
import { ReactComponent as UnstyledUmaLogo } from "assets/Across-Powered-UMA.svg";
import { ReactComponent as DiscordLogo } from "assets/disc-logo.svg";
import { ReactComponent as TwitterLogo } from "assets/icon-twitter.svg";
import { COLORS } from "utils";

const NAV_LINKS = [
  {
    name: "FAQ",
    url: "https://across.gitbook.io/bridge/faq",
  },
  {
    name: "Docs",
    url: "https://across.gitbook.io/bridge/",
  },
];
const DISCORD_LINK = {
  name: "Discord",
  url: "https://discord.gg/across",
  logo: DiscordLogo,
};
const TWITTER_LINK = {
  name: "Twitter",
  url: "https://twitter.com/across_io",
};

const About: FC = () => {
  return (
    <Wrapper>
      <HeroBg>
        <HeroHeader>
          Instantly Send Assets from Layer 2 Rollups to Ethereum
        </HeroHeader>
      </HeroBg>
      <Body>
        <Bullet>
          <Image src={BulletImg} alt="across_logo" />
          <TextWrapper>
            <BulletHeader>Instantaneous Liquidity</BulletHeader>
            <BulletText>
              Assets are bridged and available for use on mainnet almost
              instantly.
            </BulletText>
          </TextWrapper>
        </Bullet>
        <Bullet>
          <Image src={BulletImg} alt="across_logo" />
          <TextWrapper>
            <BulletHeader>Secure</BulletHeader>
            <BulletText>
              Powered By UMA protocol. Transfers are secured by UMA's Optimistic
              Oracle, which is audited by OpenZeppelin and trusted by top teams
              to protect hundreds of millions of dollars in value.
            </BulletText>
          </TextWrapper>
        </Bullet>
        <Bullet>
          <Image src={BulletImg} alt="across_logo" />
          <TextWrapper>
            <BulletHeader>Cheap</BulletHeader>
            <BulletText>
              Relayers and liquidity providers are compensated with fees from
              users initiating transfers, but this fee is less than any other
              solution on the market.
            </BulletText>
            <Link
              href="https://across.gitbook.io/bridge/"
              target="_blank"
              rel="noreferrer"
            >
              Read more
            </Link>
          </TextWrapper>
        </Bullet>
      </Body>
      <Footer>
        {NAV_LINKS.map((link) => (
          <FooterLink
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.name}
          </FooterLink>
        ))}
        <FooterLink
          href={DISCORD_LINK.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <DiscordLogo />
        </FooterLink>
        <FooterLink
          href={TWITTER_LINK.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <TwitterLogo />
        </FooterLink>

        <UmaLink
          href="https://umaproject.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <PoweredByUMA />
        </UmaLink>
      </Footer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  --horinzontal-padding: 75px;
  --heroHeight: 240px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 var(--horinzontal-padding);
`;
const HeroBg = styled.div`
  flex-basis: var(--heroHeight);
  background-image: url(${heroBg});
  background-size: cover;
  background-repeat: no-repeat;
  padding: 0 var(--horinzontal-padding);
  margin: 0 calc(-1 * var(--horinzontal-padding));
  display: flex;
  align-items: center;
  min-height: var(--heroHeight);
`;

const HeroHeader = styled.h1`
  color: var(--color-primary);
  font-size: ${56 / 16}rem;
  font-weight: 700;
  line-height: 1.28;
  max-width: 1000px;
`;

const Body = styled.section`
  flex: 1;
  padding: 55px 0 65px;
`;

const Link = styled.a`
  display: inline-block;
  font-size: ${14 / 16}rem;
  margin-top: 20px;
  text-decoration: underline;
  color: var(--color-primary);
  transition: color 100ms linear;
  &:hover {
    cursor: pointer;
    color: var(--color-primary-transparent);
  }
`;

const Bullet = styled.article`
  display: flex;
  align-items: flex-start;
  &:not(:first-of-type) {
    margin-top: 64px;
  }
`;

const Image = styled.img`
  height: 35px;
  width: 35px;
  object-fit: cover;
  margin-right: 45px;
`;

const TextWrapper = styled.div``;

const BulletText = styled.p`
  max-width: 65ch;
`;

const BulletHeader = styled.h4`
  font-size: ${30 / 16}rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 14px;
  transform: translateY(-5px);
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  margin-top: auto;
  padding: 35px 0;
  color: hsla(${COLORS.white} / 0.5);
  border-top: 1px solid currentColor;
`;

const FooterLink = styled.a`
  color: inherit;
  text-decoration: none;
  transition: color 100ms linear;

  & svg {
    width: 25px;
    height: 25px;
    & path {
      fill: currentColor;
    }
  }

  &:not(:last-of-type) {
    margin-right: 45px;
  }

  &:hover {
    color: var(--color-white);
  }
`;

const UmaLink = styled(FooterLink)`
  margin-left: auto;
  & svg {
    width: revert;
    height: 15px;
    & path {
      fill: currentColor;
    }
  }
  &:hover {
    color: var(--color-uma-red);
  }
`;

const PoweredByUMA = styled(UnstyledUmaLogo)`
  fill: currentColor;

  transition: fill linear 100ms;
  & path {
    fill: currentColor;
  }
`;

export default About;
