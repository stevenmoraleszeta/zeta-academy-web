"use client"; // Indica que este componente se ejecuta en el cliente

import { db } from '@/firebase/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import styles from './page.module.css';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import RequireAuth from '@/components/RequireAuth';
import useFetchData from '@/app/hooks/useFetchData';


//TODO debe modificiarse para que en lugar de un crud puedan visualizarse todos los usuarios registrados en la plataforma, su información y permita eliminar.
interface User {
    id: string;
    displayName: string;
    email: string;
    photoURL: string;
    role: string;
}

const AdminUsers: React.FC = () => {
    const users: User[] = useFetchData('users'); // Consulta a la colección 'users'
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [form, setForm] = useState<Omit<User, 'id'>>({
        displayName: '',
        email: '',
        photoURL: '',
        role: 'user',
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setForm(user);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            if (selectedUser) {
                // Actualizar usuario existente
                const userRef = doc(db, 'users', selectedUser.id);
                await updateDoc(userRef, form);
                console.log('Usuario actualizado:', form);
            } else {
                // Crear un nuevo usuario
                await addDoc(collection(db, 'users'), form);
                console.log('Usuario creado:', form);
            }
            resetForm();
        } catch (error) {
            console.error('Error al guardar el usuario:', error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const userRef = doc(db, 'users', userId);
            await deleteDoc(userRef);
            console.log('Usuario eliminado:', userId);
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
        }
    };

    const resetForm = () => {
        setSelectedUser(null);
        setForm({
            displayName: '',
            email: '',
            photoURL: '',
            role: 'user',
        });
    };

    return (
        <RequireAuth>
            <div className={styles.adminUsersContainer}>
                <h2>Gestión de Usuarios</h2>

                {/* Formulario de Creación/Edición */}
                <form className={styles.userForm} onSubmit={handleSubmit}>
                    <label htmlFor="displayName">Nombre del usuario</label>
                    <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={form.displayName}
                        onChange={handleInputChange}
                        required
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        required
                    />

                    <label htmlFor="photoURL">URL de la Foto</label>
                    <input
                        type="text"
                        id="photoURL"
                        name="photoURL"
                        value={form.photoURL}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="role">Rol</label>
                    <select
                        id="role"
                        name="role"
                        value={form.role}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>

                    <button type="submit">
                        {selectedUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                    </button>
                    {selectedUser && (
                        <button type="button" onClick={resetForm}>
                            Cancelar
                        </button>
                    )}
                </form>

                {/* Listado de Usuarios */}
                <section className={styles.usersSection}>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <div key={user.id} className={styles.userCard}>
                                <img src={user.photoURL} alt={user.displayName} className={styles.userImage} />
                                <h4>{user.displayName}</h4>
                                <p>{user.email}</p>
                                <span className={styles.roleLabel}>{user.role}</span>
                                <div className={styles.userActions}>
                                    <button onClick={() => handleEditUser(user)}>Editar</button>
                                    <button onClick={() => handleDeleteUser(user.id)}>Eliminar</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No se encontraron usuarios.</p>
                    )}
                </section>
            </div>
        </RequireAuth>
    );
};

export default AdminUsers;