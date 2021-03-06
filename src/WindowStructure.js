"use strict";
/**
 * Makes an element draggable.
 * @class
 * {@link https://stackoverflow.com/a/42441467}
 */
class Dragger {
    /**
     * @constructs Dragger
     * @param {HTMLElement | null} element The element to drag.
     */
    constructor(element) {
        /**
         * The element to drag.
         * @type {HTMLElement | null}
         * @private
         */
        this.element = null;
        if (element === null) {
            throw new Error("The element does not exist.");
        }
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("class", "tooltip drag");
        if (element.parentNode) {
            element.parentNode.insertBefore(this.wrapper, element);
        }
        this.wrapper.appendChild(element);
        element.dragger = this.init(this.wrapper, element);
    }
    /**
     * Initializes the dragger.
     * @param {HTMLDivElement} wrapper The previously created wrapper.
     * @param {HTMLElement} element The element to drag.
     * @returns {Dragger} An instance of Dragger (this).
     * @private
     */
    init(wrapper, element) {
        this.wrapper = wrapper;
        this.element = element;
        this.element.draggable = true;
        this.element.setAttribute("draggable", "true");
        this.element.addEventListener("dragstart", this.dragStart.bind(this));
        return this;
    }
    /**
     * Gets the value of a CSS attribute.
     * @param {CSSStyleDeclaration} style The CSS declaration of an object.
     * @param {string} prop The attribute's name.
     * @returns {number} The value of the CSS attribute.
     * @private
     */
    getPropertyValue(style, prop) {
        let value = style.getPropertyValue(prop);
        value = value ? value.replace(/[^0-9.]/g, "") : "0";
        return parseFloat(value);
    }
    /**
     * Gets the position and the width of an element.
     * @param element The HTML element.
     * @returns {{x: number, y: number, width: number, height: number}} The properties of the HTML element.
     * @private
     */
    getElementRect(element) {
        let style = window.getComputedStyle(element, null);
        return {
            x: this.getPropertyValue(style, "left"),
            y: this.getPropertyValue(style, "top"),
            width: this.getPropertyValue(style, "width"),
            height: this.getPropertyValue(style, "height"),
        };
    }
    /**
     * Starts the process (starts moving the element).
     * @param {DragEvent} event The event.
     * @public
     */
    dragStart(event) {
        let wrapperRect = this.getElementRect(this.wrapper);
        var x = wrapperRect.x - parseFloat(event.clientX.toString());
        var y = wrapperRect.y - parseFloat(event.clientY.toString());
        if (this.element) {
            if (event.dataTransfer) {
                event.dataTransfer.setData("text/plain", this.element.id + "," + x + "," + y);
            }
            else {
                throw new Error("An error has occured. Cannot get the data from the transfer.");
            }
        }
        else {
            throw new Error("An error has occured. The element to drag is not defined.");
        }
    }
    /**
     * Stops the process (moves the element to its new position on the page).
     * @param {MouseEvent} event The event.
     * @param {number} prevX The previous x position.
     * @param {number} prevY The previous y position.
     * @public
     */
    dragStop(event, prevX, prevY) {
        var posX = parseFloat(event.clientX.toString()) + prevX;
        var posY = parseFloat(event.clientY.toString()) + prevY;
        this.wrapper.style.left = posX + "px";
        this.wrapper.style.top = posY + "px";
    }
}
// init the drag event
document.body.addEventListener("dragover", function (event) {
    event.preventDefault();
    return false;
});
document.body.addEventListener("drop", function (event) {
    event.preventDefault();
    if (event.dataTransfer) {
        var dropData = event.dataTransfer.getData("text/plain").split(",");
        var element = document.getElementById(dropData[0]);
        if (element) {
            element.dragger.dragStop(event, parseFloat(dropData[1]), parseFloat(dropData[2]));
        }
        else {
            throw new Error("An error has occured. The element to drag is not defined.");
        }
        return false;
    }
    else {
        throw new Error("An error has occured. Cannot get the data from the transfer.");
    }
});
/*
 *
 * WindowStructure
 *
 */
