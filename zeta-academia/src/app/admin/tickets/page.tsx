'use client';

import React, { useState, useEffect } from 'react';
import CrudMenu from '@/components/crud-menu/CrudMenu';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

const TicketsPage: React.FC = () => {
    const [adminUsers, setAdminUsers] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        fetchAdminUsers();
    }, []);

    const fetchAdminUsers = async () => {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const admins = snapshot.docs
            .filter(doc => doc.data().role === 'admin')
            .map(doc => ({
                value: doc.id,
                label: doc.data().displayName || doc.data().email
            }));
        setAdminUsers(admins);
    };

    const displayFields = [
        { label: 'Título', field: 'title' },
        { label: 'Estado', field: 'status' },
        { label: 'Prioridad', field: 'priority' },
        { label: 'Enviado por', field: 'sentBy' },
    ];

    const editFields = [
        { label: 'Título', field: 'title', type: 'text' },
        { label: 'Descripción', field: 'description', type: 'textarea' },
        { label: 'Estado', field: 'status', type: 'select', selectType: 'combobox', options: [
            { value: 'abierto', label: 'Abierto' },
            { value: 'en_progreso', label: 'En Progreso' },
            { value: 'cerrado', label: 'Cerrado' },
        ]},
        { label: 'Prioridad', field: 'priority', type: 'select', selectType: 'combobox', options: [
            { value: 'baja', label: 'Baja' },
            { value: 'media', label: 'Media' },
            { value: 'alta', label: 'Alta' },
            { value: 'urgente', label: 'Urgente' },
        ]},
        { label: 'Asignado a', field: 'assignedTo', type: 'select', selectType: 'combobox', options: adminUsers },
        { label: 'Enviado por', field: 'sentBy', type: 'text' },
    ];

    return (
        <div>
            <h1>Gestión de Tickets</h1>
            <CrudMenu
                collectionName="tickets"
                displayFields={displayFields}
                editFields={editFields}
            />
        </div>
    );
};

export default TicketsPage;
