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

// Delete an expense
program
    .command("delete")
    .description("Delete an expense by id")
    .requiredOption("--id <id>", "Expense id")
    .action((options) => {
        const {id} = options;
        const expenses = loadExpenses();
        const filteredExpenses = expenses.filter(expense => expense.id !== parseInt(id));

        if (filteredExpenses.length === expenses.length) {
            console.log(chalk.red("Expense not found"));
            return;
        }

        saveExpenses(filteredExpenses);
        console.log(chalk.green("Expense deleted successfully"));
    })

// show total summary
program
    .command("summary")
    .description("Show total expenses")
    .action(()=>{
        const expenses = loadExpenses();
        if (expenses.length === 0) {
            console.log(chalk.yellow("No expenses found"));
            return;
        }
        const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
        console.log(chalk.blue(`Total expenses: ${total}`));
    })

// show summary by month
program
    .command("summary-month")
    .description("Show total expenses for a specific month")
    .requiredOption("--month <month>", "Month (1-12)")
    .action((options)=>{
        const {month} = options;
        const expenses = loadExpenses();
        if (expenses.length === 0) {
            console.log(chalk.yellow("No expenses found"));
            return;
        }
        const filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() + 1 === parseInt(month);
        });

        if (filteredExpenses.length === 0) {
            console.log(chalk.red("No expenses found for the specified month"));
            return;
        }

        const total = filteredExpenses.reduce((acc, expense) => acc + Number(expense.amount),0)
        console.log(chalk.blue(`Total expenses for month ${month}: ${total}`));
    })

program.parse(process.argv);   // This activates the command-line interface.

