// File: src/app/hooks/useFetchData.ts
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

const useFetchData = (collectionName) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const querySnapshot = await getDocs(collection(db, collectionName));
                const dataList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setData(dataList);
            } catch (error) {
                setError(`Error fetching ${collectionName}: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [collectionName]);

    // Asegurarse de devolver siempre un array
    return { data: Array.isArray(data) ? data : [], loading, error };
};

export default useFetchData;
