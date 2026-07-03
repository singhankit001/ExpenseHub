const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeder...');

  // Clean the database
  await prisma.expense.deleteMany();
  await prisma.user.deleteMany();
  console.log('Database cleaned.');

  // Create hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users
  const user1 = await prisma.user.create({
    data: {
      name: 'Ankit Singh',
      email: 'ankit@example.com',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: hashedPassword,
    },
  });

  console.log(`Created users: ${user1.name} and ${user2.name}`);

  // Create expenses for User 1 (Ankit Singh)
  const now = new Date();
  
  // Expenses for the current month
  const expensesUser1 = [
    {
      title: 'Groceries supermarket',
      amount: 1500.50,
      category: 'Food',
      expenseDate: new Date(now.getFullYear(), now.getMonth(), 3),
      notes: 'Weekly groceries from supermarket',
      userId: user1.id,
    },
    {
      title: 'Uber ride to office',
      amount: 450.00,
      category: 'Travel',
      expenseDate: new Date(now.getFullYear(), now.getMonth(), 4),
      notes: 'Commute to office',
      userId: user1.id,
    },
    {
      title: 'Electricity Bill',
      amount: 3200.00,
      category: 'Bills',
      expenseDate: new Date(now.getFullYear(), now.getMonth(), 1),
      notes: 'June electricity charge',
      userId: user1.id,
    },
    {
      title: 'Summer jacket',
      amount: 2500.00,
      category: 'Shopping',
      expenseDate: new Date(now.getFullYear(), now.getMonth(), 2),
      notes: 'Jacket from Zara',
      userId: user1.id,
    },
    {
      title: 'Node.js Udemy Course',
      amount: 499.00,
      category: 'Education',
      expenseDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      notes: 'Advanced Backend Engineering course',
      userId: user1.id,
    },
    {
      title: 'Netflix Subscription',
      amount: 649.00,
      category: 'Entertainment',
      expenseDate: new Date(now.getFullYear(), now.getMonth(), 5),
      notes: 'Monthly standard plan',
      userId: user1.id,
    },
    {
      title: 'Dental Checkup',
      amount: 1200.00,
      category: 'Health',
      expenseDate: new Date(now.getFullYear(), now.getMonth(), 2),
      notes: 'Routine dental scaling',
      userId: user1.id,
    },
    {
      title: 'Dry cleaning',
      amount: 350.00,
      category: 'Other',
      expenseDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      notes: 'Laundry service',
      userId: user1.id,
    },
  ];

  // Expenses for the previous month (for analytics)
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const prevMonthExpenses = [
    {
      title: 'Dinner at restaurant',
      amount: 1800.00,
      category: 'Food',
      expenseDate: prevMonthDate,
      notes: 'Team dinner',
      userId: user1.id,
    },
    {
      title: 'Flight ticket booking',
      amount: 5500.00,
      category: 'Travel',
      expenseDate: prevMonthDate,
      notes: 'Travel to hometown',
      userId: user1.id,
    },
    {
      title: 'Broadband Internet',
      amount: 999.00,
      category: 'Bills',
      expenseDate: prevMonthDate,
      notes: 'Monthly wifi charges',
      userId: user1.id,
    },
  ];

  // Add one soft-deleted expense for User 1
  const softDeletedExpense = {
    title: 'Gym membership canceled',
    amount: 1500.00,
    category: 'Health',
    expenseDate: new Date(now.getFullYear(), now.getMonth(), 1),
    notes: 'This gym membership was canceled and expense is soft-deleted',
    isDeleted: true,
    deletedAt: new Date(),
    userId: user1.id,
  };

  const allExpenses = [...expensesUser1, ...prevMonthExpenses, softDeletedExpense];

  for (const exp of allExpenses) {
    await prisma.expense.create({
      data: exp,
    });
  }

  // Create expenses for User 2 (Jane Doe)
  const expensesUser2 = [
    {
      title: 'Weekly Groceries',
      amount: 800.00,
      category: 'Food',
      expenseDate: new Date(),
      notes: 'Grocery store buy',
      userId: user2.id,
    },
    {
      title: 'Train Pass',
      amount: 600.00,
      category: 'Travel',
      expenseDate: new Date(),
      notes: 'Monthly pass',
      userId: user2.id,
    },
  ];

  for (const exp of expensesUser2) {
    await prisma.expense.create({
      data: exp,
    });
  }

  console.log('Seeded database with sample users and expenses successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
