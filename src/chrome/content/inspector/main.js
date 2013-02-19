(function () {


function DIOnMouseOver(evt)
{
    element = evt.target;   // not IE

    // set the border around the element
    element.style.borderWidth = '2px';
    element.style.borderStyle = 'solid';
    element.style.borderColor = '#f00';
}


function DIOnMouseOut(evt)
{
    evt.target.style.borderStyle = 'none';
}


function DIOnClick(evt)
{
    var selection = evt.target.innerHTML;

    alert('Element is: ' + evt.target.toString() + '\n\nSelection is:\n\n' + selection);
    return false;
}


document.addEventListener("mouseover", DIOnMouseOver, true);
document.addEventListener("mouseout", DIOnMouseOut, true);
document.addEventListener("click", DIOnClick, true);

})();