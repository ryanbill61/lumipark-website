import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import OEM from "@/pages/OEM";
import Contact from "@/pages/Contact";
import Technical from "@/pages/Technical";
import ArticleDetail from "@/pages/ArticleDetail";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/ecosystem" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/oem-odm" element={<OEM />} />
          <Route path="/technical" element={<Technical />} />
          <Route path="/technical/:slug" element={<ArticleDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<Navigate to="/ecosystem" replace />} />
          <Route path="/oem" element={<Navigate to="/oem-odm" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
