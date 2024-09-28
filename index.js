const buttonsArr = document.getElementsByTagName('button');
const screen = document.querySelector('.calculator__screen');
let screenText = '';
screen.textContent = screenText;
Array.from(buttonsArr).forEach((button) => {
  button.addEventListener('click', function (event) {
    const clickedButton = event.target;

    if (clickedButton.tagName === 'BUTTON') {
      let buttonText = clickedButton.textContent;

      switch (buttonText) {
        case 'AC':
          screenText = ''; // очищаем поле
          break;
        case '←':
          screenText = screenText.slice(0, -1); // стираем с поля один знак
          break;
        case '=':
          {
            if (isNaN(screenText.at(-1))) {
              screenText = screenText.slice(0, -1);
            } // убираем знак в конце который не нужен
            screenText = calculateExpression(screenText);
          } // вычисляем значение
          break;
        case '.': {
          const lastOperatorIndex = findLastIndex(screenText) || -1;
          const lastNumber = screenText.slice(lastOperatorIndex + 1);
          if (!lastNumber.includes('.') && lastOperatorIndex !== screenText.length - 1) {
            screenText += '.';
          } // не даем ставить больше одной точки
          break;
        }
        case '0': {
          const lastOperatorIndex = findLastIndex(screenText) || -1;
          const lastNumber = screenText.slice(lastOperatorIndex + 1);
          if (lastNumber === '-0' || lastNumber === '0') {
            break;
          }
          screenText += '0';
          break; // нельзя ставить больше одного нуля в начале без точки
        }

        default:
          if (isNaN(Number(buttonText))) {
            // проверка знаков

            if (
              buttonText !== '-' &&
              (screenText.length === 0 || (screenText.startsWith('-') && screenText.length <= 1))
            ) {
              break;
            } //нельзя ставить знаки помимо минуса если ничего не введено

            if (buttonText === '%' && screenText.includes('%')) {
              break;
            } // нельзя ставить div дважды

            if (
              Number(screenText.at(-1)) &&
              Array.from(screenText).filter((value) => isNaN(Number(value))).length > 0
            ) {
              screenText = calculateExpression(screenText) + buttonText;
            } // если ввели полное выражение и пытаемся ввести знак для третьего то происходит вычисление

            if (isNaN(Number(screenText[screenText.length - 1]))) {
              screenText = screenText.slice(0, -1) + buttonText;
              break;
            } // меняем знак если вводим новый
          }

          screenText += buttonText;
      }
      screen.textContent = screenText;
    }
  });
});

function findLastIndex(str) {
  let regex = /[+\-x/%]/;
  const chars = Array.from(str);
  const indexes = chars
    .map((char, index) => (regex.test(char) ? index : -1))
    .filter((index) => index !== -1);

  return indexes.length > 0 ? indexes[indexes.length - 1] : null;
} // ищем индекс последнего знака

function onlyZero(str) {
  return /^0+$/.test(str);
} // проверка на то введены в строку только нули или нет

function calculateExpression(expression) {
  if (!expression) {
    return '';
  } // проверка пустая ли строка

  expression = expression.replace(/x/g, '*'); // меняем знак х на *

  expression = expression.replace(/(-?\d+(\.\d+)?)%(-?\d+(\.\d+)?)/g, (match, num1, _, num2) => {
    num1 = parseFloat(num1);
    num2 = parseFloat(num2);
    return num1 % num2;
  }); // логика %

  // логика умножения и деления
  expression = expression
    .replace(/(-?\d+(\.\d+)?)\*(-?\d+(\.\d+)?)/g, (match, num1, _, num2) => {
      num1 = parseFloat(num1);
      num2 = parseFloat(num2);
      return num1 * num2;
    })
    .replace(/(-?\d+(\.\d+)?)\/(-?\d+(\.\d+)?)/g, (match, num1, _, num2) => {
      num1 = parseFloat(num1);
      num2 = parseFloat(num2);
      if (num1 === 0 || num2 === 0) return 0; // нельзя делить на ноль
      return num1 / num2;
    });

  // логика сложения и вычитания
  const parts = expression.split(/(?=[+-])/);

  let result = parseFloat(parts[0]);

  for (let i = 1; i < parts.length; i++) {
    const operator = parts[i][0];
    const operand = parseFloat(parts[i].slice(1));

    if (operator === '+') {
      result += operand;
    } else if (operator === '-') {
      result -= operand;
    }
  }

  return result.toString();
} // вычисление итогового значения
