import { useState, useEffect, useCallback } from 'react';
import { TradeHistory, ContractType } from '../types/types';
import { formatTime } from '../utils/helpers';

const useDerivApi = (symbol: string, tickCount: number, isRunning: boolean, stake: number, martingale: number) => {
  const [price, setPrice] = useState('0.00');
  const [digitCounts, setDigitCounts] = useState<number[]>(Array(10).fill(0));
  const [evenCount, setEvenCount] = useState(0);
  const [oddCount, setOddCount] = useState(0);
  const [riseCount, setRiseCount] = useState(0);
  const [fallCount, setFallCount] = useState(0);
  const [lastDigit, setLastDigit] = useState(0);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const connect = useCallback(() => {
    const tokens = localStorage.getItem('tokens');
    const tokensArray = tokens ? Object.values(JSON.parse(tokens)) : [];
    const loginid = localStorage.getItem('active_loginid');
    const APP_ID = localStorage.getItem('APP_ID') || 'default_app_id';

    const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        authorize: 'MULTI',
        tokens: tokensArray,
        req_id: 3111,
      }));
      ws.send(JSON.stringify({
        ticks_history: symbol,
        adjust_start_time: 1,
        count: tickCount,
        end: "latest",
        start: 1,
        style: "ticks",
        req_id: 3000,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        console.error(data.error);
        return;
      }
      if (data.tick) {
        const priceStr = data.tick.quote.toFixed(2);
        setPrice(priceStr);
        const newDigit = parseInt(priceStr.split('.')[1].slice(-1));
        setLastDigit(newDigit);
        updateDigitStats(newDigit);
      }
      if (data.proposal_open_contract) {
        updateTradeHistory(data.proposal_open_contract);
      }
    };

    setSocket(ws);
  }, [symbol, tickCount]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  }, [socket]);

  const updateDigitStats = (digit: number) => {
    setDigitCounts(prev => {
      const newCounts = [...prev];
      newCounts[digit]++;
      return newCounts;
    });
    setEvenCount(prev => digit % 2 === 0 ? prev + 1 : prev);
    setOddCount(prev => digit % 2 !== 0 ? prev + 1 : prev);
  };

  const updateTradeHistory = (contract: any) => {
    const newTrade: TradeHistory = {
      time: formatTime(contract.date_start),
      asset: contract.display_name,
      stake: contract.buy_price,
      payout: contract.profit,
      status: contract.profit > 0 ? 'won' : 'lost',
    };
    setTradeHistory(prev => [newTrade, ...prev]);
  };

  const openContract = useCallback((contractType: ContractType, barrier?: number) => {
    if (!socket || !isRunning) return;
    const loginid = localStorage.getItem('active_loginid');
    const params = {
      buy: 1,
      parameters: {
        amount: stake,
        ...(barrier && { barrier }),
        basis: "stake",
        contract_type: contractType,
        duration: 5,
        duration_unit: "t",
        symbol,
        currency: "USD",
      },
      price: stake,
      subscribe: 1,
      loginid,
      req_id: 3002,
    };
    socket.send(JSON.stringify(params));
  }, [socket, isRunning, stake, symbol]);

  return {
    price,
    digitCounts,
    evenCount,
    oddCount,
    riseCount,
    fallCount,
    lastDigit,
    tradeHistory,
    connect,
    disconnect,
    openContract,
  };
};

export default useDerivApi;