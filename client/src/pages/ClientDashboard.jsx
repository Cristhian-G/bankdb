import React, { useEffect, useState } from 'react';

export default function ClientDashboard({ user, onLogout }) {
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [insurances, setInsurances] = useState([]);
    const [accSelected, setAccSelection] = useState(null);

    // Estados para Modals y Menú
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    // Estado para Solicitud de Préstamo
    const [loanAmount, setLoanAmount] = useState(0);
    const [loanTerm, setLoanTerm] = useState(12);

    // Estado para Nueva Transacción
    const [transactionType, setTransactionType] = useState('DEPOSITO');
    const [transactionAmount, setTransactionAmount] = useState(0);
    const [descTrn, setDescTrn] = useState('');
    const [idAccTrn, setIdAccTrn] = useState('');

    // Estado para Abrir Nueva Cuenta
    const [newAccType, setNewAccType] = useState('Ahorro');
    const [newAccCurrency, setNewAccCurrency] = useState('MXN');

    // Estado para Contratar Seguro
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [insuranceType, setInsuranceType] = useState('Vida');
    const [insurancePremium, setInsurancePremium] = useState('');
    const [insuranceBeneficiary, setInsuranceBeneficiary] = useState('');

    // Función para refrescar datos de cuentas y movimientos
    const refreshData = () => {
        if (user && user.client_id) {
            fetch(`http://localhost:3000/api/accounts/usuario/${user.client_id}`)
                .then(res => res.json())
                .then(data => {
                    setAccounts(data);
                    // Si la cuenta seleccionada sigue existiendo, actualizarla, si no, seleccionar la primera
                    if (accSelected) {
                        const updatedAccount = data.find(c => c.acc_id === accSelected.acc_id);
                        if (updatedAccount) {
                            setAccSelection(updatedAccount);
                            setIdAccTrn(updatedAccount.acc_id); // Asegurar que el ID de transacción también se actualice
                            // Refrescar movimientos también
                            fetch(`http://localhost:3000/api/accounts/${updatedAccount.acc_id}/movimientos`)
                                .then(res => res.json())
                                .then(movs => setTransactions(movs));
                        } else if (data.length > 0) {
                            setAccSelection(data[0]);
                            setIdAccTrn(data[0].acc_id);
                        } else {
                            setAccSelection(null);
                            setIdAccTrn('');
                            setTransactions([]);
                        }
                    } else if (data.length > 0) {
                        setAccSelection(data[0]);
                        setIdAccTrn(data[0].acc_id);
                    } else {
                        setAccSelection(null);
                        setIdAccTrn('');
                        setTransactions([]);
                    }
                })
                .catch(err => console.error("Error loading accounts:", err));

            // Cargar seguros
            fetch(`http://localhost:3000/api/insurance/user/${user.client_id}`)
                .then(res => res.json())
                .then(data => setInsurances(data))
                .catch(err => console.error("Error loading insurances:", err));
        }
    };

    // 1. Al cargar, buscamos las cuentas de este usuario
    useEffect(() => {
        refreshData();
    }, [user]);

    // 2. Cada vez que cambiamos de cuenta, buscamos sus movimientos
    useEffect(() => {
        if (accSelected) {
            fetch(`http://localhost:3000/api/accounts/${accSelected.acc_id}/movimientos`)
                .then(res => res.json())
                .then(data => setTransactions(data))
                .catch(err => console.error("Error loading transactions:", err));
        } else {
            setTransactions([]); // Limpiar movimientos si no hay cuenta seleccionada
        }
    }, [accSelected]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Barra Superior */}
            <nav className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-lg relative z-20">
                <div>
                    <h1 className="text-2xl font-bold">DB Financial</h1>
                    <p className="text-sm opacity-80">Welcome, {user?.name}</p>
                </div>

                {/* Menú Desplegable */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2 transition font-bold"
                    >
                        <span>Menu</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-2 text-gray-800 z-30">
                            <button
                                onClick={() => { setIsLoanModalOpen(true); setIsMenuOpen(false); }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                            >
                                💰 Request Loan
                            </button>
                            <button
                                onClick={() => { setIsTransactionModalOpen(true); setIsMenuOpen(false); }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                            >
                                🏧 Add Transaction
                            </button>
                            <button
                                onClick={() => { setIsAccountModalOpen(true); setIsMenuOpen(false); }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                            >
                                💳 Open New Account
                            </button>
                            <button
                                onClick={() => { setIsInsuranceModalOpen(true); setIsMenuOpen(false); }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                            >
                                🛡️ Contract Insurance
                            </button>
                            <div className="border-t my-1"></div>
                            <button
                                onClick={onLogout}
                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition font-bold"
                            >
                                🚪 End Session
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Columna Izquierda: Mis Cuentas */}
                <div className="md:col-span-1 space-y-4">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">My Accounts</h2>
                    {accounts.map(cuenta => (
                        <div
                            key={cuenta.acc_id}
                            onClick={() => setAccSelection(cuenta)}
                            className={`p-6 rounded-xl shadow-md cursor-pointer transition transform hover:scale-105 border-l-4 ${accSelected?.acc_id === cuenta.acc_id
                                ? 'bg-white border-blue-500 ring-2 ring-blue-100'
                                : 'bg-white border-transparent opacity-80'
                                }`}
                        >
                            <p className="text-gray-500 text-sm uppercase font-bold tracking-wider">{cuenta.acc_type}</p>
                            <p className="text-3xl font-bold text-gray-800 my-2">${cuenta.balance}</p>
                            <p className="text-gray-400 text-xs">Account: ****{cuenta.acc_id}</p>
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                                {cuenta.currency}
                            </span>
                        </div>
                    ))}

                    {accounts.length === 0 && (
                        <p className="text-gray-500 italic">No tienes cuentas activas.</p>
                    )}

                    <h2 className="text-xl font-bold text-gray-700 mt-8 mb-4">My Insurances</h2>
                    {insurances.map(seguro => (
                        <div key={seguro.ins_id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-800">{seguro.ins_type}</p>
                                <p className="text-xs text-gray-500">Beneficiary: {seguro.beneficiary}</p>
                            </div>
                            <span className="text-green-600 font-bold text-sm">${seguro.premium}</span>
                        </div>
                    ))}
                    {insurances.length === 0 && (
                        <p className="text-gray-500 italic text-sm">No tienes seguros contratados.</p>
                    )}
                </div>

                {/* Columna Derecha: Historial de Movimientos */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                            Recent Transactions
                            {accSelected && <span className="text-base font-normal text-gray-500 ml-2">(Account #{accSelected.acc_id})</span>}
                        </h2>

                        <div className="space-y-4">
                            {transactions.length > 0 ? (
                                transactions.map(mov => (
                                    <div key={mov.trn_id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg border-b border-gray-100 transition">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-3 rounded-full ${mov.trn_type === 'DEPOSITO' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {/* Icono simple dependiendo del tipo */}
                                                {mov.trn_type === 'DEPOSITO' ? '⬇' : '⬆'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{mov.description || 'Transferencia'}</p>
                                                <p className="text-xs text-gray-500">{new Date(mov.date_time).toLocaleDateString()} • {mov.trn_type}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold text-lg ${mov.trn_type === 'DEPOSITO' ? 'text-green-600' : 'text-gray-800'}`}>
                                            {mov.trn_type === 'DEPOSITO' ? '+' : '-'}${mov.amount}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    Select an account to view its transactions or there is no history available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* Modal: Request Credit */}
            {isLoanModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Request Credit</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Amount</label>
                                <input
                                    type="number"
                                    className="border rounded p-2 w-full"
                                    placeholder="Ej. 5000"
                                    onChange={(e) => setLoanAmount(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Plazo (Meses)</label>
                                <select
                                    className="border rounded p-2 w-full"
                                    onChange={(e) => setLoanTerm(e.target.value)}
                                    value={loanTerm}
                                >
                                    <option value="6">6 Meses</option>
                                    <option value="12">12 Meses</option>
                                    <option value="24">24 Meses</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setIsLoanModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                                <button
                                    onClick={() => {
                                        fetch('http://localhost:3000/api/loans/solicitar', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ client_id: user.client_id, amount: loanAmount, months: loanTerm })
                                        })
                                            .then(res => res.json())
                                            .then(data => { alert(data.message); setIsLoanModalOpen(false); })
                                            .catch(err => console.error(err));
                                    }}
                                    className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Make a Transaction */}
            {isTransactionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Make a Transaction</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Account</label>
                                <select
                                    className="border rounded p-2 w-full"
                                    value={idAccTrn}
                                    onChange={(e) => setIdAccTrn(e.target.value)}
                                >
                                    {accounts.map(c => (
                                        <option key={c.acc_id} value={c.acc_id}>
                                            {c.acc_type} - ${c.balance} ({c.currency})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                                    <select
                                        className="border rounded p-2 w-full"
                                        value={transactionType}
                                        onChange={(e) => setTransactionType(e.target.value)}
                                    >
                                        <option value="DEPOSIT">Deposit (+)</option>
                                        <option value="WITHDRAW">Withdraw (-)</option>
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Amount</label>
                                    <input
                                        type="number"
                                        className="border rounded p-2 w-full"
                                        placeholder="0.00"
                                        onChange={(e) => setTransactionAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                                <input
                                    type="text"
                                    className="border rounded p-2 w-full"
                                    placeholder="Purchase..."
                                    onChange={(e) => setDescTransaccion(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setIsTransactionModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                                <button
                                    onClick={() => {
                                        if (!idAccTrn) return alert("Select an account");
                                        fetch('http://localhost:3000/api/accounts/transaction', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ acc_id: idAccTrn, type: transactionType, amount: transactionAmount, description: descTrn })
                                        })
                                            .then(res => {
                                                if (!res.ok) return res.json().then(err => { throw new Error(err.message) });
                                                return res.json();
                                            })
                                            .then(data => {
                                                alert(data.message);
                                                setIsTransactionModalOpen(false);
                                                refreshData();
                                            })
                                            .catch(err => alert("Error in transaction: " + err.message));
                                    }}
                                    className="bg-purple-600 text-white font-bold px-4 py-2 rounded hover:bg-purple-700"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Abrir Cuenta */}
            {isAccountModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Open New Account</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Account Type</label>
                                <select
                                    className="border rounded p-2 w-full"
                                    value={newAccType}
                                    onChange={(e) => setNewAccType(e.target.value)}
                                >
                                    <option value="Savings">Savings</option>
                                    <option value="Current">Current</option>
                                    <option value="Investment">Investment</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Currency</label>
                                <select
                                    className="border rounded p-2 w-full"
                                    value={currencyNewAccount}
                                    onChange={(e) => setCurrencyNewAccount(e.target.value)}
                                >
                                    <option value="MXN">Mexican Pesos (MXN)</option>
                                    <option value="USD">US Dollars (USD)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setIsAccountModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                                <button
                                    onClick={() => {
                                        fetch('http://localhost:3000/api/accounts/create', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ client_id: user.client_id, acc_type: newAccType, currency: currencyNewAccount })
                                        })
                                            .then(res => res.json())
                                            .then(data => {
                                                alert(data.message);
                                                if (data.success) {
                                                    setIsAccountModalOpen(false);
                                                    refreshData();
                                                }
                                            })
                                            .catch(err => alert("Error: " + err.message));
                                    }}
                                    className="bg-green-600 text-white font-bold px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Contratar Seguro */}
            {isInsuranceModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Contract Insurance</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Type of Insurance</label>
                                <select
                                    className="border rounded p-2 w-full"
                                    value={insuranceType}
                                    onChange={(e) => setInsuranceType(e.target.value)}
                                >
                                    <option value="Life">Life Insurance</option>
                                    <option value="Auto">Auto Insurance</option>
                                    <option value="Home">Home Insurance</option>
                                    <option value="Medical">Medical Insurance</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Prima Anual</label>
                                <input
                                    type="number"
                                    className="border rounded p-2 w-full"
                                    placeholder="Ej. 5000"
                                    value={annualPremium}
                                    onChange={(e) => setAnnualPremium(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Beneficiary</label>
                                <input
                                    type="text"
                                    className="border rounded p-2 w-full"
                                    placeholder="Full name"
                                    value={beneficiaryInsurance}
                                    onChange={(e) => setBeneficiaryInsurance(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setIsInsuranceModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                                <button
                                    onClick={() => {
                                        if (!primaSeguro || !beneficiarioSeguro) return alert("Todos los campos son obligatorios");
                                        fetch('http://localhost:3000/api/insurance/contract', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                client_id: user.client_id,
                                                ins_type: tipoSeguro,
                                                premium: primaSeguro,
                                                beneficiary: beneficiarioSeguro
                                            })
                                        })
                                            .then(res => res.json())
                                            .then(data => {
                                                alert(data.message);
                                                if (data.success) {
                                                    setIsInsuranceModalOpen(false);
                                                    setPrimaSeguro('');
                                                    setBeneficiarioSeguro('');
                                                }
                                            })
                                            .catch(err => alert("Error: " + err.message));
                                    }}
                                    className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Contratar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}