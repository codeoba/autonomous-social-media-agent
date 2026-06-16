document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize State
    let scheduledQueue = JSON.parse(localStorage.getItem("sm_queue")) || [
        { id: "Q001", day: "mon", platform: "linkedin", topic: "AI Automation in business", time: "09:00 AM", status: "Scheduled" },
        { id: "Q002", day: "wed", platform: "instagram", topic: "Remote Work in East Africa", time: "02:00 PM", status: "Scheduled" }
    ];

    let activePosts = JSON.parse(localStorage.getItem("sm_active_posts")) || [
        { id: "PST101", date: "2026-06-15", platform: "LinkedIn", topic: "AI Automation in business", engagement: "1,240 likes • 42 comments", status: "Published" },
        { id: "PST102", date: "2026-06-15", platform: "Instagram", topic: "Remote Work & Digital Nomads", engagement: "3,480 likes • 118 comments", status: "Published" }
    ];

    let mockComments = JSON.parse(localStorage.getItem("sm_comments")) || [
        { user: "@juma_tz", text: "Hii ni nzuri sana! Najiungaje?", isAi: false },
        { user: "@SocialAgentAI", text: "Hello @juma_tz! Unaweza kujiunga na huduma yetu moja kwa moja kupitia tovuti yetu ya bomaai.com/signup. Nitakutumia link maalum sasa hivi kwenye DM yako!", isAi: true }
    ];

    let selectedTrend = null;
    let generatedDraft = null;

    const saveQueue = () => localStorage.setItem("sm_queue", JSON.stringify(scheduledQueue));
    const saveActivePosts = () => localStorage.setItem("sm_active_posts", JSON.stringify(activePosts));
    const saveComments = () => localStorage.setItem("sm_comments", JSON.stringify(mockComments));

    // Initialize Agent NLP Core
    const agent = new window.AgentNLP();

    // 2. Select Elements
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");
    const themeToggle = document.getElementById("theme-toggle");
    const toastContainer = document.getElementById("toast-container");

    const trendsListContainer = document.getElementById("trends-list-container");
    const postTopicInput = document.getElementById("post-topic");
    const postPlatformSelect = document.getElementById("post-platform");
    const postToneSelect = document.getElementById("post-tone");
    const triggerGenBtn = document.getElementById("trigger-gen-btn");

    // Image Editor Inputs
    const imageBannerText = document.getElementById("image-banner-text");
    const previewImageOverlay = document.getElementById("preview-image-overlay");

    const postPreviewCard = document.getElementById("post-preview-card");
    const previewImage = document.getElementById("preview-image");
    const forecastValue = document.getElementById("forecast-value");
    const categoryTagBadge = document.getElementById("category-tag-badge");
    const previewTextA = document.getElementById("preview-text-a");
    const previewTextB = document.getElementById("preview-text-b");
    const generatePostForm = document.getElementById("generate-post-form");

    const queueList = document.getElementById("queue-list");
    const activePostsList = document.getElementById("active-posts-list");
    const consoleLogBox = document.getElementById("console-log-box");

    // Comment Simulator Elements
    const simulatedCommentsBox = document.getElementById("simulated-comments-box");
    const simUserHandle = document.getElementById("sim-user-handle");
    const simCommentText = document.getElementById("sim-comment-text");
    const simPostCommentBtn = document.getElementById("sim-post-comment-btn");
    const commentLogsFeed = document.getElementById("comment-logs-feed");
    const agentCollabWindow = document.getElementById("agent-collab-window");

    // Dashboard count elements
    const statRepliesEl = document.getElementById("stat-replies");
    const exportAnalyticsBtn = document.getElementById("export-analytics-btn");

    // 3. Toast Notifier
    const showToast = (title, message) => {
        const toast = document.createElement("div");
        toast.className = "toast-message";
        toast.innerHTML = `<i class="fas fa-bell"></i> <div><strong>${title}</strong><p>${message}</p></div>`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    };

    // System Logging Console
    const addSystemLog = (action, details, level = "info") => {
        const time = new Date().toLocaleTimeString();
        
        if (commentLogsFeed) {
            const logItem = document.createElement("div");
            logItem.className = `log-item log-${level}`;
            logItem.innerHTML = `
                <span class="log-time">${time}</span>
                <span class="log-action">[${action.toUpperCase()}]</span>
                <span class="log-details">${details}</span>
            `;
            commentLogsFeed.prepend(logItem);
        }

        if (consoleLogBox) {
            const consoleItem = document.createElement("div");
            consoleItem.style.marginBottom = "6px";
            consoleItem.style.color = level === "error" ? "#f43f5e" : level === "success" ? "#10b981" : level === "warning" ? "#c084fc" : "#3b82f6";
            consoleItem.innerHTML = `&gt;&gt; [${time}] [${action.toUpperCase()}] ${details}`;
            consoleLogBox.appendChild(consoleItem);
            consoleLogBox.scrollTop = consoleLogBox.scrollHeight;
        }
    };

    // 4. Tab Routing
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            tabPanels.forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(btn.getAttribute("data-tab")).classList.add("active");
        });
    });

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        const icon = themeToggle.querySelector("i");
        icon.className = document.body.classList.contains("light-mode") ? "fas fa-moon" : "fas fa-sun";
    });

    // Image overlay text update on input
    imageBannerText.addEventListener("input", (e) => {
        previewImageOverlay.innerText = e.target.value || "BANNER TEXT";
    });

    // 5. Render Active Lists
    const renderActivePosts = () => {
        activePostsList.innerHTML = "";
        activePosts.forEach(post => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${post.id}</strong></td>
                <td>${post.date}</td>
                <td><span class="badge" style="background: rgba(139, 92, 246, 0.1); color: var(--accent-purple);">${post.platform}</span></td>
                <td>${post.topic}</td>
                <td>${post.engagement}</td>
                <td><span class="badge bg-success">${post.status}</span></td>
            `;
            activePostsList.appendChild(tr);
        });
    };

    const renderTrends = () => {
        trendsListContainer.innerHTML = "";
        agent.trends.forEach(trend => {
            const box = document.createElement("div");
            box.className = "trend-item-box";
            box.innerHTML = `
                <div class="trend-info-meta">
                    <h4>${trend.name}</h4>
                    <span>Kundi: ${trend.category}</span>
                </div>
                <div class="trend-volume">${trend.volume}</div>
            `;
            box.addEventListener("click", () => {
                document.querySelectorAll(".trend-item-box").forEach(b => b.classList.remove("active"));
                box.classList.add("active");
                selectedTrend = trend;
                postTopicInput.value = trend.name;
                addSystemLog("Trend selected", `Selected trend topic: "${trend.name}"`, "info");
            });
            trendsListContainer.appendChild(box);
        });
    };

    const renderQueue = () => {
        queueList.innerHTML = "";
        document.querySelectorAll(".day-posts").forEach(div => div.innerHTML = "");

        scheduledQueue.forEach(item => {
            const div = document.createElement("div");
            div.className = "queue-item";
            div.innerHTML = `
                <h5>${item.topic}</h5>
                <p>Platform: <strong>${item.platform.toUpperCase()}</strong> | Time: ${item.time}</p>
            `;
            queueList.appendChild(div);

            const dayContainer = document.getElementById(`day-${item.day}`);
            if (dayContainer) {
                const badge = document.createElement("div");
                badge.className = "cal-post-badge";
                badge.innerText = `[${item.platform.toUpperCase()}] ${item.topic.slice(0, 15)}...`;
                dayContainer.appendChild(badge);
            }
        });
    };

    const renderComments = () => {
        simulatedCommentsBox.innerHTML = "";
        mockComments.forEach(comm => {
            const div = document.createElement("div");
            div.className = `skin-comment-item ${comm.isAi ? 'ai-reply' : ''}`;
            div.innerHTML = `<strong>${comm.user}</strong> ${comm.text}`;
            simulatedCommentsBox.appendChild(div);
        });
        simulatedCommentsBox.scrollTop = simulatedCommentsBox.scrollHeight;
    };

    // Periodic Multi-Agent dialogue simulation
    const simulateMultiAgentCollab = () => {
        const messages = [
            { agent: "AI Designer", text: "Banner text overlay positioned perfectly on layout grid.", class: "designer" },
            { agent: "AI Copywriter", text: "A/B copy optimization completed. Ready for preview.", class: "copywriter" },
            { agent: "AI Analyst", text: "Crawling competitor brand posts... No similar campaign found.", class: "analyst" }
        ];

        let index = 0;
        setInterval(() => {
            if (agentCollabWindow) {
                const msg = messages[index];
                const div = document.createElement("div");
                div.className = "agent-chat-msg";
                div.innerHTML = `<span class="agent-badge ${msg.class}">${msg.agent}</span> ${msg.text}`;
                agentCollabWindow.appendChild(div);
                agentCollabWindow.scrollTop = agentCollabWindow.scrollHeight;
                index = (index + 1) % messages.length;
            }
        }, 8000);
    };

    // 6. Generate AI Post copy trigger
    triggerGenBtn.addEventListener("click", () => {
        if (!selectedTrend) {
            alert("Tafadhali chagua mada/trend upande wa kushoto kwanza!");
            return;
        }

        const platform = postPlatformSelect.value;
        const tone = postToneSelect.value;

        addSystemLog("AI Post Copy Generation", `Requesting A/B post drafts for ${platform.toUpperCase()}`, "info");
        
        const abResult = agent.generatePostAB(selectedTrend.name, platform, tone);
        generatedDraft = {
            topic: selectedTrend.name,
            platform,
            text: abResult.versionA,
            imageUrl: abResult.imageUrl
        };

        // Render preview card details
        previewImage.src = abResult.imageUrl;
        previewImageOverlay.innerText = imageBannerText.value || "BANNER TEXT";
        forecastValue.innerText = `${abResult.forecastScore}%`;
        categoryTagBadge.innerText = abResult.category;
        
        previewTextA.innerText = abResult.versionA;
        previewTextB.innerText = abResult.versionB;

        postPreviewCard.style.display = "block";

        addSystemLog("AI Post Copy Complete", `Forecasted engagement success score at ${abResult.forecastScore}%`, "success");
    });

    // Save Scheduled draft to Queue on submit
    generatePostForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!generatedDraft) return;

        // Determine A/B selected text
        const chosenAB = document.querySelector('input[name="ab-test-select"]:checked').value;
        const finalCopy = chosenAB === "A" ? generatedDraft.text : previewTextB.innerText;

        const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
        const randomDay = days[Math.floor(Math.random() * days.length)];
        const randomHour = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0") + ":00 " + (Math.random() > 0.5 ? "AM" : "PM");

        const newItem = {
            id: "Q" + String(scheduledQueue.length + 1).padStart(3, "0"),
            day: randomDay,
            platform: generatedDraft.platform,
            topic: generatedDraft.topic,
            time: randomHour,
            status: "Scheduled"
        };

        scheduledQueue.push(newItem);
        saveQueue();
        renderQueue();

        showToast("Post Scheduled", `Approved Copy Version ${chosenAB}. Added to calendar queue.`);
        addSystemLog("Pipeline Queue update", `Saved A/B Copy Choice: Version ${chosenAB}`, "success");

        postPreviewCard.style.display = "none";
        generatePostForm.reset();
        generatedDraft = null;
    });

    // 7. Interactive Comments Responder Simulator
    simPostCommentBtn.addEventListener("click", () => {
        const handle = simUserHandle.value.trim() || "@username";
        const comment = simCommentText.value.trim();
        if (!comment) return;

        simCommentText.value = "";

        // Push customer comment
        mockComments.push({ user: handle, text: comment, isAi: false });
        saveComments();
        renderComments();

        addSystemLog("Inbound Comment Received", `Customer ${handle} commented: "${comment}"`, "info");

        // Simulate AI Reading and auto responding
        setTimeout(() => {
            const aiDecision = agent.processIncomingMessage(handle.replace("@", ""), comment);
            
            mockComments.push({ user: "@SocialAgentAI", text: aiDecision.reply, isAi: true });
            saveComments();
            renderComments();

            statRepliesEl.innerText = mockComments.filter(c => c.isAi).length;

            addSystemLog("AI Decision Auto-Response", `Reply sent. (Intent: ${aiDecision.intent}, Conf: ${(aiDecision.confidence*100).toFixed(0)}%)`, "success");
            showToast("AI Auto-Replied", `Responded to ${handle} comment.`);
        }, 1200);
    });

    // 8. Connection status disconnector mocks
    document.querySelectorAll(".disconnect-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const card = e.target.closest(".integration-card");
            card.classList.remove("connected");
            card.querySelector(".badge").className = "badge bg-danger";
            card.querySelector(".badge").innerText = "DISCONNECTED";
            e.target.remove();
            showToast("Platform Disconnected", "API token integration removed.");
            addSystemLog("Platform Authorization", "Disconnected token access credentials.", "warning");
        });
    });

    // CSV Analytics Export
    exportAnalyticsBtn.addEventListener("click", () => {
        let csvContent = "data:text/csv;charset=utf-8,Followers,EngagementRate,Clicks,AutoReplies\n";
        csvContent += `48250,8.4%,3480,${mockComments.filter(c => c.isAi).length}\n`;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "social_media_analytics.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("CSV Exported", "Analytics data download started.");
        addSystemLog("CSV Export", "Analytics report downloaded.", "success");
    });

    // Initial load
    renderTrends();
    renderQueue();
    renderActivePosts();
    renderComments();
    simulateMultiAgentCollab();

    addSystemLog("SocialAgentAI Boot", "Autonomous Social Media Manager engine online. Live Web Crawlers active.", "success");
});
