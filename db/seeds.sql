INSERT INTO department (name)
VALUES ('Managment'),
('Team Leads'),
('Customer Service'),
('Human Recources');

INSERT INTO role (title, salary, department_id)
VALUES ('Manager', 50000, 1),
('Assistant Manager', 40000, 1),
('Lead Stocker', 30000, 2),
('Shift Lead', 33000, 2),
('Human Resources', 35000, 3),
('Help Desk', 25000, 3),
('Stocker', 24000, 4),
('Cashier', 22000, 4),
('Associate', 26000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Patrick', 'Gustafson', 1, NULL),
('Maki', 'Oze', 1, 1),
('Peter', 'Parker', 2, 1),
('Bruce', 'Wayne', 2, 1),
('Jane', 'Doe', 3, 1),
('Naruto', 'Uzumaki', 3, 1),
('Barry', 'Bonds', 4, 2),
('Tom', 'Brady', 4, 2),
('Helter', 'Skelter', 4, 2)

