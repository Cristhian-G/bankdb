const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/usuario/:client_id', async (req, res) => {
    const { client_id } = req.params;
    try {
        const [accounts] = await db.query(
            'SELECT * FROM account WHERE client_id = ?',
            [client_id]
        );
        res.json(accounts);
    } catch (error) {
        console.error('Error getting accounts:', error);
        res.status(500).json({ error: 'Error getting accounts' });
    }
});

router.get('/:acc_id/transactions', async (req, res) => {
    const { acc_id } = req.params;
    try {
        const [transactions] = await db.query(
            'SELECT * FROM transactions WHERE acc_id = ? ORDER BY date_time DESC LIMIT 10',
            [acc_id]
        );
        res.json(transactions);
    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).json({ error: 'Error getting transactions' });
    }
});

// Obtener tarjetas de una cuenta especifica
router.get('/:acc_id/cards', async (req, res) => {
    const { acc_id } = req.params;
    const [cards] = await db.query('SELECT * FROM card WHERE acc_id = ?', [acc_id]);
    res.json(cards);
});

// Crear nueva transacción (Depósito o Retiro)
router.post('/transaction', async (req, res) => {
    const { acc_id, type, amount, description } = req.body;

    if (!acc_id || !type || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid data" });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Verificar saldo si es retiro
        if (type === 'WITHDRAW') {
            const [accounts] = await connection.query('SELECT balance FROM account WHERE acc_id = ?', [acc_id]);
            if (accounts.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: "Account not found" });
            }
            if (accounts[0].balance < amount) {
                await connection.rollback();
                return res.status(400).json({ message: "Insufficient funds" });
            }
        }

        // 2. Update balance
        const operator = type === 'DEPOSIT' ? '+' : '-';
        await connection.query(`UPDATE account SET balance = balance ${operator} ? WHERE acc_id = ?`, [amount, acc_id]);

        // 3. Register transaction
        await connection.query(
            'INSERT INTO transactions (acc_id, trn_type, description, date_time, amount) VALUES (?, ?, ?, ?, ?)',
            [acc_id, type, description || (type === 'DEPOSIT' ? 'Deposit in Branch' : 'Withdrawal'), new Date(), amount]
        );

        await connection.commit();
        res.json({ message: "Transaction successful" });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error in transaction:", error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// Transferencia entre cuentas
router.post('/transfer', async (req, res) => {
    const { origin_id, dest_id, amount } = req.body;

    if (!origin_id || !dest_id || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid transfer data" });
    }

    if (origin_id === dest_id) {
        return res.status(400).json({ message: "Cannot transfer to the same account" });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Check Origin Balance
        const [originAcc] = await connection.query('SELECT balance FROM account WHERE acc_id = ?', [origin_id]);
        if (originAcc.length === 0) throw new Error('Origin account not found');
        if (originAcc[0].balance < amount) throw new Error('Insufficient funds');

        // 2. Check Destination Account
        const [destAcc] = await connection.query('SELECT acc_id FROM account WHERE acc_id = ?', [dest_id]);
        if (destAcc.length === 0) throw new Error('Destination account not found');

        // 3. Deduct from Origin
        await connection.query('UPDATE account SET balance = balance - ? WHERE acc_id = ?', [amount, origin_id]);

        // 4. Add to Destination
        await connection.query('UPDATE account SET balance = balance + ? WHERE acc_id = ?', [amount, dest_id]);

        // 5. Record Transactions
        const date = new Date();
        // Withdrawal for Origin
        await connection.query(
            'INSERT INTO transactions (acc_id, trn_type, description, date_time, amount) VALUES (?, ?, ?, ?, ?)',
            [origin_id, 'WITHDRAWAL', `Transfer to #${dest_id}`, date, amount]
        );
        // Deposit for Destination
        await connection.query(
            'INSERT INTO transactions (acc_id, trn_type, description, date_time, amount) VALUES (?, ?, ?, ?, ?)',
            [dest_id, 'DEPOSIT', `Transfer from #${origin_id}`, date, amount]
        );

        await connection.commit();
        res.json({ success: true, message: "Transfer successful" });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error in transfer:", error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// Crear nueva cuenta
router.post('/create', async (req, res) => {
    const { client_id, acc_type, currency } = req.body;

    if (!client_id || !acc_type || !currency) {
        return res.status(400).json({ message: "Missing required data" });
    }

    try {
        await db.query(
            'INSERT INTO account (client_id, balance, acc_type, currency, branch_id) VALUES (?, ?, ?, ?, ?)',
            [client_id, 0, acc_type, currency, 1]
        );
        res.json({ success: true, message: "Account created successfully" });
    } catch (error) {
        console.error("Error creating account:", error);
        res.status(500).json({ error: "Error creating account" });
    }
});

module.exports = router;
