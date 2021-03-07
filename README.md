# WindowStructure

Creates a software-like structure for the web. This structure is draggable, resizable and looks a lot like Windows softwares.

## Get Started

First of all, in order to optimize the creation of the HTML structure, **WindowStructure has as dependency:** `HTMLBuilder()`**, v1.0.5**. **This dependency is directly implemented in the source code**.

Therefore, all you need to do is add the source code that you can find in the `src` folder, available in TypeScript and JavaScript.

```html
<script src="src/WindowStructure.js"></script>
```

Don't forget to import the CSS:

```html
<link rel="stylesheet" href="src/window-structure-style.css">
```

Perfect, now let's create a window.

```javascript
var structure = new WindowStructure();
structure.build();
```

## Customize the window

By default, a window has `document.body` as parent element. You can change that with the method `setParent()` (to call before `build()`).

```javascript
var container = document.querySelector("#container");
var structure = new WindowStructure("Example of a title");
structure.setParent(container);
structure.build();
```

Other methods:

```javascript
var structure = new WindowStructure();
structure.setTitle("Window"); // default value
structure.setDraggable(true); // default value
structure.setResizable(true); // default value
structure.setMinWidth(300); // default value
structure.setMinHeight(100); // default value
structure.setWidth(800); // default value
structure.setHeight(462); // default value
structure.build();
```

You can change the colors too. However, for this kind of changes, **if the window is already built**, you will have to use `applyStyles()`:

```javascript
var structure = new WindowStructure("Example of a title");
structure.build(); // you can build the structure before...

// change your styles:
structure.colors = {
    text: "#ccc", // default value
    background: "#0c0c0c", // default value
    menubarBackground: "#000", // default value
    menubarColor: "#fff", // default
};

// apply your modifications
structure.applyStyles();

```

**Note:** `setTitle()`, `setHeight()`, `setWidth()`, `setDraggable()` & `setResizable()` don't require `applyStyles()`.

The constructor has a lot of parameters (that's why I created all these methods):

```javascript
// with all the default values:
// (title, width, height, draggable, resizable, parent)
var structure = new WindowStructure("Window", 800, 462, true, true, document.body);
structure.build();
```

If you want to modify the CSS properties by your own:

```javascript
structure.window.style.color = "red";
// structure.window is the window as an HTML element.
```

To further customise the window, you'll need to modify the CSS file.

## A dynamic window

In the menu bar, there are 3 buttons (entitled 0, 1 or 2 from left to right). These buttons have a click event listener. Trigger these events with the following methods:

```javascript
var structure = new WindowStructure("Example of a title");
structure.build();

structure.minify(); // minimize the window
structure.extend(); // extend the window
structure.close(); // close the window (display:none;)
structure.kill(); // kill the window (destructive and irreversible action).
```

If you want the window to reappear, then use `reappear()`.

```javascript
structure.close(); // close the window
structure.reappear(); // the window is coming back :)
```

You can check whether the window is closed or not:

```javascript
var isclosed = structure.isClosed(); // boolean
```

In order to customize these methods, you can add callbacks:

```javascript
var structure = new WindowStructure("Example of a title");

structure.onMinify(() => console.log("minimized"));
structure.onExtension(() => console.log("extended"));
structure.onClose(() => console.log("closed"));
structure.onKill(() => console.log("killed"));

structure.build();
```

Finally, you have to know that when you minimize the window, it remains on the screen. In fact, we only put the window in the lower left corner by default. Customize the location of the window this way:

```javascript
var structure = new WindowStructure("Example of a title");

structure.minimizationOptions = {
    xSide: "left", // default value
    ySide: "bottom", // default value
    posFromX: 20, // default value
    posFromY: 20, // default value
};

// therefore, by default:
// this.window.style.left = 20;
// this.window.style.bottom = 20;

// you can pass these arguments to the function directly
structure.minify("left", "bottom", 20, 20);

structure.build();
```

Or you can change the method. However, don't do it if you don't know what you're doing. Look at the source code.

```javascript
var structure = new WindowStructure("Example of a title");

structure.minify = function() {
    // do your job...
};

structure.build();
```

By default, when you use `minify()`, then it disables the same button because, once the window has been minimized, it cannot be re-minified. Same thing when you use `extend()`: it deactivates the same button & activates the other to minimize the window again.

In other words:

```javascript
structure.enableButton(0); // activates the button 0 (minify).
structure.enableButton(1); // activates the button 1 (extend).

structure.disableButton(0); // deactivates the button 0 (minify).
structure.disableButton(1); // deactivates the button 1 (extend).

// 2 = closing button
```

Finally, when the window is not draggable `setDraggable(false)`, you can't use `extend()` or `minify()`. Besides, you can't drag the window if it is minified. Indeed, the `minify()` method temporarily disables the draggable property and the resizable property.

## Fullscreen mode

You can activate the fullscreen mode:

```javascript
structure.requestFullscreen(); // true if successful
```

To deactivate the fullscreen mode:

```javascript
structure.exitFullscreen(); // true if successful
```

## Build the content of the window

WindowStructure only gives you a model. You now have to add the content inside the `body` of the window. Do that with `build()`:

**Warning**: `build()` uses the syntax of `HTMLBuilder`. If you don't know it, I invite you to take a look at its repository: [here](https://github.com/CodoPixel/HTMLBuilder).

```javascript
var structure = new WindowStructure();

// register an event
structure.builder.bindEvent({
    name: 'thing',
    type: 'click',
    callback: function(e) {
        console.log("You clicked on a thing!");
    }
});

// build your window with additional content
structure.build(`
    h1(It's my own window!)
    div
        >button(Click to do a thing)[type=button]@thing
`);
```

Access the builder this way:

```javascript
var structure = new WindowStructure();
var builder = structure.builder;
```

## License

MIT License