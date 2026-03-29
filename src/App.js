import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import AddProduct from './pages/admin/AddProduct'
import Orders from './pages/admin/Orders'
import Home from './pages/shop/Home'
import ProductDetail from './pages/shop/ProductDetail'
import Cart from './pages/shop/Cart'
import Checkout from './pages/shop/Checkout'
import ProtectedRoute from './components/ProtectedRoute'
import EditProduct from './pages/admin/EditProduct'
import MyOrders from './pages/shop/MyOrders'
import Categories from './pages/admin/Categories'
import Blog from './pages/shop/Blog'
import BlogPost from './pages/shop/BlogPost'
import AdminBlog from './pages/admin/Blog'
import BlogEditor from './pages/admin/BlogEditor'
import About from './pages/shop/About'
import Contact from './pages/shop/Contact'
import Messages from './pages/admin/Messages'



function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="orders" element={<Orders />} />
          <Route path="categories" element={<Categories />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="blog/new" element={<BlogEditor />} />
          <Route path="blog/edit/:id" element={<BlogEditor />} />
          <Route path="messages" element={<Messages />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App