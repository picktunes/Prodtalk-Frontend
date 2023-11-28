import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Route } from 'react-router-dom';
import LoginPage from './rotas/LoginPage';
import TelaCadastro from './rotas/TelaCadastro';
import TelaDadosPessoa from './rotas/TelaDadosPessoa';
import TelaInicial from './rotas/TelaInicial';
import TelaCategorias from './rotas/TelaCategorias';
import TelaCategoria from './rotas/TelaCategoria';
import TelaPublicacao from './rotas/TelaPublicacao';
import TelaFavoritos from './rotas/TelaFavoritos';
import TelaPerfil from './rotas/TelaPerfil';
import Layout from './rotas/Layout';
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <LoginPage />
    ),
  },
  {
    path: 'telaCadastro',
    element: (
      <Layout>
        <TelaCadastro />
      </Layout>
    ),
  },
  {
    path: 'telaInicial',
    element: (
      <Layout>
        <TelaInicial />
      </Layout>
    ),
  },
  {
    path: 'telaDadosPessoa',
    element: (
      <Layout>
        <TelaDadosPessoa />
      </Layout>
    ),
  },
  {
    path: 'TelaCategorias',
    element: (
      <Layout>
        <TelaCategorias />
      </Layout>
    ),
  },
  {
    path: 'TelaCategoria/:idCategoria',
    element: (
      <Layout>
        <TelaCategoria />
      </Layout>
    ),
  },
  {
    path: 'TelaPublicacao/:idPublicacao',
    element: (
      <Layout>
        <TelaPublicacao />
      </Layout>
    ),
  },
  {
    path: 'TelaFavoritos',
    element: (
      <Layout>
        <TelaFavoritos />
      </Layout>
    ),
  },
  {
    path: 'TelaPerfil/:idPessoa',
    element: (
      <Layout>
        <TelaPerfil />
      </Layout>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
