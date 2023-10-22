import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import LoginPage from "./rotas/LoginPage";
import TelaCadastro from "./rotas/TelaCadastro";
import TelaDadosPessoa from "./rotas/TelaDadosPessoa";
import TelaInicial from "./rotas/TelaInicial";
import TelaCategorias from "./rotas/TelaCategorias";
import TelaCategoria from "./rotas/TelaCategoria";
import TopMenu from "./rotas/TopMenu";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />
  },
  {
    path: "telaCadastro",
    element: <TelaCadastro />
  },
  {
    path: "telaInicial",
    element: (
      <>
        <TopMenu />
        <TelaInicial />
      </>
    )
  },
  {
    path: "telaDadosPessoa",
    element: <TelaDadosPessoa />
  },
  {
    path: "TelaCategorias",
    element: <TelaCategorias />
  },
  {
    path: "TelaCategoria/:idCategoria",
    element: <TelaCategoria />
  },
  {
    path: "TopMenu",
    element: <TopMenu />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

