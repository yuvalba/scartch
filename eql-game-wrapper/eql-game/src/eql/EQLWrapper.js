
class EQLWrapper {
    constructor(targetWindow = window) {
        this.window = targetWindow;
        this.balance = 0; // Will be updated from server/local storage if needed, or just tracked locally for now
        this.wins = 0;
        this.cost = 0;
        this.currencyCode = 'USD';
        this.currencySymbol = '$';
        this.playMode = 'DEMO';
        this.languageCode = 'en-US';
        this.wrapperVersion = '1.0.0';
        this.playbackData = null;
        this.bonusRounds = [];
        this.apiUrl = process.env.REACT_APP_API_URL || 'https://api.eql.games/api/v1';

        // Bind methods
        this.Wager = this.Wager.bind(this);
        this.Update = this.Update.bind(this);
        this.Settle = this.Settle.bind(this);
        this.GetPlaybackData = this.GetPlaybackData.bind(this);
        this.GetBonusRounds = this.GetBonusRounds.bind(this);
        this.GetBalance = this.GetBalance.bind(this);
        this.GetWins = this.GetWins.bind(this);
        this.GetCost = this.GetCost.bind(this);
        this.GetTime = this.GetTime.bind(this);
        this.GetCurrencyCode = this.GetCurrencyCode.bind(this);
        this.GetCurrencySymbol = this.GetCurrencySymbol.bind(this);
        this.GetPlayMode = this.GetPlayMode.bind(this);
        this.GetAccessibilityMode = this.GetAccessibilityMode.bind(this);
        this.GetLanguageCode = this.GetLanguageCode.bind(this);
        this.GetWrapperVersion = this.GetWrapperVersion.bind(this);
        this.GetDisplaySize = this.GetDisplaySize.bind(this);
        this.GetWrapperSize = this.GetWrapperSize.bind(this);
        this.FormatCurrency = this.FormatCurrency.bind(this);
        this.ShowWrapper = this.ShowWrapper.bind(this);
        this.HideWrapper = this.HideWrapper.bind(this);
        this.ShowInfo = this.ShowInfo.bind(this);

        // Inject into target window
        this.window.EQL = this;
        console.log('[EQL] Wrapper initialized on target window');
    }

    // Core Functions

    async Wager(amount, callback, lines = 1, playbackData = null) {
        console.log(`[EQL] Wager: ${amount}, lines: ${lines}`);

        // In a real implementation, we would POST to the API
        // For now, we'll simulate the API call structure as if we were calling it
        // but since we don't have a real backend, we might fail or need to mock it *inside* the fetch if we want to test "real" behavior without a server.
        // However, the user asked to "use the window of the eql wrapper" and "get answers from their servers".
        // If the user provided a real URL, we should try to hit it.
        // But `https://api.eql.games/api/v1` might not be accessible or require auth tokens we don't have.
        // The user said "mock the API/server logic for local development" in the previous turn, but now provided documentation and said "get answers from their servers" in the prompt "I want ot to use this document ... and get answers from their servers".
        // This suggests they might want real calls.

        try {
            const response = await fetch(`${this.apiUrl}/wager`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer ...' // We don't have a token mechanism yet
                },
                body: JSON.stringify({
                    amount: amount,
                    lines: lines,
                    playbackData: playbackData
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const result = await response.json();

            // Update local state based on result
            // Assuming result contains updated balance, etc.
            if (result.balance !== undefined) this.balance = result.balance;
            this.cost += amount;

            if (callback) callback(result);

        } catch (error) {
            console.error('[EQL] Wager failed:', error);
            // Fallback for demo/local if API fails (optional, but good for dev)
            // For now, report error as requested
            if (callback) callback({ error: error.message });
        }
    }

    async Update(transactionId, data, callback) {
        console.log(`[EQL] Update transaction: ${transactionId}`);
        try {
            const response = await fetch(`${this.apiUrl}/transaction/${transactionId}`, {
                method: 'PUT', // or POST/PATCH depending on API
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const result = await response.json();
            if (callback) callback(result);
            return result;
        } catch (error) {
            console.error('[EQL] Update failed:', error);
            if (callback) callback({ error: error.message });
        }
    }

    async Settle(tickets, callback) {
        console.log('[EQL] Settle tickets:', tickets);
        try {
            const response = await fetch(`${this.apiUrl}/settle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tickets })
            });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const result = await response.json();

            if (result.totalWin) this.wins += result.totalWin;
            if (result.balance) this.balance = result.balance;

            if (callback) callback(result);
        } catch (error) {
            console.error('[EQL] Settle failed:', error);
            if (callback) callback({ error: error.message });
        }
    }

    GetPlaybackData() {
        return this.playbackData;
    }

    GetBonusRounds() {
        return this.bonusRounds;
    }

    // Helper Functions

    GetBalance() {
        return this.balance;
    }

    GetWins() {
        return this.wins;
    }

    GetCost() {
        return this.cost;
    }

    GetTime() {
        return Date.now();
    }

    GetCurrencyCode() {
        return this.currencyCode;
    }

    GetCurrencySymbol() {
        return this.currencySymbol;
    }

    GetPlayMode() {
        return this.playMode;
    }

    GetAccessibilityMode() {
        return 'standard'; // Or fetch from config/window
    }

    GetLanguageCode() {
        return this.languageCode;
    }

    GetWrapperVersion() {
        return this.wrapperVersion;
    }

    GetDisplaySize() {
        return {
            width: this.window.innerWidth,
            height: this.window.innerHeight
        };
    }

    GetWrapperSize() {
        // Assuming a fixed footer size or measuring a specific element if it existed
        return { width: this.window.innerWidth, height: 50 };
    }

    FormatCurrency(amount) {
        return new Intl.NumberFormat(this.languageCode, {
            style: 'currency',
            currency: this.currencyCode
        }).format(amount / 100);
    }

    ShowWrapper() {
        console.log('[EQL] ShowWrapper');
        // Implementation depends on UI injection, maybe send message to parent?
    }

    HideWrapper() {
        console.log('[EQL] HideWrapper');
    }

    ShowInfo(info) {
        console.log('[EQL] ShowInfo:', info);
        this.window.alert(`${info.title}: ${info.content}`);
    }
}

// Export a function to initialize, or the class itself
export default EQLWrapper;

// Auto-initialize on current window if not already done, 
// but allow re-initialization with a different window.
export const eql = new EQLWrapper(window);
