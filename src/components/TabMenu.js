// Modules
import React, { Component } from "react";

// Components
import Tab from "./Tab";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

// Styles
import "../styles/TabMenu.css";

// CommonJS Modules
const { ipcRenderer } = window.require("electron");

const SortedTab = SortableElement(({ value, focused, data, settings }) => {
    return (
        <Tab
            focused = { focused }
            data = { data }
            settings = { settings }
        />
    );
});

const TabList = SortableContainer(({ items, tabs, focusedTab, settings }) => {
    return (
        <div id = "tabList">
            {
                items.map((tabId, index) => (
                    <SortedTab
                        key = { tabId }
                        index = { index }
                        value = { tabId }
                        focused = { tabId === focusedTab }
                        data = { tabs[tabId] }
                        settings = { settings }
                    />
                ))
            }
        </div>
    );
});

export default class TabMenu extends Component {
    
    state = {
        tabs: {},
        tabArray: [],
        focusedTab: 0,
        settings: {
            themeColor: "#a31ffc"
        }
    }

    createTab () {
        ipcRenderer.send("tabManager", { type: "create" });
    }

    onSortStart = ({ index }) => {
        const tab = this.state.tabs[this.state.tabArray[index]];
        ipcRenderer.send("tabManager", { type: "focus", tabId: tab.id, data: tab });
    }

    onSortEnd = ({ oldIndex, newIndex }) => {

        const sortedArray = this.state.tabArray,
            tabId = sortedArray[oldIndex];
        
        sortedArray.splice(oldIndex, 1);
        sortedArray.splice(newIndex, 0, tabId);

        this.setState({
            ...this.state,
            tabArray: sortedArray
        });
    }

    componentDidMount () {

        /**
         * TabRenderer will always only receive the tab ID
         */

        ipcRenderer.on("tabRenderer", (event, data) => {

            const tabs = this.state.tabs,
                tabArray = this.state.tabArray;

            switch (data.type) {
                case "create":

                    tabArray.push(data.tabId);

                    this.setState({
                        ...this.state,
                        tabs: { ...tabs, [data.tabId]: { id: data.tabId } },
                        tabArray
                    });

                    break;
                case "remove":

                    if (tabs.hasOwnProperty(data.tabId)) {

                        delete tabs[data.tabId];
                        delete tabArray[tabArray.indexOf(data.tabId)];

                        this.setState({
                            ...this.state,
                            tabs,
                            tabArray
                        });

                        /*
                        if (Object.keys(this.state.tabs).length > 0 && this.state.focusedTab === data.tabId) {
                            if (tabs.hasOwnProperty(data.tabid - 1)) {
                                this.focusTab(data.tabId - 1);
                            } else { // Sometimes the tab before the one being deleted was deleted already
                                const tabIds = Object.keys(tabs);
                                this.focusTab(tabs[tabIds[tabIds.length - 1]].id);
                            }                            
                        }
                        */
                    }

                    break;
                case "focus":

                    this.setState({
                        ...this.state,
                        focusedTab: data.tabId
                    });

                    break;
                case "getFocusedTabForQuery":

                    if (Object.keys(this.state.tabs).length === 0) {
                        ipcRenderer.send("tabManager", { ...data, type: "create" });
                    } else {
                        ipcRenderer.send("pageManager", { ...data, type: "finalQuery", tabId: this.state.focusedTab });
                    }

                    break;
                case "tabMetadata":

                    if (data.hasOwnProperty("tabId") && data.hasOwnProperty("metadata") && tabs.hasOwnProperty(data.tabId)) {
                        this.setState({
                            ...this.state,
                            tabs: { ...tabs, [data.tabId]: { ...tabs[data.tabId], ...data.metadata } }
                        });
                    }

                    break;
                case "bounceBack":

                    ipcRenderer.send(data.msg, { ...data, type: data._type });

                    break;
                default:
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

        ipcRenderer.send("tabManager", { type: "reload" });
    }

    render () {
        return (
            <div id = "tabMenu">
                <TabList
                    items = { this.state.tabArray }
                    updateBeforeSortStart = { this.onSortStart }
                    onSortEnd = { this.onSortEnd }
                    axis = "x"
                    lockAxis = "x"
                    hideSortableGhost = { true }
                    distance = { 5 }
                    lockToContainerEdges = { true }
                    focusedTab = { this.state.focusedTab }
                    tabs = { this.state.tabs }
                    settings = { this.state.settings }
                />
                <button id = "createTab" onClick = { this.createTab }>&#43;</button>
            </div>
        );
    }
}

/*{
    Object.values(this.state.tabs).map((tab) => {
        return (
            <Tab
                key = { tab.id }
                focused = { tab.id === this.state.focusedTab }
                data = { tab }
            />
        );
    })
}*/