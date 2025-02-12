const { program } = require("commander");
const fs = require("fs-extra");
const chalk = require("chalk");
const path = require("path");

const FILE_PATH = path.join(__dirname,"express.json");

const loadExpenses = () => {
    try {
        return fs.readJSONSync(FILE_PATH);
    } catch (error) {
        return [];
    }
}

//Save Expenses
const saveExpenses = (expenses) => {
    fs.writeJsonSync(FILE_PATH,expenses);
}

//Generate a unique ID
const generateId = () => Math.floor(Math.random() * 10000000);

//Add Expenses
program 
    .command("add")
    .description("Add a new expense")
    .requiredOption("--description <desc>","Expense description")
    .requiredOption("--amount <amount>", "Expense amount")
    .action((options) => {
        const {description, amount} = options;
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            console.log(chalk.red("Invalid amount"));
            return;
        }
        const expenses = loadExpenses();
        const newExpense = {
            id: generateId(),
            date: new Date().toISOString().split("T")[0],
            description,
            amount: parsedAmount,
        };

        expenses.push(newExpense);
        saveExpenses(expenses);

        console.log(chalk.green(`Expense added successfully (ID: ${newExpense.id})`));
    });

// List all expenses
program
    .command("list")
    .description("List all expenses")
    .action(() => {
        const expenses = loadExpenses();
        if (expenses.length === 0) {
            console.log(chalk.yellow("No expenses found"));
            return;
        }

        console.table(expenses);
   });


program.parse(process.argv);   // This activates the command-line interface.

