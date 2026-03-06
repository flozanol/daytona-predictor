import "./globals.css";

export const metadata = {
    title: "Daytona Predictor Dashboard",
    description: "Sales Forecasting and Velocity",
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body className="antialiased">{children}</body>
        </html>
    );
}
