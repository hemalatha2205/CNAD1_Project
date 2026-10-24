import api from "./axiosConfig";

export const supplierApi = {
    getDashboardStats: async (supplierId) => {
        // We'll calculate stats from raw data
        const [products, orders] = await Promise.all([
            api.get(`/products/supplier/${supplierId}`),
            api.get(`/orders/supplier/${supplierId}`)
        ]);

        // Let's get inventory for all products to find low stock
        const productsWithStock = await Promise.all(
            products.data.map(async (p) => {
                try {
                    const inv = await api.get(`/inventory/${p.id}`);
                    return { ...p, stock: inv.data.quantity };
                } catch {
                    return { ...p, stock: 0 };
                }
            })
        );

        const lowStock = productsWithStock.filter(p => p.stock < 10).length;

        return {
            totalProducts: products.data.length,
            lowStockProducts: lowStock,
            recentOrders: orders.data.slice(0, 5)
        };
    },

    getProducts: (supplierId) => api.get(`/products/supplier/${supplierId}`),

    getProduct: (id) => api.get(`/products/${id}`),

    addProduct: (productData) => api.post("/products", productData),

    updateProduct: (id, productData) => api.put(`/products/${id}`, productData),

    getInventoryForProduct: (productId) => api.get(`/inventory/${productId}`),

    addStock: (productId, quantity) => api.post(`/inventory/${productId}/add?quantity=${quantity}`),

    createInventoryRecord: (productId, quantity) => api.post("/inventory", { productId, quantity }),

    getOrders: (supplierId) => api.get(`/orders/supplier/${supplierId}`),

    getProfile: (supplierId) => api.get(`/auth/supplier/${supplierId}`)
};
