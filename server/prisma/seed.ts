import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  // Expense categories
  { name: "Food", icon: "utensils", color: "#E67E22", subCategories: ["Groceries", "Restaurants", "Coffee", "Delivery"] },
  { name: "Transport", icon: "car", color: "#3498DB", subCategories: ["Gas", "Public Transit", "Taxi", "Parking"] },
  { name: "Rent", icon: "home", color: "#9B59B6", subCategories: [] },
  { name: "Entertainment", icon: "film", color: "#E74C3C", subCategories: ["Movies", "Games", "Concerts", "Sports"] },
  { name: "Health", icon: "heart", color: "#1ABC9C", subCategories: ["Doctor", "Pharmacy", "Gym", "Insurance"] },
  { name: "Shopping", icon: "shopping-bag", color: "#F39C12", subCategories: ["Clothing", "Electronics", "Home", "Personal"] },
  { name: "Education", icon: "book", color: "#2ECC71", subCategories: ["Courses", "Books", "Supplies"] },
  { name: "Subscriptions", icon: "repeat", color: "#8E44AD", subCategories: ["Streaming", "Software", "News"] },
  { name: "Utilities", icon: "zap", color: "#34495E", subCategories: ["Electric", "Water", "Internet", "Phone"] },
  // Income categories
  { name: "Salary", icon: "briefcase", color: "#27AE60", subCategories: [] },
  { name: "Freelance", icon: "laptop", color: "#2980B9", subCategories: [] },
  { name: "Investment", icon: "trending-up", color: "#F1C40F", subCategories: ["Dividends", "Capital Gains", "Interest"] },
  { name: "Other Income", icon: "plus-circle", color: "#7F8C8D", subCategories: [] },
  { name: "Other Expense", icon: "minus-circle", color: "#95A5A6", subCategories: [] },
];

async function main() {
  console.log("Seeding default categories...");

  for (const cat of defaultCategories) {
    const parent = await prisma.category.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isCustom: false,
        userId: null,
      },
    });

    for (const subName of cat.subCategories) {
      await prisma.category.create({
        data: {
          name: subName,
          icon: cat.icon,
          color: cat.color,
          isCustom: false,
          userId: null,
          parentId: parent.id,
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
