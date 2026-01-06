import { LBOAssumptions } from "./lbo";


export type MarketDataAssumptions = Pick<
    LBOAssumptions,
    "revenue" | "revenueGrowth" | "ebitdaMargin" | "taxRate"
>;

const MOCK_DB: Record<string, MarketDataAssumptions> = {
    ETFC: {
        revenue: 2840,
        revenueGrowth: 8.5,
        ebitdaMargin: 42.0, 
        taxRate: 21.0,
    },
    AAPL: {
        revenue: 383000,
        revenueGrowth: 5.0,
        ebitdaMargin: 30.0,
        taxRate: 15.0,
    },
    TSLA: {
        revenue: 96000,
        revenueGrowth: 20.0,
        ebitdaMargin: 15.0,
        taxRate: 21.0,
    },
};

export async function fetchTickerData(ticker: string): Promise<MarketDataAssumptions | null> {
    
    await new Promise((resolve) => setTimeout(resolve, 600));

    const upperTicker = ticker.toUpperCase();
    return MOCK_DB[upperTicker] || null;
}