class WindowStructure {
    /**
     * @constructs WindowStructure
     * @param {string} title The title of the window.
     * @param {number} width The width of the window (by default 800).
     * @param {number} height The height of the window (by default 462).
     * @param {boolean} draggable Should the window be draggable? True by default.
     * @param {boolean} resizable Should the window be resizable? True by default.
     * @param {HTMLElement} parent The parent element in which to put the window once created.
     */
    constructor(title = "Window", width = 800, height = 462, draggable = true, resizable = true, parent = document.body) {
        /**
         * The width of the window.
         * @type {number}
         * @default 800
         * @public
         */
        this.width = 800;
        /**
         * The height of the window.
         * @type {number}
         * @default 462
         * @public
         */
        this.height = 462;
        /**
         * The minimum width of the window.
         * @type {number}
         * @default 300
         * @public
         */
        this.minWidth = 300;
        /**
         * The minimum height of the window.
         * @type {number}
         * @default 100
         * @public
         */
        this.minHeight = 100;
        /**
         * The title of the window.
         * @type {string}
         * @default "Window"
         * @public
         */
        this.title = "Window";
        /**
         * The window (by default null).
         * @type {HTMLElement | null}
         * @default null
         * @public
         */
        this.window = null;
        /**
         * The parent element in which the window is put.
         * @type {HTMLElement}
         * @default document.body
         * @public
         */
        this.parent = document.body;
        /**
         * True if the window can be draggable.
         * @type {boolean}
         * @default true
         * @public
         */
        this.draggable = true;
        /**
         * True if the window can be resizable.
         * @type {boolean}
         * @default true
         * @public
         */
        this.resizable = true;
        /**
         * The status of the window (0 => normal / 1 => min)
         * @type {number}
         * @default 0
         * @public
         */
        this.status = 0; // 0 => normal / 1 => min
        /**
         * A function to call every time we minify the window.
         * @type {Function}
         * @public
         */
        this.minCallback = function () { };
        /**
         * A function to call every time we extend the window.
         * @type {Function}
         * @public
         */
        this.extensionCallback = function () { };
        /**
         * A function to call every time we close the window.
         * @type {Function}
         * @public
         */
        this.closeCallback = function () { };
        /**
         * A function to call every time we kill the window.
         * @type {Function}
         * @public
         */
        this.killCallback = function () { };
        /**
         * Should the window have an absolute position?
         * @type {boolean}
         * @default true
         * @private
         */
        this.absolutePosition = true;
        /**
         * Options to control the main colors.
         * @type {{text: string, background: string, menubarBackground: string, menubarColor: string}}
         * @public
         */
        this.colors = {
            text: "#ccc",
            background: "#0c0c0c",
            menubarBackground: "#000",
            menubarColor: "#fff",
        };
        /**
         * Options to control the default minimization of the window.
         * @type {{xSide: string, ySide: string, posFromX: number, posFromY: number}}
         * @public
         */
        this.minimizationOptions = {
            xSide: "left",
            ySide: "bottom",
            posFromX: 20,
            posFromY: 20,
        };
        /**
         * True if the window is in fullscreen.
         * @type {boolean}
         * @default false
         * @private
         */
        this.isFullscreen = false;
        /**
         * An instance of HTMLBuilder.
         * {@link https://github.com/CodoPixel/HTMLBuilder}
         * @type {HTMLBuilder}
         * @private
         */
        this.builder = new HTMLBuilder();
        /**
         * The window ID. This ID is unique and thanks to it, we can create several windows without conflict.
         * @type {string}
         * @private
         */
        this.key = "";
        this._genKey();
        this.title = title.trim();
        this.width = width;
        this.height = height;
        this.draggable = draggable;
        this.resizable = resizable;
        this.parent = parent;
        var self = this;
        this.builder.bindEvent({
            name: "minify",
            type: "click",
            callback: function (e) {
                self.minify();
            },
        });
        this.builder.bindEvent({
            name: "extend",
            type: "click",
            callback: function (e) {
                self.extend();
            },
        });
        this.builder.bindEvent({
            name: "close",
            type: "click",
            callback: function (e) {
                self.close();
            },
        });
    }
    /**
     * Generates the random ID of the window.
     * @private
     */
    _genKey() {
        var generatedKey = "windowkey-";
        for (var i = 0; i < 6; i++) {
            var min = Math.ceil(0);
            var max = Math.floor(10);
            var random = Math.floor(Math.random() * (max - min)) + min;
            generatedKey += random;
        }
        this.key = generatedKey;
    }
    /**
     * Disables the absolute position of the window.
     * This action deactivates the button 0 in the menu bar.
     */
    _disableAbsolutePosition() {
        this.absolutePosition = false;
        if (this.window) {
            this.disableButton(0);
        }
    }
    /**
     * Enables the absolute position of the window.
     * This function enables the button 0 in the menu bar.
     */
    _enableAbsolutePosition() {
        this.absolutePosition = true;
        if (this.window) {
            this.enableButton(0);
        }
    }
    /**
     * Enables a button.
     * @param {number} index The index of the button (0, 1 or 2, from left to right).
     */
    enableButton(index) {
        if (this.window) {
            try {
                var allButtons = this.window.querySelectorAll("button");
                allButtons[index].removeAttribute("disabled");
            }
            catch (e) {
                throw new Error("enableButton(index): the index is not good (0, 1 or 2, from left to right).");
            }
        }
        else {
            throw new Error("The window is not built.");
        }
    }
    /**
     * Disables a button.
     * @param index The index of the button (0, 1 or 2, from left to right).
     */
    disableButton(index) {
        if (this.window) {
            try {
                var allButtons = this.window.querySelectorAll("button");
                allButtons[index].setAttribute("disabled", "");
            }
            catch (e) {
                throw new Error("disableButton(index): the index is not good (0, 1 or 2, from left to right).");
            }
        }
        else {
            throw new Error("The window is not built.");
        }
    }
    /**
     * Activates the fullscreen mode.
     * @returns {boolean} True if the fullscreen mode has been allowed.
     */
    requestFullscreen() {
        if (this.window) {
            if (this.window.requestFullscreen) {
                this.window.requestFullscreen();
                this.isFullscreen = true;
                return true;
            }
            else {
                return false;
            }
        }
        else {
            throw new Error("The window is not built.");
        }
    }
    /**
     * Deactivates the fullscreen mode.
     * @returns {boolean} True if the fullscreen mode has been successfully deactivated.
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            this.isFullscreen = false;
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Temporarily disables the draggable property of the window & resets its position.
     */
    _hideDraggable() {
        if (this.draggable && this.window && this.window.parentElement) {
            this.window.setAttribute("draggable", "false");
            this.window.parentElement.style.left = "";
            this.window.parentElement.style.top = "";
        }
    }
    /**
     * Resets the position of the window if it is draggable (after using `minify()`).
     */
    _resetDraggable() {
        if (this.draggable && this.window && this.window.parentElement) {
            this.window.parentElement.style.left = "";
            this.window.parentElement.style.top = "";
            this.window.parentElement.style.bottom = "";
            this.window.parentElement.style.right = "";
            this.window.setAttribute("draggable", "true");
        }
    }
    /**
     * Temporarily disables the resizable property of the window because we don't want the user to move it when it's minimized.
     */
    _hideResizable() {
        if (this.resizable && this.window) {
            this.window.style.resize = "none";
        }
    }
    /**
     * Resets the resizable property if it is enabled (after using `minify()`).
     */
    _resetResizable() {
        if (this.resizable && this.window) {
            this.window.style.resize = "both";
        }
    }
    /**
     * Minimizes the window. This is not possible if the absolute position has been disallowed.
     * @param {string} x The x-direction of the absolute position ("left" by default or "right").
     * @param {string} y The y-direction of the absolute position ("bottom" by default or "top").
     * @param {number} posFromX The position from the left of right side (by default 20).
     * @param {number} posFromY The position from the bottom or top side (by default 20).
     */
    minify(x = this.minimizationOptions.xSide, y = this.minimizationOptions.ySide, posFromX = this.minimizationOptions.posFromX, posFromY = this.minimizationOptions.posFromY) {
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        if (this.window) {
            if (this.absolutePosition && this.draggable) {
                if (this.window.parentElement === null) {
                    throw new Error("Cannot minimize the window.");
                }
                this.window.style.width = this.minWidth + "px";
                this.window.style.height = this.minHeight + "px";
                // disable draggable
                // very important /!\
                this._hideDraggable();
                x === "right"
                    ? (this.window.parentElement.style.right = posFromX + "px")
                    : (this.window.parentElement.style.left = posFromX + "px");
                y === "top"
                    ? (this.window.parentElement.style.top = posFromY + "px")
                    : (this.window.parentElement.style.bottom = posFromY + "px");
                this._hideResizable();
                this.status = 1;
                this.disableButton(0);
                this.enableButton(1);
                this.minCallback();
            }
        }
        else {
            throw new Error("The window is not built.");
        }
    }
    /**
     * Restores normal window dimensions only if the status is 1 (= minimized).
     * This action deactivates the button & enables the first one.
     */
    extend() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        if (this.status === 1) {
            if (this.window) {
                // because we disabled draggable & resizable with minify()
                this._resetDraggable();
                this._resetResizable();
                this.window.style.width = this.width + "px";
                this.window.style.height = this.height + "px";
                this.status = 0;
                this.disableButton(1);
                this.enableButton(0);
                this.extensionCallback();
            }
            else {
                throw new Error("The window is not built.");
            }
        }
    }
    /**
     * Closes the window only if it's not already closed. The window is just hidden with a `display:none`.
     */
    close(confirmation) {
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        if (!this.isClosed()) {
            if (this.window) {
                if (confirmation) {
                    if (confirm(confirmation)) {
                        this.window.style.display = "none";
                        this.closeCallback();
                    }
                }
                else {
                    this.window.style.display = "none";
                    this.closeCallback();
                }
            }
            else {
                throw new Error("The window is not built.");
            }
        }
    }
    /**
     * Makes the window reappear after closing it. Restores the normal display value (`block`).
     */
    reappear() {
        if (this.isClosed()) {
            if (this.window) {
                this.window.style.display = "block";
            }
            else {
                throw new Error("The window is not built.");
            }
        }
    }
    /**
     * Kills the window. This action is irreversible.
     */
    kill() {
        if (!this.window)
            throw new Error("The window is not built.");
        if (this.draggable) {
            var dragParentElement = this.window.parentElement;
            if (dragParentElement) {
                this.parent.removeChild(dragParentElement);
            }
            else {
                throw new Error("Cannot kill the window. The window does not have a parent element.");
            }
        }
        else {
            this.parent.removeChild(this.window);
        }
        this.killCallback();
    }
    /**
     * Returns true if the window is close, false otherwise.
     * @returns {boolean} True if the window is closed.
     */
    isClosed() {
        if (this.window) {
            return this.window.style.display === "none";
        }
        else {
            throw new Error("The window is not built.");
        }
    }
    /**
     * Defines the function to call every time we minimize the window.
     * @param callback The function to call.
     */
    onMinify(callback) {
        this.minCallback = callback;
    }
    /**
     * Defines the function to call every time we extend the window.
     * @param callback The function to call.
     */
    onExtension(callback) {
        this.extensionCallback = callback;
    }
    /**
     * Defines the function to call every time we close the window.
     * @param callback The function to call.
     */
    onClose(callback) {
        this.closeCallback = callback;
    }
    /**
     * Defines the function to call every time we kill the window.
     * @param callback The function to call.
     */
    onKill(callback) {
        this.killCallback = callback;
    }
    /**
     * Defines the parent element in which to put the window.
     * @param {HTMLElement} parent The parent element in which to put the window.
     */
    setParent(parent) {
        this.parent = parent;
    }
    /**
     * Makes the window draggable or not.
     * @param {boolean} draggable True to make the window draggable.
     */
    setDraggable(draggable) {
        if (draggable === false) {
            if (this.status === 1) {
                this.extend();
            }
            // if the draggable property is already set to true
            this._hideDraggable();
            // disable it
            this.draggable = false;
            this._disableAbsolutePosition();
        }
        else if (draggable === true) {
            // if this is the first time that we set the draggable property to true
            // & if we do it after `build()`:
            if (this.window && this.window.parentElement) {
                var parent = this.window.parentElement;
                if (parent.className !== "tooltip drag") {
                    new Dragger(this.window);
                }
            }
            this.draggable = true;
            this._enableAbsolutePosition();
            this._resetDraggable();
        }
    }
    /**
     * Makes the window resizable or not.
     * If the window is minimized (status === 1), then `extend()` is called.
     * @param {boolean} resizable True to make the window resizable.
     */
    setResizable(resizable) {
        if (this.status === 1) {
            this.extend();
        }
        if (resizable === true) {
            this.resizable = true;
            if (this.window) {
                this.window.style.resize = "both";
            }
        }
        else if (resizable === false) {
            this.resizable = false;
            if (this.window) {
                this.window.style.resize = "none";
            }
        }
    }
    /**
     * Sets the title of the window (in the menu bar).
     * @param {string} title The new title of the window.
     */
    setTitle(title) {
        this.title = title;
        if (this.window) {
            var titleElement = this.window.querySelector(".window-title");
            if (titleElement) {
                titleElement.textContent = this.title;
            }
            else {
                throw new Error("The window was not built correctly.");
            }
        }
    }
    /**
     * Sets the width of the window.
     * @param {number} width The width of the window.
     */
    setWidth(width) {
        this.width = width;
        if (this.window) {
            this.window.style.width = this.width + "px";
        }
    }
    /**
     * Sets the height of the window.
     * @param {number} height The height of the window.
     */
    setHeight(height) {
        this.height = height;
        if (this.window) {
            this.window.style.height = this.height + "px";
        }
    }
    /**
     * Sets the minimum width of the window.
     * @param {number} minWidth The minimum width.
     */
    setMinWidth(minWidth) {
        this.minWidth = minWidth;
    }
    /**
     * Sets the minimum height of the window.
     * @param {number} minHeight The minimum height.
     */
    setMinHeight(minHeight) {
        this.minHeight = minHeight;
    }
    /**
     * Applies to the window the general styles.
     */
    applyStyles() {
        if (this.window) {
            this.window.style.minWidth = this.minWidth + "px";
            this.window.style.minHeight = this.minHeight + "px";
            this.window.style.color = this.colors.text;
            this.window.style.backgroundColor = this.colors.background;
            var menubar = this.window.querySelector(".window-bar");
            menubar.style.backgroundColor = this.colors.menubarBackground;
            menubar.style.color = this.colors.menubarColor;
        }
        else {
            throw new Error("The window is not built.");
        }
    }
    /**
     * Builds the window.
     * @param {string} bodyTemplate The body template to generate (it has to correspond with the HTMLBuilder syntax).
     */
    build(bodyTemplate = "") {
        this.builder.setParent(this.parent);
        var maintemplate = `
			div.window#${this.key}
				>div.window-bar
					>>div.window-container-title
						>>>span.window-title(${this.title})
					>>div.window-main-buttons
						>>>button(&#150;)[type=button]@minify
						>>>button(&#8597;)[type=button; disabled]@extend
						>>>button(&times;)[type=button]@close
				>div.window-body
		`;
        if (bodyTemplate.length > 0) {
            maintemplate += this.builder.indentTemplate(bodyTemplate, 2);
        }
        this.builder.generate(maintemplate);
        this.window = document.querySelector("#" + this.key);
        // we don't want to reset the width & the height when calling `applyStyles()`
        this.setHeight(this.height);
        this.setWidth(this.width);
        // apply the general styles
        this.applyStyles();
        this.setResizable(this.resizable);
        if (this.draggable === true) {
            new Dragger(this.window);
        }
        else {
            this.disableButton(0);
        }
    }
}
/**
 * A tool that allows you to generate HTML content from a template in an optimised way.
 * @class
 */
