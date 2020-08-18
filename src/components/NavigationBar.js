// Modules
import React, { Component } from "react";

// Components
import TabMenu from "./TabMenu";
import NavigationMenu from "./NavigationMenu";

// Styles
import "../styles/NavigationBar.css";

// CommonJS Modules
const { ipcRenderer } = window.require("electron");

export default class NavigationBar extends Component {

    state = {
        maximized: false
    }

    controlWindow (action) {
        ipcRenderer.send("windowManager", { type: action });
    }

    componentDidMount () {
        ipcRenderer.on("windowRenderer", (event, data) => {
            switch (data.type) {
                case "maximize":

                    this.setState({
                        ...this.state,
                        maximized: true
                    });

                    break;
                case "unmaximize":

                    this.setState({
                        ...this.state,
                        maximized: false
                    });

                    break;
                default:
            }
        })
    }

    render () {
        return (
            <div id = "navigationBar">
                <TabMenu />
                <div id = "windowControlButtons">
                    <button
                        className = "windowControlButton"
                        id = "windowMinimize"
                        onClick = { this.controlWindow.bind(this, "minimize") }
                    >
                        <svg x = "0px" y = "0px" viewBox = "0 0 10.2 1">
                            <rect x = "0" y = "50%" width = "10.2" height = "1" />
                        </svg>
                    </button>
                    <button
                        className = "windowControlButton"
                        id = "windowMaximize"
                        onClick = { this.controlWindow.bind(this, this.state.maximized ? "unmaximize" : "maximize") }
                    >
                    {
                        this.state.maximized
                            ? ( // Maximized window icon
                                <svg viewBox = "0 0 775 775" width = "16" height = "16">
                                    <path d = "M0 771.24L640 771.24L640 131.24L0 131.24L0 771.24ZM64 707.24L64 195.24L576 195.24L576 707.24L64 707.24Z" />
                                    <path d = "M118.79 0L182.96 0L182.96 131.24L118.79 131.24L118.79 0Z" />
                                    <path d = "M119.79 0L759.79 0L759.79 64.08L119.79 64.08L119.79 0Z" />
                                    <path d = "M712.8 0L776.97 0L776.97 640L712.8 640L712.8 0Z" />
                                    <path d = "M638.75 587.92L776.97 587.92L776.97 652L638.75 652L638.75 587.92Z" />
                                </svg>
                            )
                            : ( // Unmaximized window icon
                                <svg viewBox = "0 0 10 10">
                                    <path d = "M0,0v10h10V0H0z M9,9H1V1h8V9z" />
                                </svg>
                            )
                    }
                    </button>
                    <button
                        className = "windowControlButton"
                        id = "windowClose"
                        onClick = { this.controlWindow.bind(this, "close") }
                    >
                        <svg viewBox = "0 0 10 10">
                            <polygon points = "10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1" />
                        </svg>
                    </button>
                </div>
                <NavigationMenu />
            </div>
        );
    }
};