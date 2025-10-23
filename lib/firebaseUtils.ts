import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { User, Role } from '../types';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  WithFieldValue,
  CollectionReference,
  UpdateData
} from 'firebase/firestore';
import { auth, db } from './firebase';

// Authentication functions
export const registerUser = async (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async (): Promise<void> => {
  return signOut(auth);
};

// Database functions
export const addDocument = async <T extends DocumentData>(
  collectionName: string,
  data: WithFieldValue<T>
): Promise<DocumentReference<T>> => {
  const collectionRef = collection(db, collectionName).withConverter({
    toFirestore: (data: WithFieldValue<T>) => data,
    fromFirestore: (snap) => snap.data() as T
  });
  return addDoc(collectionRef, data);
};

export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: UpdateData<T>
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  return updateDoc(docRef, data);
};

export const deleteDocument = async (
  collectionName: string,
  documentId: string
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  return deleteDoc(docRef);
};

export const getDocument = async <T extends DocumentData>(
  collectionName: string,
  documentId: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, documentId).withConverter({
    toFirestore: (data: T) => data,
    fromFirestore: (snap) => snap.data() as T
  });
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const getDocuments = async <T extends DocumentData>(
  collectionName: string,
  whereClause?: { field: string; operator: '==' | '>' | '<' | '>=' | '<='; value: any }
): Promise<Array<T & { id: string }>> => {
  const collectionRef = collection(db, collectionName);
  
  const q = whereClause
    ? query(collectionRef, where(whereClause.field, whereClause.operator, whereClause.value))
    : collectionRef;

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Array<T & { id: string }>;
};

// Helper function to get the current authenticated user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Helper function to register a new user with both auth and firestore data
export const registerNewUser = async (
  email: string,
  password: string,
  userData: {
    name: string;
    role: Role;
    stationId?: string;
  }
): Promise<User> => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    const user: User = {
      id: userCredential.user.uid,
      email,
      ...userData
    };
    
    await addDocument('users', user);
    return user;
  } catch (error) {
    console.error('Error registering new user:', error);
    throw error;
  }
};