class HTMLBuilder {
    /**
     * @constructs HTMLBuilder
     * @param {HTMLElement} parent The parent in which to put the generated elements.
     */
    constructor(parent) {
        /**
         * The regular expression used to parse a template.
         * @type {RegExp}
         * @constant
         * @private
         */
        this.REGEX = /(\w+)((?:\.[\w-]*)*)*(#[\w-]*)?(?:\((.*)\))?(?:\[(.*)\])?(?:\@([\w;]*))*/;
        /**
         * The symbol uses to separate different attributes.
         * @type {string}
         * @private
         */
        this.SYMBOL_BETWEEN_ATTRIBUTES = ";";
        /**
         * The list of all the events.
         * @private
         */
        this.EVENTS = [];
        this.parent = parent || document.body;
    }
    /**
     * Changes the parent element.
     *
     * @param parent The new parent element in which to put the generated elements.
     * @public
     */
    setParent(parent) {
        this.parent = parent;
    }
    /**
     * Registers an event to use in a template. Those events are available for all the templates.
     *
     * @param {{name: string, type: string, callback: Function, options: any}} event The event to register.
     * @public
     */
    bindEvent(event) {
        if (!event.name)
            throw new Error("bindEvent(): cannot bind an event without a name.");
        if (!event.type)
            throw new Error("bindEvent(): cannot bind an event without a precise type.");
        if (!event.callback)
            throw new Error("bindEvent(): cannot bind an event without a callback function.");
        // @ts-ignore
        if (event.name.startsWith("on")) {
            event.name = event.name.replace("on", "");
        }
        this.EVENTS.push(event);
    }
    /**
     * Changes the symbol that separates the attributes inside brackets.
     *
     * @param {string} symbol The new symbol.
     * @public
     * @example `
     *      changeSymbolBetweenAttributes('/')
     *      => [attr1=et / attr2=voil??]
     * `
     */
    changeSymbolBetweenAttributes(symbol) {
        this.SYMBOL_BETWEEN_ATTRIBUTES = symbol;
    }
    /**
     * Indents a template in order to concatenate it with another one.
     * @param {string} template The template to indent.
     * @param {number} indentation The level of indentation (by default 1).
     * @returns {string} The new template.
     * @since 1.0.3
     */
    indentTemplate(template, indentation = 1) {
        var newTemplate = "";
        var lines = this._extractLinesFrom(template);
        for (var line of lines) {
            // @ts-ignore
            newTemplate += ">".repeat(indentation) + line + "\n"; // \n to add more lines
        }
        return newTemplate.trim();
    }
    /**
     * Gets the indentation level of a line.
     *
     * @param {string} line The line to parse.
     * @return {number} The level of indentation.
     * @private
     */
    _level(line) {
        var level = 0;
        for (var i = 0; i < line.length; i++) {
            if (line[i] !== ">") {
                break;
            }
            else {
                level++;
            }
        }
        return level;
    }
    /**
     * Extracts the different lines of a template in order to analyse them individually.
     *
     * @param {string} template The template of the HTML elements.
     * @return {Array<string>} The lines from a template.
     * @private
     */
    _extractLinesFrom(template) {
        var lines = template.trim().split("\n");
        for (var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].trim();
        }
        return lines;
    }
    /**
     * Decodes HTML entities like `&amp;` etc.
     *
     * @param {string} content The content to decode.
     * @return {string} The decoded content.
     * @private
     * {@link https://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it/7394787#7394787}
     */
    _decodeHTMLEntities(content) {
        var txt = document.createElement("textarea");
        txt.innerHTML = content;
        return txt.value;
    }
    /**
     * Gets an event according to its name.
     *
     * @param name The name of the event we are looking for.
     * @return {{name: string, type: string, callback: Function, options: any}} The event we are looking for.
     * @private
     */
    _searchForEvent(name) {
        for (var event of this.EVENTS) {
            if (name === event.name) {
                return event;
            }
        }
        return null;
    }
    /**
     * Generates a new HTML element from a line (you must use a specific syntax & order).
     *
     * @param {string} line The line to parse.
     * @return {HTMLElement} The generated HTML element.
     * @private
     * @throws If there is no tagname.
     */
    _createElementFromLine(line) {
        // Be careful when you use exec() with the global flag
        // If you use a global flag, then set the lastIndex property of the regex to 0 (its initial value).
        // this.REGEX.lastIndex = 0;
        //
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
        var matches = this.REGEX.exec(line) || [];
        var tagname = matches[1] || null;
        var classes = matches[2] ? matches[2].split(".").filter((v) => v !== "") : null;
        var id = matches[3] ? matches[3].replace("#", "") : null;
        var content = matches[4] || null;
        var attributes = matches[5] ? matches[5].split(this.SYMBOL_BETWEEN_ATTRIBUTES) : null;
        var events = matches[6] ? matches[6].split(";").filter((v) => v !== "") : null;
        if (!tagname) {
            throw new Error('HTMLBuilder: unable to parse a line: "' + line + '"');
        }
        var element = document.createElement(tagname);
        if (classes) {
            for (var c of classes) {
                if (/\d/.test(c[0])) {
                    console.error("HTMLBuilder: invalid syntax for class name '" + c + "'");
                    continue;
                }
                element.classList.add(c);
            }
        }
        if (attributes) {
            for (var attr of attributes) {
                if (/\d/.test(attr[0])) {
                    console.error("HTMLBuilder: invalid syntax for attribute name '" + attr + "'");
                    continue;
                }
                attr = attr.trim();
                if (attr.indexOf("=") !== -1) {
                    var name = attr.split("=")[0];
                    var value = attr.split("=")[1];
                    element.setAttribute(name, value);
                }
                else {
                    element.setAttribute(attr, "");
                }
            }
        }
        if (id)
            element.id = id;
        if (content)
            element.appendChild(document.createTextNode(this._decodeHTMLEntities(content)));
        if (events) {
            for (var name of events) {
                if (/\d/.test(name[0])) {
                    console.error("HTMLBuilder: invalid syntax for event name '" + name + "'");
                    continue;
                }
                var event = this._searchForEvent(name);
                if (event) {
                    // @ts-ignore
                    element.addEventListener(event.type, event.callback, event.options);
                }
            }
        }
        return element;
    }
    /**
     * Gets the maximum level of indentation.
     *
     * @param {Array} children The list of children of a main element from a template.
     * @return {number} The maximum level of indentation of a list of children.
     * @private
     */
    _maxLevel(children) {
        var max = children[0][1];
        for (var child of children) {
            var level = child[1];
            if (level > max) {
                max = level;
            }
        }
        return max;
    }
    /**
     * Gets the index of the deepest element. The deepest element is the last child to have the highest level of indentation.
     *
     * @param {Array} children The list of children of a main element from a template.
     * @return {number} The index of the deepest child.
     * @private
     */
    _getIndexOfDeepestElement(children) {
        var max = this._maxLevel(children);
        if (max === 1) {
            // If all the elements are on the closest possible level (1),
            // then we want to append the last child of the list.
            // Remember that we do a prepend() not an append(),
            // therefore the last one must go first in order to keep the right order
            return children.length - 1;
        }
        var lastIndex = 1;
        for (var i = 0; i < children.length; i++) {
            var level = children[i][1];
            if (level === max) {
                lastIndex = i;
            }
        }
        return lastIndex;
    }
    /**
     * Gets the index of the nearest element of the deepest one. This child is the parent element of the deepest one.
     *
     * @param indexOfDeepest The index of the deepest element.
     * @param children The list of children of a main element from a template.
     * @return {number} The index of the nearest child.
     * @private
     */
    _getIndexOfNearestParentElementOf(indexOfDeepest, children) {
        var deepest = children[indexOfDeepest][1];
        var lastIndex = null;
        for (var i = 0; i < indexOfDeepest; i++) {
            var level = children[i][1];
            if (level === deepest - 1) {
                lastIndex = i;
            }
        }
        return lastIndex;
    }
    /**
     * Reproduces a template in full HTML structure and adds it to the parent as a child (there can be several children).
     *
     * @param {string} template The template of your HTML structure.
     * @public
     */
    generate(template) {
        if (template.trim().length === 0)
            return;
        // We read all the lines in order to identify the main HTML elements,
        // i.e. those without indentation
        var lines = this._extractLinesFrom(template);
        var mainLines = [];
        var i = 0;
        var k = 0;
        for (i = 0; i < lines.length; i++) {
            var line = lines[i];
            var level = this._level(line);
            if (level === 0) {
                mainLines.push([line, i]); // the line & its index among all the lines
            }
        }
        // We read the next lines and we create an array [HTMLElement, its level] that we save
        // in a list of children, for each main element.
        for (i = 0; i < mainLines.length; i++) {
            var childrenElements = [];
            var mainLine = mainLines[i][0];
            var mainLevel = mainLines[i][1];
            var nextMainLevel = mainLines[i + 1] ? mainLines[i + 1][1] : lines.length;
            var mainElement = this._createElementFromLine(mainLine);
            // starts at the position of the main line
            // ends at the position of the next main line
            // in order to get only its children
            for (k = mainLevel + 1; k < nextMainLevel; k++) {
                var line = lines[k];
                var child = this._createElementFromLine(line);
                childrenElements.push([child, this._level(line)]);
            }
            // We search for the deepest element (i.e. the one with the highest level of indentation)
            // This deepest has as parent the nearest element which has a level of indentation equal to "child's level - 1"
            // We call it the "nearest parent element".
            // Then, because we read the list of children from bottom to top, we prepend() in order to keep the right order.
            // Indeed, append() would reverse the right order.
            while (childrenElements.length > 0) {
                var indexOfDeepest = this._getIndexOfDeepestElement(childrenElements);
                var indexOfNearestParent = this._getIndexOfNearestParentElementOf(indexOfDeepest, childrenElements);
                // Don't forget to specify "!== null" because indexOfNearestParent can be 0 (= false)
                indexOfNearestParent !== null
                    ? childrenElements[indexOfNearestParent][0].prepend(childrenElements[indexOfDeepest][0])
                    : mainElement.prepend(childrenElements[indexOfDeepest][0]);
                childrenElements.splice(indexOfDeepest, 1);
            }
            this.parent.appendChild(mainElement);
        }
    }
}
