require("dotenv").config();

const inquirer = require("inquirer");
const express = require("express")
const pg = require("pg")
const {Pool} = require("pg");

const app = express();
const PORT = process.env.PORT || 3001

app.use(express.json());
app.use(express.urlencoded({extended: false}));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
});

pool.connect("SELECT NOW()", (error, results) => {
    if (error) {
        console.log("Error executing request");
    } else {
        console.log("Database connected successfully");
    }
});

function menuOptions() {
    inquirer
    .prompt({
        name: "menu",
        type: "list",
        choices: [
            "View Departments",
            "View Roles",
            "View Employees",
            "Add Department",
            "Add Role",
            "Add Employee",
            "Update Employee Info",
            "Exit",
        ],
    })
    .then((qs) => {
        switch(qs.menu) {
            case "View Departments":
                departmentView();
            case "View Roles":
                rolesView();
            case "View Employees":
                employeesView();
            case "Add Department":
                addDepartment();
            case "Add Role":
                addRole();
            case "Add Employee":
                addEmployee();
            case "Update Employee Info":
                updateEmployeeInfo;
            case "Exit":
                process.exit();
        }
    });
};

function departmentsView() {
    pool.query("SELECT * FROM department", (error, results) => {
        if (error) {
            console.log("Error executing request");
        } else {
            console.table(results.rows);
            menuOptions();
        }
    });
}

function rolesView() {
    const query = `
        SELECT
            r.id,
            r.title,
            r.salary,
            d.name AS department
        FROM
            role r
        JOIN
            department d ON r.department_id = d.id;
            `;
    pool.query(query, (error, results) => {
        if (error) {
            console.log("Error executing request");
        } else {
            console.table(results.rows);
            menuOptions();
        }
    });
}

function employeesView() {
    const query = `
        SELECT
            e.id,
            e.first_name,
            e.last_name,
            r.title AS role,
            d.name AS department,
            r.salary,
            e.manager_id
        FROM
            employee e
        LEFT JOIN
            role r ON e.role_id = r.id
        LEFT JOIN
            department d ON r.department_id = d.id
            `;
    pool.query(query, (error, results) => {
        if (error) {
            console.log("Error executing request");
        } else {
            console.table(results.rows);
            menuOptions();
        }
    });
}

function addDepartment() {
    inquirer
        .prompt({
            name: "name",
            type: "input",
            message: "Enter the department name:",
        })
        .then((qs) => {
            pool.query(
                "INSERT INTO department (name) VALUES ($1)",
                [qs.name],
                (error, results) => {
                    if (error) {
                        console.log("Error executing request");
                    } else {
                        console.log("Department added successfully");
                        menuOptions();
                    }
                }
            );
        });
}

function addRole() {
    const { rows } = pool.query("SELECT * FROM department");
    const departmentChoices = rows.map((department) => ({
        name: department.name,
        value: department.id,
    }));
    inquirer
        .prompt([
            {
                name: "title",
                type: "input",
                message: "Enter the role title:",
            },
            {
                name: "salary",
                type: "input",
                message: "Enter the role salary:",
            },
            {
                name: "department_id",
                type: "list",
                message: "Select the department for this role:",
                choices: departmentChoices,
            },
        ])
        .then((qs) => {
            const pstgrsQuery =
                "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)";
            const values = [qs.title, qs.salary, qs.department_id];

            pool.query(pstgrsQuery, values, (error, results) => {
                if (error) {
                    console.log("Error executing request");
                } else {
                    console.log("Role added successfully");
                }
                menuOptions();
            });
        });
}

async function addEmployee() {
    const { rows: roles } = await pool.query("SELECT * FROM role");
    const { rows: managers } = await pool.query("SELECT * FROM employee");
    const roleChoices = roles.map((role) => ({
        name: role.title,
        value: role.id,
    }));
    const managerChoices = managers.map((manager) => ({
        name: `${manager.first_name} ${manager.last_name}`,
        value: manager.id,
    }));
    inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "Enter the employee first name:",
            },
            {
                name: "lastName",
                type: "input",
                message: "Enter the employee last name:",
            },
            {
                name: "role",
                type: "list",
                message: "Select the role for this employee:",
                choices: roleChoices,
            },
            {
                name: "manager",
                type: "list",
                message: "Select the manager for this employee:",
                choices: managerChoices,
            },
        ])
        .then((qs) => {
            const pstgrsQuery =
                "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)";
            const values = [qs.firstName, qs.lastName, qs.role, qs.manager];

            pool.query(pstgrsQuery, values, (error, results) => {
                if (error) {
                    console.error("Error executing query", error.message);
                } else {
                    console.log(
                        `Employee added successfully ${qs.firstName} ${qs.lastName}`
                    );
                }
                menuOptions();
            });
        });
}

async function updateEmployeeRole() {
    const { rows: roles } = await pool.query("SELECT * FROM role");
    const { rows: employees } = await pool.query("SELECT * FROM employee");
    const roleChoices = roles.map((role) => ({
        name: role.title,
        value: role.id,
    }));
    const employeeChoices = employees.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
    }));
    inquirer
        .prompt([
            {
                name: "employee",
                type: "list",
                message: "Select the employee to update:",
                choices: employeeChoices,
            },
            {
                name: "role",
                type: "list",
                message: "Select the new role for this employee:",
                choices: roleChoices,
            },
        ])
        .then((qs) => {
            const pstgrsQuery = "UPDATE employee SET role_id = $1 WHERE id = $2";
            const values = [qs.role, qs.employee];

            pool.query(pstgrsQuery, values, (error, results) => {
                if (error) {
                    console.error("Error executing query", error.message);
                } else {
                    console.log("Employee role updated successfully");
                }
                menuOptions();
            });
        });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});