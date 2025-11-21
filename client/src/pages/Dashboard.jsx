import React, { useEffect, useState } from 'react';

export default function Dashboard() {
    const [prestamos, setPrestamos] = useState([]);

    // Al cargar la página, pedimos los datos al Backend
    useEffect(() => {
        fetch('http://localhost:3000/api/loans/pending')
            .then(res => res.json())
            .then(data => setLoans(data))
            .catch(err => console.error("Error cargando datos:", err));
    }, []);

    const handleAprobar = (id) => {
        // Aquí llamaríamos al endpoint POST /aprobar
        // Por ahora solo lo quitamos de la lista visualmente
        alert(`Aprobando préstamo ${id}...`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-blue-900">Panel de Empleados</h1>
                <p className="text-gray-600">Gestión de solicitudes pendientes</p>
            </header>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Monto Solicitado
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
                        {prestamos.map((prestamo) => (
                            <tr key={prestamo.id_prestamo}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <div className="flex items-center">
                                        <div className="ml-3">
                                            <p className="text-gray-900 whitespace-no-wrap font-bold">
                                                {prestamo.nombre_completo}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                        ${prestamo.monto_original}
                                    </p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                        <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                                        <span className="relative">{prestamo.plazo_meses} meses</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <button
                                        onClick={() => handleAprobar(prestamo.id_prestamo)}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                                        Aprobar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {prestamos.length === 0 && (
                    <div className="p-5 text-center text-gray-500">No hay solicitudes pendientes.</div>
                )}
            </div>
        </div>
    );
}