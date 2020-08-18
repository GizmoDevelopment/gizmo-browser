// Modules
import React, { Component } from "react";

// Styles
import "../styles/Tab.css";

// Variables
import defaultIcon from "../assets/icons/icon.png";

// CommonJS Modules
const { ipcRenderer } = window.require("electron");

export default class Tab extends Component {

    ref;

    state = {
        dragging: false
    }

    constructor (props) {
        super(props);
        this.ref = React.createRef();
    }

    componentDidMount () {
        ipcRenderer.on("tabRenderer", (_, data) => {
            switch (data.type) {
                case "tabMetadata":

                    if (data.hasOwnProperty("tabId") && data.hasOwnProperty("metadata")) {
                        this.setState({ ...this.state, ...data.metadata });
                    }

                    break;
                default:
            }
        });
    }

    removeTab = (tabId) => {
        ipcRenderer.send("tabManager", { type: "remove", tabId });
    }

    focusTab = (tabId) => {
        ipcRenderer.send("tabManager", { type: "focus", tabId, data: this.state });
    }

    render () {

        const tab = this.props.data,
            settings = this.props.settings;

        return (
            <div
                className = {
                    `tab ${ this.props.focused
                        ? "focusedTab"
                        : ""
                    } ${
                        this.state.dragging
                        ? "draggingTab"
                        : ""
                    }`
                }
                style = { this.props.focused ? {
                    borderLeftColor: settings.themeColor,
                    borderTopColor: settings.themeColor,
                    borderRightColor: settings.themeColor
                } : {} } 
                onMouseDown = { this.focusTab.bind(this, tab.id) }
            >
                <img
                    src = { tab.hasOwnProperty("favicon") ? tab.favicon : defaultIcon }
                    alt = ""
                    draggable = "false"
                />
                <div>{ tab.hasOwnProperty("title") ? tab.title : "New Page" }</div>
                <button onClick = { this.removeTab.bind(this, tab.id) }>X</button>
            </div>
        );
    }
};