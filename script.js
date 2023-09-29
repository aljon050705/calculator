//const displayScreenWidth = document.querySelector('.display-screen').offsetWidth;
const displayScreen = document.querySelector('.display-screen');
const display = document.querySelector('.display-screen-expression');
const displayStartingFontSize = getComputedStyle(display).fontSize;
const result = document.querySelector('.display-screen-result');
const resultStartingFontSize = getComputedStyle(result).fontSize;
const realtimeCalculation = document.querySelector('.realtime-checkbox');
realtimeCalculation.checked = true;

let expression = [""];

function fontDynamicResizer(dom, containerDom, maxFontSize) {
    if (dom.offsetWidth >= containerDom.offsetWidth || dom.offsetHeight >= containerDom.offsetHeight*0.6) {
        while (dom.offsetWidth >= containerDom.offsetWidth || dom.offsetHeight >= containerDom.offsetHeight/2) {
                dom.style.fontSize = parseInt(getComputedStyle(dom).fontSize)-1+"px";
        }
    } else if (parseInt(getComputedStyle(dom).fontSize) <  parseInt(maxFontSize)) {
        while ((parseInt(getComputedStyle(dom).fontSize) < parseInt(maxFontSize)) && 
        (dom.offsetWidth < containerDom.offsetWidth*0.9)) {
            dom.style.fontSize = parseInt(getComputedStyle(dom).fontSize)+1+"px";
        }
    }
}
function indexOfMultiple(string, ...keywords) {
    let lowestIndex = string.length + 1;
    keywords.forEach((keyword) => {
        index = string.indexOf(`${keyword}`)
        if (index < lowestIndex && index > -1) {
            lowestIndex = index;
        }
    });
    if (lowestIndex == string.length + 1) return -1;
    return lowestIndex;
}

function updateDisplay() {
    console.log(expression);
    if (expression[0] == "") { 
        display.textContent = "Enter a number";
        return;
    }
    display.textContent = expression.join(' ');

    fontDynamicResizer(display,displayScreen, displayStartingFontSize);
    fontDynamicResizer(result,displayScreen, resultStartingFontSize);
}

function updateResult(calculation) {
    result.textContent = calculation.join(' ');
    fontDynamicResizer(result,displayScreen, resultStartingFontSize);
}

//button functions
function addNumber(e) {
    let content = e.target.textContent;
    let last = expression[expression.length-1];

    if (e instanceof KeyboardEvent) content = e.key;

    if (last == "=") expression = [`${result.textContent}`];

    if (expression.length > 1 && /[+\-÷*/x](?![0-9])/g.test(expression[expression.length-1])) {
        console.log('Operator detected, creating new item');
        expression.push(content);
        updateDisplay();
    } else if (last == " " || last == "" || last == "NaN" || last == "Infinity") {
        expression[expression.length-1] = content;
        updateDisplay();
    } else {
        expression[expression.length-1] += content;
    }
    if (realtimeCalculation.checked) evaluate(expression);
    updateDisplay();
}

function addOperator(e) {
    let content = e.target.textContent;

    if (e instanceof KeyboardEvent) content = e.key;

    if (expression[expression.length-1] == "=") expression = [`${result.textContent}`];

    if (!/[0-9]/g.test(expression[expression.length-1])) {
        console.log('cant add operator, no number before');
        return;
    }
    expression.push(content);
    expression.push("");
    updateDisplay();
}

function backspace() {
    let last = expression[expression.length-1];
    console.log(expression)
    if (last == "=") {
        expression = expression.slice(0,-1);
    } else if (expression.length > 1 && last.length <= 0) {
        expression = expression.slice(0,-2);
    } else if (last.length > 0) {
        console.log(last)
        console.log('erasing')
        expression[expression.length-1] = last.slice(0,-1);
    } 
    if (realtimeCalculation.checked) evaluate(expression);
    updateDisplay();
    return;
}

function clear() {
    expression = [""];
    updateDisplay();
}

function negate() {
    let last = expression[expression.length-1];

    
    if (last.length == 0) {
        return;
    } else if (last < 0) {
        expression[expression.length-1] = last.replace("-","");
    } else if (last >= 0) {
        expression[expression.length-1] = "-" + last;
    }
    console.log(last)
    if (realtimeCalculation.checked) evaluate(expression);
    updateDisplay();
}

