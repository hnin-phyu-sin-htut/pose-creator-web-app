import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomeComponent from "./components/HomeComponent";
import LoginComponent from "./components/LoginComponent";
import RegisterComponent from "./components/RegisterComponent";
import HistoryComponent from "./components/HistoryComponent";
import ProfileComponent from "./components/ProfileComponent";
import { UserProvider } from "./context/UserContext.tsx";

function App() {
    return (
        <UserProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomeComponent />} />
                    <Route path="/home" element={<HomeComponent />} />
                    <Route path="/login" element={<LoginComponent />} />
                    <Route path="/register" element={<RegisterComponent />} />
                    <Route path="/history" element={<HistoryComponent />} />
                    <Route path="/profile" element={<ProfileComponent />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;