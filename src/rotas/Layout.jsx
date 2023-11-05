import React from 'react';
import TopMenu from './TopMenu';

const Layout = ({ children }) => {
    return (
        <div >
            <TopMenu />
            {children}
        </div>
    );
};

export default Layout;
