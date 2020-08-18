// Modules
import React, { Component } from "react";

// Styles
import "../styles/Searchbar.css";

// CommonJS Modules
const { ipcRenderer } = window.require("electron");

export default class Searchbar extends Component {

    state = {
        query: ""
    }

    handleInputSubmit = (event) => {
        if (event.keyCode === 13) {

            const query = event.target.value,
                querySettingArray = query.toLowerCase().split("="),
                settingQuery = querySettingArray[0],
                settingValue = querySettingArray.length > 1 ? querySettingArray[1] : undefined;

            if (typeof settingValue === "string" && settingQuery.includes("settings://")) {
                switch (settingQuery) {
                    case "settings://themecolor":
                        ipcRenderer.send("settingManager", { type: "themeColor", value: settingValue });
                        break;
                    default:
                }
            } else {
                ipcRenderer.send("pageManager", { type: "query", query: this.generateURI(query) });
            }
        }
    }

    handleInputChange = (event) => {
        this.setState({
            ...this.state,
            query: event.target.value
        });
    }

    generateURI (url) {
        if (url.toLowerCase().match(/.*\..*/) !== null) {
    
            const httpSplit = url.split("://");
    
            return `https://${encodeURIComponent(httpSplit[httpSplit.length > 1 ? 1 : 0])}`;
        } else {
            return `https://www.google.com/search?client=chrome&q=${encodeURIComponent(url)}`;
        }
    }

    componentDidMount () {
        ipcRenderer.on("searchbarRenderer", (_, data) => {
            switch (data.type) {
                case "setQuery":

                    this.setState({
                        ...this.state,
                        query: data.query
                    });

                    break;
                default:
            }
        });
    }

    render () {
        return (
            <input
                id = "searchbar"
                type = "text"
                placeholder = "Search with Google or enter address"
                onKeyUp = { this.handleInputSubmit }
                onChange = { this.handleInputChange }
                value = { this.state.query }
                spellCheck = "false"
            />
        );
    }
}