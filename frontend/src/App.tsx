import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomeComponent from "./components/HomeComponent";
import LoginComponent from "./components/LoginComponent";
import RegisterComponent from "./components/RegisterComponent";
import HistoryComponent from "./components/HistoryComponent";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomeComponent />} />
                <Route path="/home" element={<HomeComponent />} />
                <Route path="/login" element={<LoginComponent />} />
                <Route path="/register" element={<RegisterComponent />} />
                <Route path="/history" element={<HistoryComponent />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
