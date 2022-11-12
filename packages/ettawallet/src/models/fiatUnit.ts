import untypedFiatUnit from './fiatUnits.json';

export const FiatUnitSource = {
  CoinDesk: 'CoinDesk',
} as const;

const RateExtractors = {
  CoinDesk: async (ticker: string): Promise<number> => {
    let json;
    try {
      const res = await fetch(
        `https://api.coindesk.com/v1/bpi/currentprice/${ticker}.json`
      );
      json = await res.json();
    } catch (e: any) {
      throw new Error(`Could not update rate for ${ticker}: ${e.message}`);
    }
    let rate = json?.bpi?.[ticker]?.rate_float; // eslint-disable-line
    if (!rate)
      throw new Error(`Could not update rate for ${ticker}: data is wrong`);

    rate = Number(rate);
    if (!(rate >= 0))
      throw new Error(`Could not update rate for ${ticker}: data is wrong`);
    return rate;
  },
} as const;

type FiatUnit = {
  [key: string]: {
    endPointKey: string;
    symbol: string;
    locale: string;
    source: 'CoinDesk';
  };
};
export const FiatUnit = untypedFiatUnit as FiatUnit;

export async function getFiatRate(ticker: string): Promise<number> {
  return await RateExtractors[FiatUnit[ticker].source](ticker);
}
