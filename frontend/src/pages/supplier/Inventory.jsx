import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supplierApi } from "../../api/supplierApi";
import { Archive, Plus, AlertCircle } from "lucide-react";

export default function Inventory() {
  const { user } = useAuth();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restockData, setRestockData] = useState({ productId: null, quantity: "" });
  const [isRestocking, setIsRestocking] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchInventory();
  }, [user.userId]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const productsRes = await supplierApi.getProducts(user.userId);

      const inventoryPromises = productsRes.data.map(async (p) => {
        try {
          const inv = await supplierApi.getInventoryForProduct(p.id);
          return { ...p, stock: inv.data.quantity };
        } catch {
          return { ...p, stock: 0 };
        }
      });

      const items = await Promise.all(inventoryPromises);
      setInventoryItems(items);
    } catch (err) {
      console.error("Failed to load inventory", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    if (!restockData.productId || !restockData.quantity) return;

    setIsRestocking(true);
    setMessage({ type: "", text: "" });

    try {
      await supplierApi.addStock(restockData.productId, parseInt(restockData.quantity, 10));
      setMessage({ type: "success", text: "Stock updated successfully!" });
      setRestockData({ productId: null, quantity: "" });
      fetchInventory(); // Refresh the list

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update stock. " + (err.response?.data?.error || "") });
    } finally {
      setIsRestocking(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-500 mt-1">Monitor stock levels and add inventory for your products.</p>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Current Stock Levels</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading inventory...</div>
          ) : inventoryItems.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold text-right">In Stock</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">ID: {item.id}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {item.stock}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.stock < 10 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setRestockData({ productId: item.id, quantity: "" })}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-md"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Archive className="mx-auto text-gray-300 mb-4" size={48} />
              <p>No products found in inventory.</p>
            </div>
          )}
        </div>

        {/* Restock Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8">
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Add Stock</h2>
            </div>

            <form onSubmit={handleRestock} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Product</label>
                <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-[42px] flex items-center">
                  {restockData.productId
                    ? inventoryItems.find(i => i.id === restockData.productId)?.name
                    : <span className="text-gray-400">Select a product from the list</span>}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  required
                  disabled={!restockData.productId}
                  value={restockData.quantity}
                  onChange={(e) => setRestockData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g. 50"
                />
              </div>

              <button
                type="submit"
                disabled={!restockData.productId || !restockData.quantity || isRestocking}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                {isRestocking ? "Updating..." : "Add Stock"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
