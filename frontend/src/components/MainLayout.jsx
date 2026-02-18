import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            <Sidebar />
            <main className="flex-1 lg:ml-16 h-full overflow-hidden relative">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;