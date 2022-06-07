import { auth, db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  getDocs,
  deleteDoc,
  where,
} from "firebase/firestore";
import { store } from "./store";

export const getListOfDocuments = async () => {
  const q = query(
    collection(db, "documents"),
    where("uid", "==", auth.currentUser.uid)
  );

  const querySnapshot = await getDocs(q);

  const documents = [];

  querySnapshot.forEach((doc) => {
    documents.push({ id: doc.id, ...doc.data() });
  });

  return documents;
};

export const saveAs = async (name) => {
  try {
    const docRef = await addDoc(collection(db, "documents"), {
      name: name,
      content: store.getState().document.content,
      uid: auth.currentUser.uid,
    });
    console.log("New document saved with id: " + docRef.id + ", name: " + name);
    return docRef.id;
  } catch (error) {
    console.error(error);
  }
};

export const save = async (id = null) => {
  const state = store.getState();
  const _id = id ?? state.document.id;
  const docRef = doc(db, "documents", _id);
  try {
    await updateDoc(docRef, {
      content: state.document.content,
    });
    console.log("Document updated with id: " + _id);
  } catch (error) {
    console.error(error);
  }
};

export const deleteDocument = async (id) => {
  const docRef = doc(db, "documents", id);
  try {
    await deleteDoc(docRef);
    console.log("Document removed with id: " + id);
  } catch (error) {
    console.error(error);
  }
};
