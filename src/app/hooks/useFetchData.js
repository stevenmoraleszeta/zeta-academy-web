"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
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
                const dataList = await Promise.all(querySnapshot.docs.map(async (document) => {
                    const item = { id: document.id, ...document.data() };
                    if (item.userId) {
                        const userDocRef = doc(db, 'users', item.userId);
                        const userDoc = await getDoc(userDocRef);
                        if (userDoc.exists()) {
                            item.username = userDoc.data().displayName;
                        }
                    }
                    return item;
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

    return { data, loading, error };
};

export default useFetchData;