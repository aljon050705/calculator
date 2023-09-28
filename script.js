display = document.querySelector('.display-screen-expression')
result = document.querySelector('.display-screen-result')
console.log(display)
let expression = [""];

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
    if (expression[0] == "") { 
        display.textContent = "Enter a number";
        return;
    }
    display.textContent = expression.join(' ');
    console.log(expression);
}

function updateResult(calculation) {
    result.textContent = calculation.join(' ');;
}

//button functions
function addNumber(e) {
    let content = e.target.textContent;
    let last = expression[expression.length-1];

    if (e instanceof KeyboardEvent) content = e.key;

    if (expression.length > 1 && /(?:^|[^+\-÷*x\s])[-+÷*x]/.test(expression[expression.length-1])
     && !/(-(?![+\-*×÷]))|[+\-*×÷]/g) {
        console.log('Operator detected, creating new item');
        expression.push(content);
        updateDisplay();
        return;
    }
    if (last == " " || last == "" || last == "NaN" || last == "Infinity") {
        expression[expression.length-1] = content;
        updateDisplay();
        return;
    }
    expression[expression.length-1] += content;
    updateDisplay();
}

function addOperator(e) {
    let content = e.target.textContent;

    if (e instanceof KeyboardEvent) content = e.key;

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
    console.log(last)
    console.log(expression.length)
    if (last.length <= 0 && expression.length > 1) {
        expression = expression.slice(0,-2);
    } else if (last.length > 0) {
        console.log(last)
        console.log('erasing')
        expression[expression.length-1] = last.slice(0,-1);
    } 
    updateDisplay();
    return;
}

function clear() {
    expression = [""];
    updateDisplay();
}

function negate() {
    let last = expression[expression.length-1];

    console.log(last)
    if (last < 0) {
        expression[expression.length-1] = last.replace("-","");
    } else if (last >= 0) {
        expression[expression.length-1] = "-" + last;
    }
    updateDisplay();
}

//recursive evaluator
function evaluate(calculation) {
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
        expression = calculation;
        //updateDisplay();
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
window.addEventListener('keydown', (e) => {
    if (/\b\d+\b(?!F)/.test(e.key)) {
        console.log(e.key)
        addNumber(e);
    }
    if (/[+\-/÷*]/.test(e.key)) {
        addOperator(e);
    }
    if (e.key == "Enter") {
        console.log("Evaluating " + display.textContent);
        console.log(expression);
        evaluate(expression);
    }
    if (e.key == "Backspace") {
        backspace();
    }
});