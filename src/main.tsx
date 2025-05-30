import "./index.css";
import { createRoot } from "react-dom/client";
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
// Pages
import HomePage from "./pages/home/home.page";
import CollisionPage from "./pages/collision/collision.page";
import FlockingPage from "./pages/flocking/flocking.page";
import CubeWavePage from "./pages/cube-wave/cube-wave.page";
import RaycastingPage from "./pages/raycasting/raycasting.page";
import Terrain3DPage from "./pages/terrain-3d/terrain-3d.page";
import AsteroidsPage from "./pages/asteroids/asteroids.page";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/collision" element={<CollisionPage />} />
      <Route path="/flocking" element={<FlockingPage />} />
      <Route path="/cube-wave" element={<CubeWavePage />} />
      <Route path="/raycasting" element={<RaycastingPage />} />
      <Route path="/terrain-3d" element={<Terrain3DPage />} />
      <Route path="/asteroids" element={<AsteroidsPage />} />
    </Routes>
  </BrowserRouter>
);
