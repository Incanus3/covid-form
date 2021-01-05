import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import { Auth, AuthContext } from 'src/auth'

import Navbar         from './Navbar'
import Registration   from './Registration'
import Login          from './admin/Login'
import Administration from './admin/Administration'

const auth = new Auth()

function LoggedInRoute({ path, exact = false, children }) {
  if (auth.isLoggedIn) {
    return <Route path={path} exact={exact}>{children}</Route>
  } else {
    return <Redirect to="/admin/login" />
  }
}

function LoggedOutRoute({ path, exact = false, children, redirectTo }) {
  if (auth.isLoggedIn) {
    return <Redirect to={redirectTo} />
  } else {
    return <Route path={path} exact={exact}>{children}</Route>
  }
}

export default function App() {
  return (
    <AuthContext.Provider value={auth}>
      <Router>
        <Navbar />

        <Switch>
          <Route path="/admin">
            <Switch>
              <LoggedOutRoute path="/admin/login" redirectTo="/admin/export"><Login /></LoggedOutRoute>
              <LoggedInRoute path="/admin/export"><Administration /></LoggedInRoute>
              <Redirect to="/admin/login" />
            </Switch>
          </Route>

          <Route path="/" exact={true}>
            <Registration />
          </Route>
        </Switch>
      </Router>
    </AuthContext.Provider>
  );
}
