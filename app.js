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

    const postPreviewCard = document.getElementById("post-preview-card");
    const previewImage = document.getElementById("preview-image");
    const previewText = document.getElementById("preview-text");
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

    // Dashboard count elements
    const statRepliesEl = document.getElementById("stat-replies");

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
        
        // Append to mini log feeds in DM tab
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

        // Append to main system terminal tab
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
        
        // Reset calendar day wrappers
        document.querySelectorAll(".day-posts").forEach(div => div.innerHTML = "");

        scheduledQueue.forEach(item => {
            const div = document.createElement("div");
            div.className = "queue-item";
            div.innerHTML = `
                <h5>${item.topic}</h5>
                <p>Platform: <strong>${item.platform.toUpperCase()}</strong> | Time: ${item.time}</p>
            `;
            queueList.appendChild(div);

            // Add badge to visual weekly calendar grid
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

    // 6. Generate AI Post copy trigger
    let generatedDraft = null;
    triggerGenBtn.addEventListener("click", () => {
        if (!selectedTrend) {
            alert("Tafadhali chagua mada/trend upande wa kushoto kwanza!");
            return;
        }

        const platform = postPlatformSelect.value;
        const tone = postToneSelect.value;

        addSystemLog("AI Post Copy Generation", `Requesting post draft for ${platform.toUpperCase()} (Tone: ${tone})`, "info");
        
        const draft = agent.generatePost(selectedTrend.name, platform, tone);
        generatedDraft = {
            topic: selectedTrend.name,
            platform,
            text: draft.text,
            imageUrl: draft.imageUrl
        };

        // Render preview card details
        previewImage.src = draft.imageUrl;
        previewText.innerText = draft.text;
        postPreviewCard.style.display = "block";

        addSystemLog("AI Post Copy Complete", "Post copy and visual card simulation draft rendered.", "success");
    });

    // Save Scheduled draft to Queue on submit
    generatePostForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!generatedDraft) return;

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

        showToast("Post Scheduled", `Added "${generatedDraft.topic}" to content pipeline.`);
        addSystemLog("Pipeline Queue update", `Post scheduled successfully for ${randomDay.toUpperCase()} at ${randomHour}.`, "success");

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

            // Increment count stat
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

    // Initial load
    renderTrends();
    renderQueue();
    renderActivePosts();
    renderComments();

    addSystemLog("SocialAgentAI Boot", "Autonomous Social Media Manager engine online. Live Web Crawlers active.", "success");
});
