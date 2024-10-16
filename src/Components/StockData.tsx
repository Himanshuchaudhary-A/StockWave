import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import connection from '../signalRService.js'; 

const StockData: React.FC = () => {
    const [stocks, setStocks] = useState<any>({});
    const [connectionError, setConnectionError] = useState<string | null>(null);

    useEffect(() => {
        const startConnection = async () => {
            if (connection.state === signalR.HubConnectionState.Disconnected) {
                try {
                    await connection.start();
                    console.log('SignalR connected');

                    // Listener for stock price updates
                    connection.on('ReceiveStockUpdate', (stockSymbol, price) => {
                        setStocks(prevStocks => ({
                            ...prevStocks,
                            [stockSymbol]: price?.toFixed(2),
                        }));
                    });
                } catch (error) {
                    console.error('SignalR connection error: ', error);
                    setConnectionError('Unable to connect to the stock price service.');
                }
            } else {
                console.log('SignalR connection is already established or in another state.');
            }
        };

        // Function to handle connection delay
        const delayConnection = () => {
            const timer = setTimeout(() => {
                startConnection();
            }, 0); 

            return () => clearTimeout(timer); 
        };

        delayConnection();

        // Cleanup on component unmount
        return () => {
            const stopConnection = async () => {
                if (connection.state === signalR.HubConnectionState.Connected) {
                    try {
                        await connection.stop();
                        console.log('SignalR disconnected');
                    } catch (err) {
                        console.error('Error while stopping connection: ', err);
                    }
                }
            };

            connection.off('ReceiveStockUpdate'); 
            stopConnection();
        };
    }, []);

    return (
        <div>
            <h2>StockWave - Live Stock Ticker!</h2>
            {connectionError && <p style={{ color: 'red' }}>{connectionError}</p>}
            <ul>
                {Object.keys(stocks)?.length === 0 ? (
                    <li>{!connectionError ? 'Loading. Please Wait !!' : null}</li>
                ) : (
                    Object.keys(stocks)?.map(stockSymbol => (
                        <li key={stockSymbol} style={{'listStyle': 'none'}}>
                             {stockSymbol}: Rs {stocks?.[stockSymbol]}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default StockData;
