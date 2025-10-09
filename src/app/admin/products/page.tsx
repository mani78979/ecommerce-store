"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  price: number;
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Product>({ id: '', name: '', price: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/admin/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  const createProduct = async () => {
    try {
      await axios.post('/api/admin/products', newProduct);
      fetchProducts();
      setNewProduct({ id: '', name: '', price: 0 });
    } catch (error) {
      console.error('Failed to create product', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await axios.delete('/api/admin/products', { data: { id } });
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin - Manage Products</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
          className="border p-2 mr-2"
        />
        <Button onClick={createProduct}>Add Product</Button>
      </div>

      <table className="table-auto w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="border px-4 py-2">{product.name}</td>
              <td className="border px-4 py-2">${product.price}</td>
              <td className="border px-4 py-2">
                <Button onClick={() => deleteProduct(product.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductsPage;