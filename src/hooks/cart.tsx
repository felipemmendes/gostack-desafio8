import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const loadedProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:cartItems',
      );

      if (loadedProducts) {
        setProducts(JSON.parse(loadedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productsUpdated = [...products];

      const productAlreadyInCartIndex = productsUpdated.findIndex(
        item => item.id === product.id,
      );

      if (productAlreadyInCartIndex >= 0) {
        productsUpdated[productAlreadyInCartIndex].quantity += 1;
      } else {
        productsUpdated.push({ ...product, quantity: 1 });
      }

      setProducts(productsUpdated);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cartItems',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsUpdated = [...products];

      const productIndex = productsUpdated.findIndex(item => id === item.id);

      if (productIndex >= 0) {
        productsUpdated[productIndex].quantity += 1;
      }

      setProducts(productsUpdated);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cartItems',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsUpdated = [...products];

      const productIndex = productsUpdated.findIndex(item => id === item.id);

      if (productIndex >= 0) {
        if (productsUpdated[productIndex].quantity > 1) {
          productsUpdated[productIndex].quantity -= 1;
        } else {
          productsUpdated.splice(productIndex, 1);
        }
      }

      setProducts(productsUpdated);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cartItems',
        JSON.stringify(products),
      );
    },

    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
