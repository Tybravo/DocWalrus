import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Landing from './pages/Landing';
import GetStarted from './pages/GetStarted';
import Installation from './pages/Installation';
import Configuration from './pages/Configuration';
import Deployment from './pages/Deployment';
import Support from './pages/Support';
import Layout from './Layout';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: '/get-started',
        element: <GetStarted />,
      },
      {
        path: '/installation',
        element: <Installation />,
      },
      {
        path: '/configuration',
        element: <Configuration />,
      },
      {
        path: '/deployment',
        element: <Deployment />,
      },
      {
        path: '/support',
        element: <Support />,
      },
    ],
  },
]);