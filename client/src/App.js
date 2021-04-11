import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";
import Footer from './components/footer'
import './index.css'

const App = () => (
    <div className="app">
        <BrowserRouter>
            <Switch>
                <Route path="/" exact component={CreateRoom} />
                <Route path="/room/:roomID" component={Room} />
            </Switch>
        </BrowserRouter>
        <Footer />
    </div>
);

export default App;
