import React, { useState, useEffect } from 'react';
import '../eql/EQLWrapper'; // Ensure EQL is initialized

const Game = () => {
    const [balance, setBalance] = useState(0);
    const [grid, setGrid] = useState(Array(9).fill('?'));
    const [message, setMessage] = useState('Ready to Play');
    const [isSpinning, setIsSpinning] = useState(false);
    const [lastWin, setLastWin] = useState(0);

    useEffect(() => {
        // Initialize balance from EQL
        updateBalance();
    }, []);

    const updateBalance = () => {
        if (window.EQL) {
            setBalance(window.EQL.GetBalance());
        }
    };

    const handleSpin = () => {
        if (isSpinning) return;

        const wagerAmount = 100; // 1.00
        setIsSpinning(true);
        setMessage('Spinning...');
        setLastWin(0);

        window.EQL.Wager(wagerAmount, (result) => {
            if (result.error) {
                setMessage(`Error: ${result.error}`);
                setIsSpinning(false);
                return;
            }

            // Update balance immediately after wager deduction
            updateBalance();

            // Simulate animation delay
            setTimeout(() => {
                // Parse scenario to update grid
                // Scenario format example: "CDD,DBF,XCC,fDGX,WBC,EAX:f10|X2,X2,X0"
                // We need to map this to a 3x3 grid. 
                // For this example, let's just take the first 9 characters from the scenario string (ignoring commas/modifiers for simplicity)
                // OR just random symbols if the scenario format is complex to parse without specific game logic.
                // Let's try to parse the comma separated parts.

                const scenarioParts = result.scenario.split(':')[0].split(',');
                // We have 6 parts in the example scenarios, but we need 9 symbols for 3x3?
                // Actually the example scenarios like "CDD,DBF..." seem to be 3 chars per part.
                // Let's just flatten the first 3 parts to get 9 symbols if possible, or just display the raw scenario for debug.

                // Simple visualization: take the first 9 valid chars from the scenario string
                const cleanScenario = result.scenario.replace(/[^a-zA-Z]/g, '');
                const newGrid = cleanScenario.substring(0, 9).split('').map(c => c.toUpperCase());

                // Pad if not enough chars
                while (newGrid.length < 9) newGrid.push('?');

                setGrid(newGrid);

                // Settle the game
                const ticket = {
                    id: result.id,
                    won: result.won
                };

                window.EQL.Settle([ticket], (settleResult) => {
                    setIsSpinning(false);
                    if (result.won > 0) {
                        setMessage(`You Won ${window.EQL.FormatCurrency(result.won)}!`);
                        setLastWin(result.won);
                    } else {
                        setMessage('No Win. Try Again!');
                    }
                    updateBalance();
                });

            }, 1000); // 1 second animation
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>Balance: {window.EQL ? window.EQL.FormatCurrency(balance) : '$0.00'}</div>
                <div>Last Win: {window.EQL ? window.EQL.FormatCurrency(lastWin) : '$0.00'}</div>
            </div>

            <div style={styles.grid}>
                {grid.map((symbol, index) => (
                    <div key={index} style={styles.cell}>
                        {symbol}
                    </div>
                ))}
            </div>

            <div style={styles.controls}>
                <div style={styles.message}>{message}</div>
                <button
                    style={{ ...styles.button, opacity: isSpinning ? 0.5 : 1 }}
                    onClick={handleSpin}
                    disabled={isSpinning}
                >
                    {isSpinning ? 'Spinning...' : 'SPIN ($1.00)'}
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#282c34',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '300px',
        marginBottom: '20px',
        fontSize: '18px',
        fontWeight: 'bold'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 100px)',
        gridGap: '10px',
        marginBottom: '30px'
    },
    cell: {
        width: '100px',
        height: '100px',
        backgroundColor: '#fff',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        fontWeight: 'bold',
        borderRadius: '10px'
    },
    controls: {
        textAlign: 'center'
    },
    message: {
        marginBottom: '20px',
        fontSize: '20px',
        height: '30px'
    },
    button: {
        padding: '15px 40px',
        fontSize: '20px',
        backgroundColor: '#61dafb',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        color: '#282c34'
    }
};

export default Game;
