
import { mockServer } from '../eql/MockServer';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.eql.games/api/v1';
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

let balance = 10000; // Default starting balance (cents)
let wins = 0;
let cost = 0;

export const wager = async (amount, lines = 1, playbackData = null) => {
    console.log(`[API] Wager: ${amount}, lines: ${lines}`);

    // Optimistic update
    balance -= amount;
    cost += amount;

    if (USE_MOCK) {
        console.log('[API] Using Mock Server for Wager');
        try {
            const result = await mockServer.wager(amount, lines);
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            if (result.balance !== undefined) balance = result.balance;

            return result;
        } catch (error) {
            console.error('[API] Mock Wager failed:', error);
            throw error;
        }
    }

    try {
        const response = await fetch(`${API_URL}/wager`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, lines, playbackData })
        });

        if (!response.ok) {
            // Revert on failure if needed, or just throw
            throw new Error(`API Error: ${response.statusText}`);
        }

        const result = await response.json();

        // Sync state with server response if available
        if (result.balance !== undefined) balance = result.balance;

        return result;
    } catch (error) {
        console.error('[API] Wager failed:', error);
        // For now, re-throw so the UI knows it failed
        throw error;
    }
};

export const update = async (transactionId, data) => {
    console.log(`[API] Update: ${transactionId}`);

    if (USE_MOCK) {
        console.log('[API] Using Mock Server for Update');
        return { success: true };
    }

    try {
        const response = await fetch(`${API_URL}/transaction/${transactionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('[API] Update failed:', error);
        throw error;
    }
};

export const settle = async (tickets) => {
    console.log('[API] Settle:', tickets);

    if (USE_MOCK) {
        console.log('[API] Using Mock Server for Settle');
        try {
            const result = await mockServer.settle(tickets[0]);
            await new Promise(resolve => setTimeout(resolve, 500));

            if (result.totalWin) {
                wins += result.totalWin;
                balance += result.totalWin;
            }
            if (result.balance !== undefined) balance = result.balance;

            return result;
        } catch (error) {
            console.error('[API] Mock Settle failed:', error);
            throw error;
        }
    }

    try {
        const response = await fetch(`${API_URL}/settle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tickets })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

        const result = await response.json();

        if (result.totalWin) {
            wins += result.totalWin;
            balance += result.totalWin;
        }
        if (result.balance !== undefined) balance = result.balance;

        return result;
    } catch (error) {
        console.error('[API] Settle failed:', error);
        throw error;
    }
};

export const getBalance = () => balance;
export const getWins = () => wins;
export const getCost = () => cost;
