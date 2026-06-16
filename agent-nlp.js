/**
 * AgentNLP v2.0 - Advanced Social Media AI Brain
 * Handles viral trends, platform copywriting, A/B testing content generation,
 * engagement forecasting, and automated category tagging.
 */
class AgentNLP {
    constructor() {
        this.trends = [
            { id: "T1", name: "AI Automation in business", volume: "124K posts", category: "Technology" },
            { id: "T2", name: "Remote Work & Digital Nomads in East Africa", volume: "85K posts", category: "Lifestyle" },
            { id: "T3", name: "Green Energy & Solar Systems", volume: "92K posts", category: "Sustainability" },
            { id: "T4", name: "Personal Budgeting & Financial Freedom", volume: "110K posts", category: "Finance" }
        ];

        this.hashtagsRelevance = [
            { tag: "#AIAutomation", score: "98/100", virality: "High" },
            { tag: "#RemoteWorkAfrica", score: "88/100", virality: "Medium" },
            { tag: "#SolarPowerTanzania", score: "92/100", virality: "High" },
            { tag: "#BudgetTips", score: "85/100", virality: "Medium" }
        ];

        this.botName = "SocialAgentAI";
    }

    /**
     * Generate A/B Testing copies, category tags, and engagement forecasts
     */
    generatePostAB(trendName, platform, tone = "professional") {
        const basePost = this.generatePost(trendName, platform, tone);
        
        // Version B (More casual/interactive)
        let versionBText = "";
        if (platform === "twitter") {
            versionBText = `🔥 Honestly, ${trendName} is rewriting the rules right now. What's your biggest challenge with this? Comment below! #Insights #Growth`;
        } else if (platform === "linkedin") {
            versionBText = `Is ${trendName} a buzzword or the future?\n\nI dug into the numbers and the results are clear: organizations adopting this are saving up to 15 hours per week. Here is how you can implement it today without complex setups.\n\n👇 Read the guide below.`;
        } else {
            versionBText = `💡 Let's talk about ${trendName}! How are you adapting to this shift in your workflow? Share your thoughts! 👇✨`;
        }

        // Auto tagging categories
        const category = trendName.toLowerCase().includes("ai") ? "Educational" : 
                         trendName.toLowerCase().includes("solar") ? "Sustainability" :
                         trendName.toLowerCase().includes("budgeting") ? "Finance" : "Lifestyle/Promo";

        // Forecast score
        const forecastScore = Math.floor(Math.random() * 25) + 75; // 75% to 99%

        return {
            category,
            forecastScore,
            versionA: basePost.text,
            versionB: versionBText,
            imageUrl: basePost.imageUrl
        };
    }

    generatePost(trendName, platform, tone = "professional") {
        const hashtags = {
            technology: ["#AI", "#Automation", "#TechTrends", "#Innovation"],
            lifestyle: ["#RemoteWork", "#DigitalNomad", "#EastAfrica", "#Productivity"],
            sustainability: ["#GreenEnergy", "#SolarPower", "#EcoFriendly", "#SavePlanet"],
            finance: ["#PersonalFinance", "#WealthBuilding", "#BudgetingTips", "#FinancialFreedom"]
        };

        const category = trendName.toLowerCase().includes("ai") ? "technology" : 
                         trendName.toLowerCase().includes("solar") ? "sustainability" :
                         trendName.toLowerCase().includes("budgeting") ? "finance" : "lifestyle";

        const tags = hashtags[category].join(" ");
        let content = "";

        if (platform === "twitter") {
            content = tone === "professional" 
                ? `💡 Quick Tech Tip: Embracing ${trendName} is no longer optional for growth. Start automating tasks today to scale faster! ${tags}`
                : `🚀 Guys! ${trendName} is changing the game right now. Are you ready for this shift? Let's discuss in the replies 👇 ${tags}`;
        } else if (platform === "linkedin") {
            content = `Over the past few months, we've witnessed an incredible surge in ${trendName}.\n\nAs leaders, understanding how to leverage these trends is crucial to building resilient organizations. Those who adopt early will outpace the competition.\n\nHere are 3 key takeaways:\n1️⃣ Efficiency gains are immediate.\n2️⃣ It improves team satisfaction.\n3️⃣ Customer delivery speeds double.\n\nWhat are your thoughts on this movement? Let's connect!\n\n${tags}`;
        } else if (platform === "instagram") {
            content = `✨ TREND ALERT! ✨\n\nWe are absolutely loving how ${trendName} is reshaping our daily workflows. 😍 It's all about working smarter, not harder!\n\nSwipe left to see our top tools for automation. 📸\n\n📌 Save this post for later!\n\n${tags}`;
        } else {
            content = `Have you noticed how ${trendName} is trending everywhere lately? Here is a quick breakdown of what it means for your business and how you can apply it today. Read more on our blog link.\n\n${tags}`;
        }

        return {
            text: content,
            imageUrl: this.getRandomImageForCategory(category)
        };
    }

    getRandomImageForCategory(category) {
        const images = {
            technology: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80",
            sustainability: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=400&q=80",
            finance: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
            lifestyle: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80"
        };
        return images[category] || images.technology;
    }

    processIncomingMessage(senderHandle, messageText) {
        const text = messageText.toLowerCase().trim();
        let reply = "";
        let intent = "general";
        let confidence = 0.9;

        if (this.matchKeywords(text, ["bei gani", "how much", "price", "gharama", "cost"])) {
            intent = "pricing_inquiry";
            reply = `Habari @${senderHandle}! Karibu, mifumo yetu inaanza kutoka Tsh 45,000 tu kwa mwezi kulingana na mahitaji yako. Nitakutumia ujumbe wa DM (Inbox) wenye mchanganuo kamili sasa hivi!`;
        } else if (this.matchKeywords(text, ["najiungaje", "how to join", "link", "tovuti", "website", "sign up"])) {
            intent = "signup_inquiry";
            reply = `Hello @${senderHandle}! Unaweza kujiunga na huduma yetu moja kwa moja kupitia tovuti yetu ya bomaai.com/signup. Nitakutumia link maalum sasa hivi kwenye DM yako!`;
        } else if (this.matchKeywords(text, ["wizi", "scam", "baya", "fake", "nonsense"])) {
            intent = "negative_feedback";
            reply = `Samahani sana kusikia hivyo @${senderHandle}. Tungependa kujua ni tatizo gani umekumbana nalo ili tulitatue mara moja. Unaweza kutuandikia DM ya siri tusaidiane?`;
        } else if (this.matchKeywords(text, ["asante", "shukrani", "nice", "awesome", "good job", "safi"])) {
            intent = "positive_feedback";
            reply = `Asante sana @${senderHandle} kwa maoni yako mazuri! Tunafurahi kuwa pamoja nawe! 🙏✨`;
        } else {
            intent = "general_query";
            reply = `Habari @${senderHandle}, asante kwa kutuandikia! Mimi ni msaidizi wa AI hapa, nimepokea ujumbe wako na timu yetu itaufanyia kazi hivi punde!`;
        }

        return {
            reply,
            intent,
            confidence
        };
    }

    matchKeywords(text, keywords) {
        return keywords.some(k => text.includes(k));
    }
}
window.AgentNLP = AgentNLP;
