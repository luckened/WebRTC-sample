import React from "react";
import DisneyMeetsLogo from '../images/DisneyMeets.png';
import DisneyMeetsMainLogo from '../images/DisneyMeetsLogo.png';
import { v1 as uuid } from "uuid";
import './createRoom.css'
import Footer from "../components/footer";

const CreateRoom = (props) => {
    const create = () => {
        const id = uuid();
        props.history.push(`/room/${id}`);
    };

    return (
        <div className="page">
            <div className="mainContent itemGrid">
                <header className="header">
                    <img className="headerLogo" src={DisneyMeetsMainLogo} />
                    <p>Disney Meets</p>
                </header>
                <section className="titleSection">
                    <h1 className="title">WELCOME TO DISNEY MEETS</h1>
                    <p>The best application to online meet</p>
                </section>

                <section className="buttonArea">
                    <p>
                        To create a room click on the button and send the link
                        to a friend
                    </p>
                    <button className="button" onClick={create}>
                        Create Room
                    </button>
                </section>
            </div>

            <section className="logoSide itemGrid">
                <img className="disneyLogo" src={DisneyMeetsLogo} />
            </section>
        </div>


    );
};

export default CreateRoom;