//recursive evaluator
function evaluate(givenExpression) {
    let calculation = Array.from(givenExpression);
    function updateIndices() {
        multiplyIndex = indexOfMultiple(calculation,'x','*');
        divideIndex = indexOfMultiple(calculation,'/','÷');
        plusIndex = calculation.indexOf('+');
        minusIndex = calculation.indexOf('-');
    }

    function calculateAndSplice(index,operator) {
        switch (operator) {
            case 'multiply':
                calculatedValue = (+calculation[index-1]) * (+calculation[index+1]);
                break;
            case 'divide':
                calculatedValue = (+calculation[index-1]) / (+calculation[index+1]);
                break;
            case 'plus':
                calculatedValue = (+calculation[index-1]) + (+calculation[index+1]);
                break;
            case 'minus':
                calculatedValue = (+calculation[index-1]) - (+calculation[index+1]);
                break;
        }
        calculation.splice(index-1, 3, `${calculatedValue}`);
        console.log(calculation);
        updateIndices();
    }
    
    if (calculation.length <= 1) {
        console.log('Reached base case')
        //console.log(expression)
        //expression = calculation;
        //if (expression[expression.length-1] != "=") expression.push("=");
        if (!(realtimeCalculation.checked)) expression.push("=");
        updateDisplay();
        updateResult(calculation);
        return;
    }

    let calculatedValue = 0;
    console.log('recursing')

    updateIndices();

    if (multiplyIndex > -1 || divideIndex > -1) {
        if (divideIndex == -1) {
            calculateAndSplice(multiplyIndex,"multiply");
        } else if (multiplyIndex == -1) {
            calculateAndSplice(divideIndex,"divide");
        } else if (multiplyIndex < divideIndex) {
            calculateAndSplice(multiplyIndex,"multiply");
            calculateAndSplice(divideIndex,"divide");
        } else if (divideIndex < multiplyIndex) {
            calculateAndSplice(divideIndex,"divide");
            calculateAndSplice(multiplyIndex,"multiply");
        }
        return evaluate(calculation);
    }

    if (plusIndex > -1 || minusIndex > -1) {
        if (minusIndex == -1) {
            calculateAndSplice(plusIndex,"plus");
        } else if (plusIndex == -1) {
            calculateAndSplice(minusIndex,"minus");
        } else if (plusIndex < minusIndex) {
            calculateAndSplice(plusIndex,"plus");
            calculateAndSplice(minusIndex,"minus");
        } else if (minusIndex < plusIndex) {
            calculateAndSplice(minusIndex,"minus");
            calculateAndSplice(plusIndex,"plus");
        }
        return evaluate(calculation);
    }
    //return;
}


//EVENT LISTENERS
for (let i = 0; i <= 9; i++) {
    let buttonNumber = document.querySelector(`.calculator-button-${i}`);
    buttonNumber.addEventListener('click', addNumber)
}

document.querySelector('.decimal').addEventListener('click', addNumber);


['multiply','divide','plus','minus'].forEach(element => {
    let operatorButton = document.querySelector(`.${element}`);
    operatorButton.addEventListener('click', addOperator);
});

document.querySelector('.delete').addEventListener('click', backspace)
document.querySelector('.clear').addEventListener('click', clear)
document.querySelector('.negate').addEventListener('click', negate)
document.querySelector('.equals').addEventListener('click', () => {
    console.log("Evaluating " + display.textContent);
    console.log(expression);
    evaluate(expression);
});

    //KEYBOARD EVENTS
function addStylePressed(e) {
    target = document.querySelector(`[data-key="${e.key}"]`);
    if (target) target.classList.add('pressed');
}

window.addEventListener('keydown', (e) => {
    if (/\b\d+\b(?!F)/.test(e.key)) {
        addStylePressed(e);
        console.log(e.key)
        addNumber(e);
    } if (/[+\-/÷*]/.test(e.key)) {
        addStylePressed(e);
        addOperator(e);
    } if (e.key == "Enter" || e.key == "=") {
        e = {...e, key: "="};
        addStylePressed(e);
        console.log("Evaluating " + display.textContent);
        evaluate(expression);
        updateDisplay();
    } if (e.key == "Backspace") {
        addStylePressed(e);
        backspace();
    }
});

window.addEventListener('keyup', (e) => {
    key = document.querySelector(`[data-key="${e.key}"]`);
    if (e.key == "Enter") key = document.querySelector(`[data-key="="]`);
    if (key) key.classList.remove('pressed');
});