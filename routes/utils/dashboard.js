const getDashboardInsights = (dashboardData) => {
  const { menuItems, orderHistory } = dashboardData;

  // Highest priced menu item
  const highestPriceItem = menuItems.reduce((max, item) => 
    Number(item.price) > Number(max.price) ? item : max,
    { price: 0 }
  );

  // Build a merged array: menuItems + their quantities and income from orderHistory
  const mergedItems = menuItems.map((item) => {
    const match = orderHistory.find((order) => order._id === item.name);
    return {
      name: item.name,
      price: Number(item.price),
      totalQuantity: match?.totalQuantity || 0,
      totalIncome: match?.totalIncome || 0
    };
  });

  // Most ordered item
  const mostOrderedItem = mergedItems.reduce(
    (max, item) => item.totalQuantity > max.totalQuantity ? item : max,
    { totalQuantity: 0, name: "" }
  );

  // Highest income item
  const highestIncomeItem = mergedItems.reduce(
    (max, item) => item.totalIncome > max.totalIncome ? item : max,
    { totalIncome: 0, name: "" }
  );

  return {
    highestPriceItem,
    mostOrderedItem,
    highestIncomeItem,
    menuItems: mergedItems // now includes quantities and income
  };
};

module.exports = { getDashboardInsights };
