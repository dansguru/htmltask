export interface TradeHistory {
    time: string;
    asset: string;
    stake: number;
    payout: number;
    status: 'won' | 'lost';
  }
  
  export interface DigitStats {
    digit: number;
    count: number;
    percentage: number;
  }
  
  export type ContractType = 'DIGITOVER' | 'DIGITUNDER' | 'DIGITODD' | 'DIGITEVEN' | 'CALL' | 'PUT';