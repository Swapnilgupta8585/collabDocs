import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useDocStore = create((devtools((set) => ({
    documents: [],
    currentDocId: null,

    share:{
        token: "",
        url:"",
        permission:"",
    },

    setDocuments: (docs) => set({ documents: docs}),
    setCurrentDoc: (docId) => set({currentDocId: docId}),
    clearCurrentDoc: () => set({currentDocId: null}),

    setShareInfo: ({token, url, permission}) => set({share:{token, url, permission}}),
    clearShareInfo:() => set({share: { token: "",url:"", permission: "" } })
}))));

export default useDocStore;

