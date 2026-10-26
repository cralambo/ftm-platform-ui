import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { store } from "./app/store";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={4000}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          preventDuplicate
        >
          <App />
        </SnackbarProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
