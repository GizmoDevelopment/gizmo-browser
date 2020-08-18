// Modules
import React, { Component } from "react";

// Components
import Searchbar from "./Searchbar.js";

// Styles
import "../styles/NavigationMenu.css";

// CommonJS Modules
const { ipcRenderer } = window.require("electron");

export default class NavigationMenu extends Component {

    state = {
        canGoBack: false,
        canGoForward: false,
        settings: {
            themeColor: "#a31ffc"
        }
    }

    componentDidMount () {
        
        ipcRenderer.on("navigationRenderer", (event, data) => {
            if (data.hasOwnProperty("data")) {
                switch (data.type) {
                    case "refresh":

                        this.setState({
                            ...this.state,
                            ...data.data
                        });
                    
                        break;
                    default:
                }
            }
        });

        ipcRenderer.on("settingsRenderer", (event, data) => {
            switch (data.type) {
                case "themeColor":

                    this.setState({
                        ...this.state,
                        settings: {
                            ...this.state.settings,
                            themeColor: data.value
                        }
                    });

                    break;
                default:
            }
        });
    }

    controlNavigation (action) {
        ipcRenderer.send("navigationManager", { type: action });
    }

    render () {
        return (
            <div id = "navigationMenu" style = {{ borderTopColor: this.state.settings.themeColor }}>
                <button
                    className = { `navigationButton navigationButton${ this.state.canGoBack ? "Active" : "Inactive" }` }
                    id = "navigatorGoBack"
                    onClick = { this.controlNavigation.bind(this, "goBack") }
                >
                    <svg viewBox = "2 2 12 12">
                        <path d = "M7.854 4.646a.5.5 0 0 1 0 .708L5.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0z"/>
                        <path d = "M4.5 8a.5.5 0 0 1 .5-.5h6.5a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                </button>
                <button
                    className = "navigationButton"
                    id = "navigatorReload"
                    onClick = { this.controlNavigation.bind(this, "reload") }
                >
                    <svg viewBox = "0 0 16 16">
                        <path d = "M3.17 6.706a5 5 0 0 1 7.103-3.16.5.5 0 1 0 .454-.892A6 6 0 1 0 13.455 5.5a.5.5 0 0 0-.91.417 5 5 0 1 1-9.375.789z"/>
                        <path d = "M8.147.146a.5.5 0 0 1 .707 0l2.5 2.5a.5.5 0 0 1 0 .708l-2.5 2.5a.5.5 0 1 1-.707-.708L10.293 3 8.147.854a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </button>
                <button
                    className = { `navigationButton navigationButton${ this.state.canGoForward ? "Active" : "Inactive" }` }
                    id = "navigatorGoForward"
                    onClick = { this.controlNavigation.bind(this, "goForward") }
                >
                    <svg viewBox = "2 2 12 12">
                        <path d = "M8.146 4.646a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.793 8 8.146 5.354a.5.5 0 0 1 0-.708z"/>
                        <path d = "M4 8a.5.5 0 0 1 .5-.5H11a.5.5 0 0 1 0 1H4.5A.5.5 0 0 1 4 8z"/>
                    </svg>
                </button>
                <Searchbar />
            </div>
        );
    }
}