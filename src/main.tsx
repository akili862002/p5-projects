import "./index.css";
import { createRoot } from "react-dom/client";
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
// Pages
import HomePage from "./pages/home/home.page";
import CollisionPage from "./pages/collision/collision.page";
import FlockingPage from "./pages/flocking/flocking.page";
import CubeWavePage from "./pages/cube-wave/cube-wave.page";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/collision" element={<CollisionPage />} />
      <Route path="/flocking" element={<FlockingPage />} />
      <Route path="/cube-wave" element={<CubeWavePage />} />
    </Routes>
  </BrowserRouter>
);
