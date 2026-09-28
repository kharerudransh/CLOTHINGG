import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import { routes } from './app.routes';

const App = () => {
  return (
    <div>
      <Toaster position="top-right" />
      <RouterProvider router={routes}/>
    </div>
  )
}

export default App