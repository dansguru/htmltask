import React, { useState, useEffect } from 'react';
import { localize } from '@deriv-com/translations';
import { getAppId, getSocketURL } from '@/components/shared/utils/config/config';
import './styles.css';

const AnalysisTool: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [symbol, setSymbol] = useState('R_10');
    const [tickCount, setTickCount] = useState(1000);
    const [price, setPrice] = useState<number | null>(null);
    const [digitCounts, setDigitCounts] = useState<number[]>(Array(10).fill(0));
    const [evenCount, setEvenCount] = useState(0);
    const [oddCount, setOddCount] = useState(0);
    const [riseCount, setRiseCount] = useState(0);
    const [fallCount, setFallCount] = useState(0);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const app_id = getAppId();
        const server_url = getSocketURL();
        const socket_url = `wss://${server_url}/websockets/v3?app_id=${app_id}&l=EN&brand=deriv`;
        
        const websocket = new WebSocket(socket_url);
        setWs(websocket);

        websocket.onopen = () => {
            console.log('WebSocket connected');
            websocket.send(JSON.stringify({
                "ticks_history": symbol,
                "adjust_start_time": 1,
                "count": 100,
                "end": "latest",
                "start": 1,
                "style": "ticks",
                "req_id": 3000
            }));
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data) {
                const req_id = data.echo_req?.req_id;
                if (req_id === 3000) {
                    const history = data.history;
                    const prices = history.prices;
                    processPriceHistory(prices);
                } else if (req_id === 3001) {
                    const tick = data.tick;
                    if (tick) {
                        processTick(tick);
                    }
                }
            }
        };

        return () => {
            if (websocket) {
                websocket.close();
            }
        };
    }, [symbol]);

    const processPriceHistory = (prices: number[]) => {
        let prev = 0;
        const newDigitCounts = Array(10).fill(0);
        let newEvenCount = 0;
        let newOddCount = 0;
        let newRiseCount = 0;
        let newFallCount = 0;

        prices.forEach(price => {
            if (price > prev) {
                newRiseCount++;
            } else {
                newFallCount++;
            }
            prev = price;

            const priceStr = price.toString();
            const decimalPart = priceStr.split('.')[1];
            if (decimalPart) {
                const lastDigit = parseInt(decimalPart.slice(-1));
                if (!isNaN(lastDigit)) {
                    newDigitCounts[lastDigit]++;
                    if (lastDigit % 2 === 0) {
                        newEvenCount++;
                    } else {
                        newOddCount++;
                    }
                }
            }
        });

        setDigitCounts(newDigitCounts);
        setEvenCount(newEvenCount);
        setOddCount(newOddCount);
        setRiseCount(newRiseCount);
        setFallCount(newFallCount);
    };

    const processTick = (tick: any) => {
        setPrice(tick.quote);
        // Update counts based on new tick
        const priceStr = tick.quote.toString();
        const decimalPart = priceStr.split('.')[1];
        if (decimalPart) {
            const lastDigit = parseInt(decimalPart.slice(-1));
            if (!isNaN(lastDigit)) {
                const newDigitCounts = [...digitCounts];
                newDigitCounts[lastDigit]++;
                setDigitCounts(newDigitCounts);

                if (lastDigit % 2 === 0) {
                    setEvenCount(prev => prev + 1);
                } else {
                    setOddCount(prev => prev + 1);
                }
            }
        }
    };

    return (
        <div className="analysis-tool">
            <div className="top-bar">
                <select 
                    value={symbol} 
                    onChange={(e) => setSymbol(e.target.value)}
                >
                    <option value="R_10">Volatility 10 Index</option>
                    <option value="R_25">Volatility 25 Index</option>
                    <option value="R_50">Volatility 50 Index</option>
                    <option value="R_75">Volatility 75 Index</option>
                    <option value="R_100">Volatility 100 Index</option>
                </select>
                <input 
                    type="number" 
                    value={tickCount} 
                    onChange={(e) => setTickCount(parseInt(e.target.value))}
                    min="1"
                    max="10000"
                />
                <button onClick={() => setIsRunning(!isRunning)}>
                    {isRunning ? 'Stop' : 'Start'}
                </button>
                {price && <span className="price">{price}</span>}
            </div>

            <div className="grid-container">
                <div className="panel">
                    <h3>Digit Analysis</h3>
                    <div className="circle-grid">
                        {digitCounts.map((count, index) => (
                            <div 
                                key={index} 
                                className="circle"
                                data-value={((count / digitCounts.reduce((a, b) => a + b, 0)) * 100).toFixed(2)}
                            >
                                {index}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="panel">
                    <h3>Even/Odd Analysis</h3>
                    <div className="even-odd-bar">
                        <span>Even: {evenCount}</span>
                        <span>Odd: {oddCount}</span>
                    </div>
                    <div className="progress">
                        <div 
                            className="green" 
                            style={{ width: `${(evenCount / (evenCount + oddCount)) * 100}%` }}
                        />
                        <div 
                            className="red" 
                            style={{ width: `${(oddCount / (evenCount + oddCount)) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="panel">
                    <h3>Rise/Fall Analysis</h3>
                    <div className="rise-fall-bar">
                        <span>Rise: {riseCount}</span>
                        <span>Fall: {fallCount}</span>
                    </div>
                    <div className="progress">
                        <div 
                            className="green" 
                            style={{ width: `${(riseCount / (riseCount + fallCount)) * 100}%` }}
                        />
                        <div 
                            className="red" 
                            style={{ width: `${(fallCount / (riseCount + fallCount)) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisTool;
