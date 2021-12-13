import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { store } from "state";
import { GlobalStyles } from "components";
import ErrorProvider from "context/ErrorContext";

import App from "./App";
import "./onboard-override.css";

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyles />
    <Provider store={store}>
      <ErrorProvider>
        <App />
      </ErrorProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
