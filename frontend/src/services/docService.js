import apiClient from "./apiClient";

const docService = {
    async createDoc(name) {
        try {
            const response = await apiClient.post("/docs", {
                doc_name: name,
            });

            return response.data
        } catch (error) {
            throw new Error(
                error.response?.data?.error || error.message || "Something went wrong"
            )
        };

    },

    async getUserDoc() {
        try {
            const response = await apiClient.get("/docs");
            return response.data.docs;
        } catch (error) {
            throw new Error(
                error.response?.data?.error || error.message || "Something went wrong"
            )
        };

    },

    async getDocById(docId) {
        try {
            const response = await apiClient.get(`/docs/${docId}`);

            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.error || error.message || "Something went wrong"
            )
        };

    },

    async deleteDoc(docId) {
        try {
            const response = await apiClient.delete(`/docs/${docId}`);

            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.error || error.message || "Something went wrong"
            )
        };

    },

    async getLink(docId, permission){
        try{
            const response = await apiClient.post("/docs/share",{
                doc_id: docId,
                permission: permission,
            });
            return response.data
        } catch(error){
            console.log("getLink error:", error)
            throw new Error(
                error.response?.data?.error || error.message || "Something went wrong"
            )
        }
    },

    async getDocPermFromToken(token) {
        try{
            const response = await apiClient.post(`/resolveToken`,{
                token: token,
            });
            return response.data
        } catch(error){
            throw new error(
                error.responnse?.data?.error || error.message || "Something went wrong"
            )
        }
    }
};

export default docService;