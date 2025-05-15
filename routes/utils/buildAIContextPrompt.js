function buildAIContextPrompt(currentTab, data = {}, insights = {}) {
    const lowerTab = currentTab.toLowerCase();

    const baseIntro = `
        You are an AI assistant helping with a restaurant management system.
        The user is currently on the "${lowerTab}" tab.
    `.trim();

    let tabContext = '';

    switch (lowerTab) {
        case 'dashboard':
            if (data && insights) {
                tabContext = `
                    You have access to ${data.type} Dashboard Data:

                    Highest Priced Item:
                    - ${insights?.highestPriceItem?.name} ($${insights?.highestPriceItem?.price})

                    Menu Items:
                    ${insights?.menuItems
                        ?.map(item => `- ${item.name}: $${item.price}, Sold: ${item.totalQuantity}, Income: $${item.totalIncome.toFixed(2)}`)
                        .join('\n')}

                    Most Ordered Item:
                    - ${insights?.mostOrderedItem?.name} (${insights?.mostOrderedItem?.totalQuantity} sold)

                    Highest Income Item:
                    - ${insights?.highestIncomeItem?.name} ($${insights?.highestIncomeItem?.totalIncome.toFixed(2)} total income)

                    Use this data to answer any relevant questions the user asks about sales, menu items, or pricing performance today.
                `.trim();
            } else {
                tabContext = `
                    You do NOT have access to dashboard data. Please switch to the "Dashboard" tab for insights about sales or performance.
                `.trim();
            }
            break;

        case 'orders':
            tabContext = `
                You are on the "Orders" tab where users can view, edit, or close restaurant orders.

                Be prepared to answer questions about current orders, table statuses, and actions like editing or closing an order.

                If the user is asking about user details or dashboard-related data, kindly guide them to switch to the "User Details" or "Dashboard" tab.
            `.trim();
            break;

        case 'userdetails':
            const users = data?.users || [];
            const userSummaries = users.map(u =>
                `Name: ${u.name}, Email: ${u.email}, Mobile: ${u.mobile}, Role: ${u.role}`
            ).join('\n');

            tabContext = `
                You are on the "User Details" tab. Here are the registered users:

                ${userSummaries}

                Only refer to the data shown above. Do not fabricate additional fields or users.
            `.trim();
            break;

        case 'createuser':
            tabContext = `
                You are on the "Create User" tab. Users can register new users by filling out a form.

                Assist with questions about required fields, validations, or form submission flow.

                If the user needs information from another tab, such as the "User Details" tab, kindly guide them there.
            `.trim();
            break;

        default:
            tabContext = `
                You are on the "${currentTab}" tab. There's no specific data available for this tab.

                If the user has questions about users, orders, or dashboard insights, guide them to the appropriate tab like "Dashboard", "Orders", or "User Details".
            `.trim();
    }

    return `
        ${baseIntro}

        ${tabContext}

        Be concise, friendly, and accurate in your response.
    `.trim();
}

module.exports = buildAIContextPrompt;
