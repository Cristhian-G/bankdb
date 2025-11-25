import React, { useEffect, useState } from 'react';

export default function Dashboard() {
    const [loans, setLoans] = useState([]);

    const loadLoans = () => {
        fetch('http://localhost:3000/api/loans/pending')
            .then(res => {
                if (!res.ok) throw new Error('The service is not available');
                return res.json();
            })
            .then(data => {
                console.log("Data received:", data);
                if (Array.isArray(data)) {
                    setLoans(data);
                } else {
                    console.error("The data format is not an array:", data);
                    setLoans([]);
                }
            })
            .catch(err => console.error("Error loading data:", err));
    };

    useEffect(() => {
        loadLoans();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm("Are you sure you want to approve this loan?")) return;

        try {
            const response = await fetch(`http://localhost:3000/api/loans/approve/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) // No enviamos body extra por ahora
            });

            if (response.ok) {
                alert("¡Loan approved!");
                loadLoans(); // Recargamos la tabla para que desaparezca el aprobado
            } else {
                alert("Error approving loan");
            }
        } catch (error) {
            console.error("Error approving loan:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-blue-900">Bank - Admin Panel</h1>
                <p className="text-gray-600">Loan requests to approve</p>
            </header>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Monto (MXN)
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Plazo
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.map((p) => (
                            // OJO: Aquí usamos las keys que vienen de la nueva Query SQL
                            <tr key={p.loan_id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-gray-500">
                                    #{p.loan_id}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-bold text-gray-800">
                                    {p.nombre_completo}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-blue-600 font-bold">
                                    ${p.amount_org}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                        <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                                        <span className="relative">{p.month_term} months</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <button
                                        onClick={() => handleApprove(p.loan_id)}
                                        className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded transition duration-300 shadow-md">
                                        Approve
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {loans.length === 0 && (
                    <div className="p-10 text-center text-gray-500 text-lg">
                        ✅ No requests to approve.
                    </div>
                )}
            </div>
        </div>
    );
}