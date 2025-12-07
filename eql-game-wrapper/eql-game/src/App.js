import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import WrapperFooter from './components/WrapperFooter';
import * as eqlApi from './api/eqlApi';

function App() {
    const [balance, setBalance] = useState(10000);
    const [wrapperVisible, setWrapperVisible] = useState(true);
    const [currencyCode] = useState('USD');
    const [currencySymbol] = useState('$');
    const [languageCode] = useState('en-US');
    const [playMode] = useState('DEMO');
    const iframeRef = useRef(null);

    // Format currency based on locale
    const formatCurrency = (amount) => {
        return (amount / 100).toFixed(2);
    };

    // Expose EQL API to the game iframe
    useEffect(() => {
        // Create EQL API object
        window.EQL = {
            // Core Functions
            Wager: async (amount, callback, lines = 1, playbackData = null) => {
                try {
                    const result = await eqlApi.wager(amount, lines, playbackData);
                    setBalance(eqlApi.getBalance());
                    if (callback) callback(result);
                    return result;
                } catch (error) {
                    console.error('Wager error:', error);
                    if (callback) callback({ error: error.message });
                    throw error;
                }
            },

            Update: async (transactionId, data, callback) => {
                try {
                    const result = await eqlApi.update(transactionId, data);
                    if (callback) callback(result);
                    return result;
                } catch (error) {
                    console.error('Update error:', error);
                    if (callback) callback({ error: error.message });
                    throw error;
                }
            },

            Settle: async (tickets, callback) => {
                try {
                    const result = await eqlApi.settle(tickets);
                    setBalance(eqlApi.getBalance());
                    if (callback) callback(result);
                    return result;
                } catch (error) {
                    console.error('Settle error:', error);
                    if (callback) callback({ error: error.message });
                    throw error;
                }
            },

            GetPlaybackData: () => {
                // Return playback data for current transaction
                return null; // Implement as needed
            },

            GetBonusRounds: () => {
                // Return bonus rounds array
                return [];
            },

            // Helper Functions
            GetBalance: () => {
                return eqlApi.getBalance();
            },

            GetWins: () => {
                return eqlApi.getWins();
            },

            GetCost: () => {
                return eqlApi.getCost();
            },

            GetTime: () => {
                return Date.now();
            },

            GetCurrencyCode: () => {
                return currencyCode;
            },

            GetCurrencySymbol: () => {
                return currencySymbol;
            },

            GetPlayMode: () => {
                return playMode;
            },

            GetAccessibilityMode: () => {
                return false;
            },

            GetLanguageCode: () => {
                return languageCode;
            },

            GetWrapperVersion: () => {
                return '1.0.0';
            },

            GetDisplaySize: () => {
                const iframe = iframeRef.current;
                if (iframe) {
                    return {
                        width: iframe.clientWidth,
                        height: iframe.clientHeight
                    };
                }
                return { width: 0, height: 0 };
            },

            GetWrapperSize: () => {
                return { width: window.innerWidth, height: 60 };
            },

            FormatCurrency: (amount) => {
                return formatCurrency(amount);
            },

            ShowWrapper: () => {
                setWrapperVisible(true);
            },

            HideWrapper: () => {
                setWrapperVisible(false);
            },

            ShowInfo: (info) => {
                alert(`${info.title}\n\n${info.content}`);
            }
        };

        console.log('EQL API initialized');
    }, [currencyCode, currencySymbol, languageCode, playMode]);

    // Determine content URL based on mock mode
    const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
    const contentUrl = USE_MOCK
        ? (process.env.REACT_APP_MOCK_CONTENT_URL || 'http://localhost:3000/game/SLOTDEMO/index.html')
        : (process.env.REACT_APP_CONTENT_URL || 'http://localhost:3000/game/SLOTDEMO/index.html');

    return (
        <div className="App">
            <div className="game-container">
                <iframe
                    ref={iframeRef}
                    src={contentUrl}
                    title="Game Content"
                    className="game-iframe"
                    allow="autoplay"
                />
            </div>
            <WrapperFooter
                balance={balance}
                currencySymbol={currencySymbol}
                formatCurrency={formatCurrency}
                visible={wrapperVisible}
            />
        </div>
    );
}

export default App;
