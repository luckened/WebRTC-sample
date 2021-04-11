import React from 'react'
import './user.css'

const User = ({ game, children }) => {
    return (
        <div className="userComponent">
            <p className="userListItem">Nome: {children}</p>
        </div>
    );
}

export default User;