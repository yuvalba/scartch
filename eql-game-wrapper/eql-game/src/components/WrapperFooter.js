import React from 'react';

const WrapperFooter = ({ balance, currencySymbol, formatCurrency, visible }) => {
    if (!visible) return null;

    const styles = {
        footer: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '60px',
            backgroundColor: '#1a1a1a',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            boxSizing: 'border-box',
            borderTop: '2px solid #333',
            zIndex: 1000
        },
        balance: {
            fontSize: '18px',
            fontWeight: 'bold'
        },
        logo: {
            fontSize: '20px',
            fontWeight: '900',
            color: '#61dafb'
        }
    };

    return (
        <div style={styles.footer}>
            <div style={styles.logo}>EQL WRAPPER</div>
            <div style={styles.balance}>
                Balance: {currencySymbol}{formatCurrency(balance)}
            </div>
        </div>
    );
};

export default WrapperFooter;
