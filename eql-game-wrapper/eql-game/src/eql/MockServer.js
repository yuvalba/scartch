// Mock Server Logic
// Simulates backend behavior for EQL Wrapper

class MockServer {
    constructor() {
        this.prizetable = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        try {
            const response = await fetch('/prizetable.json');
            this.prizetable = await response.json();
            this.isInitialized = true;
            console.log('Mock Server Initialized with Prizetable:', this.prizetable);
        } catch (error) {
            console.error('Failed to load prizetable:', error);
        }
    }

    // Simulate Wager
    // Returns a ticket with a scenario based on weights in prizetable
    async wager(amount, count = 1) {
        if (!this.isInitialized) await this.initialize();

        if (!this.prizetable || this.prizetable.length === 0) {
            throw new Error('Prizetable not loaded or empty');
        }

        // Calculate total weight
        const totalWeight = this.prizetable.reduce((sum, prize) => sum + prize.n, 0);

        // Random selection based on weight
        let random = Math.random() * totalWeight;
        let selectedPrize = null;

        for (const prize of this.prizetable) {
            random -= prize.n;
            if (random <= 0) {
                selectedPrize = prize;
                break;
            }
        }

        // Fallback if something goes wrong (shouldn't happen with correct math)
        if (!selectedPrize) selectedPrize = this.prizetable[0];

        // Select a random scenario from the prize
        const scenarioIndex = Math.floor(Math.random() * selectedPrize.scenarios.length);
        const scenarioData = selectedPrize.scenarios[scenarioIndex];

        // Construct response similar to what a real server might return
        // The structure here is an assumption based on typical EQL responses or just generic
        return {
            id: Date.now().toString(),
            wager: amount,
            won: selectedPrize.win,
            scenario: scenarioData.scenario,
            status: 'active' // Game round active
        };
    }

    // Simulate Settle
    async settle(ticketId) {
        // In a real server, this would validate the game result
        // Here we just acknowledge it
        return {
            id: ticketId,
            status: 'settled',
            timestamp: new Date().toISOString()
        };
    }
}

export const mockServer = new MockServer();
