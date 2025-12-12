if (window.location.href.includes("blooket")) {
    console.log("Script active");

    let lastRun = 0;

    document.addEventListener("keydown", async e => {
        if (e.key.toLowerCase() !== "x") return;

        let now = Date.now();
        if (now - lastRun < 500) return;
        lastRun = now;

        console.log("X pressed, starting run");

        let answerEls = document.querySelectorAll('[class^="_answerText"]');
        let questionEl = document.querySelector('[class^="_questionText"]');

        let answers = Array.from(answerEls)
            .map(el => el.innerText.trim())
            .filter(t => t.length > 0);

        let question = questionEl ? questionEl.innerText.trim() : null;

        console.log("Question:", question);
        console.log("Answers:", answers);

        if (!question || answers.length === 0) {
            console.log("No valid question or answers");
            return;
        }

        try {
            let aiAnswer = await mistral_ai(question, answers);
            console.log("AI answer:", aiAnswer);

            let cleaned = aiAnswer.toLowerCase().replace(/[^a-z0-9]/g, "");

            let index = answers.findIndex(a =>
                a.toLowerCase().replace(/[^a-z0-9]/g, "") === cleaned
            );

            console.log("Index:", index);

            if (index !== -1) {
                let el = answerEls[index];
                el.scrollIntoView({ behavior: "smooth", block: "center" });

                setTimeout(() => {
                    console.log("Click");
                    fakeClick(el);
                }, 400);
            } else {
                console.log("No match");
            }
        } catch (e) {
            console.log("Error:", e);
        }
    });
}

async function mistral_ai(question, answers) {
    const apiKey = ''; // <---------- API KEY HERE

    let response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'mistral-small',
            messages: [
                {
                    role: 'user',
                    content: `Give me the exact text of one of these answers, no explanation: ${answers}. Question: ${question}`
                }
            ],
            max_tokens: 20
        })
    });

    let data = await response.json();
    return data.choices[0].message.content.trim();
}

async function fakeClick(el) {
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const eventOptions = {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 0,
        buttons: 1
    };

    el.focus?.();

    el.dispatchEvent(new PointerEvent('pointerover', eventOptions));
    el.dispatchEvent(new PointerEvent('pointerenter', eventOptions));
    el.dispatchEvent(new MouseEvent('mouseover', eventOptions));
    el.dispatchEvent(new MouseEvent('mouseenter', eventOptions));

    el.dispatchEvent(new PointerEvent('pointermove', eventOptions));
    el.dispatchEvent(new MouseEvent('mousemove', eventOptions));

    el.dispatchEvent(new PointerEvent('pointerdown', eventOptions));
    el.dispatchEvent(new MouseEvent('mousedown', eventOptions));

    await new Promise(resolve => setTimeout(resolve, 50));

    el.dispatchEvent(new PointerEvent('pointerup', eventOptions));
    el.dispatchEvent(new MouseEvent('mouseup', eventOptions));
    el.dispatchEvent(new MouseEvent('click', eventOptions));
}
