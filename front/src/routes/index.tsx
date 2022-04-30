import React from 'react';

import { RouteObject } from 'react-router-dom'
import Cadastro from '../pages/Cadastro';

import Home from '../pages/Home'
import Login from '../pages/Login';

const routes: RouteObject[] = [
    {
        path: '/',
        element: <Home />
    },
    {
        path: '/login',
        element: <Login />
    },
      
    {
        path: '/cadastro',
        element: <Cadastro />
    },
  
]

export default routes