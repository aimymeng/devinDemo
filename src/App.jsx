import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import IndexApp from './pages/index/App';
import AboutApp from './pages/about/App';
import JobsApp from './pages/jobs/App';
import RecruitmentApp from './pages/recruitment/App';

export const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={IndexApp} />
        <Route path="/about" component={AboutApp} />
        <Route path="/jobs" component={JobsApp} />
        <Route path="/recruitment" component={RecruitmentApp} />
      </Switch>
    </Router>
  );
};

export default App;
