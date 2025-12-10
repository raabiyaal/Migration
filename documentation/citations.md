    ## Citations

    ## zoom 
    1. ChatGPT Prompt: How do I add zoom and pan interactions to an SVG map in D3.js?

    Output

    Add Zoom & Pan Behavior (D3 v7)
    // 1. Create the zoom behavior
    const zoom = d3.zoom()
    .scaleExtent([1, 8])                 // how far you can zoom OUT → IN
    .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);
    });

    // 2. Attach zoom to the SVG
    svg.call(zoom);


    2. ChatGPT prompt:
    Which function will allow a custom zoom-in and zoom-out buttons to my D3.js map?
    I want each button to increase or decrease the zoom level by a fixed amount.
    No code

    ChatGPT said:
    zoom.scaleBy()

    # # Population
    1. For the dropdowns, I asked ChatGPT how to format age ranges with leading zeros 
    and how to write a concise .map().join("") pattern for generating <option> tags.
    It suggested using String.padStart() for formatting and the concise 
    .map(...).join("") method to build the dropdown HTML.


    2. ChatGPT prompt:
    Which function to use so that selected value stays valid when the available
    options change in JavaScript?

    Output 
    Use validation check, Array.prototype.some() 

    ## Text Helpers 

    1. ChatGPT prompt
    My dataset has column names based on metric, decade, race, sex, and age. 
    How do I generate the column key programmatically in javascript?

    Output
    function buildColumnKey(state) {
    return `${state.metric}${state.decade}${state.race}${state.sex}${state.age}`;
    }

    ## Color Scales

    1. ChatGPT prompt:
    How do I safely handle cases where min and max values might be undefined
    or NaN in JavaScript?

    Output
    To safely handle cases where min and max might be undefined, null, or NaN, 
    the standard pattern is:
    const safeMin = Number.isFinite(minVal) ? minVal : fallbackValue;
    const safeMax = Number.isFinite(maxVal) ? maxVal : fallbackValue;

    ## Data Loading
    
    1. ChatGPT prompt
    which dataset will give me counties and state boundries in javascript?

    Output

    https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json
    https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json

    ## Map Rendering
    1. ChatGPT prompt
    how do I format FIPS codes with leading zeros in js? 
    Ouput
    const fips = String(code).padStart(5, "0");

    2. ChatGPT prompt 
    how do I filter out NaN values safely in js?

    Output
    .filter(v => !Number.isNaN(v));

    ## Control Bind

    1. ChatGPT prompt:
    How do I toggle active buttons in JavaScript?

    Output
    You can loop over the buttons, remove the active class from all of them, and 
    then add it to the one that was clicked.
    A common pattern is to compare a button’s data-* attribute to the selected 
    state and use classList.toggle().

    2. How do I apply event listeners to a group of buttons using dataset attributes?

    Output
    Select all the buttons with querySelectorAll, loop through them, and attach a 
    click listener. Inside the listener you can read btn.dataset.* to update 
    or perform an action.