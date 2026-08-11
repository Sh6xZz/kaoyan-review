/**
 * 英语单词模块
 * - 单词添加与管理
 * - 基于单词自动生成短句/作文素材（含中文翻译）
 * - SpeechSynthesis 朗读（朗读时仅显示英文，结束后展示翻译）
 */
const EnglishModule = (() => {
    let selectedWords = [];
    let currentSentence = { en: '', zh: '' };

    // ========== 句子模板库（英文 + 中文翻译配对） ==========
    const sentenceTemplates = [
        // 因果论述
        {
            en: (w1, w2, w3) => `The key to ${w1.word} is not merely ${w2.word}, but also the ability to ${w3.word} consistently.`,
            zh: (w1, w2, w3) => `要想${w1.meaning}，光靠${w2.meaning}还不够，关键是要能持之以恒地${w3.meaning}。`
        },
        {
            en: (w1, w2, w3) => `Many people fail to ${w1.word} because they underestimate the importance of ${w2.word} and ${w3.word}.`,
            zh: (w1, w2, w3) => `很多人之所以做不到${w1.meaning}，是因为低估了${w2.meaning}与${w3.meaning}的价值。`
        },
        {
            en: (w1, w2, w3) => `Without sufficient ${w1.word}, it is nearly impossible to ${w2.word} or even ${w3.word} in today's competitive environment.`,
            zh: (w1, w2, w3) => `在当今竞争如此激烈的环境下，若缺乏足够的${w1.meaning}，想要${w2.meaning}乃至${w3.meaning}几乎是天方夜谭。`
        },

        // 对比转折
        {
            en: (w1, w2, w3) => `While ${w1.word} may seem challenging, with enough ${w2.word} you can gradually ${w3.word}.`,
            zh: (w1, w2, w3) => `虽说${w1.meaning}看起来难度不小，但只要你有足够的${w2.meaning}，就能一步步地${w3.meaning}。`
        },
        {
            en: (w1, w2, w3) => `Although ${w1.word} and ${w2.word} appear different, they both require one to ${w3.word} with dedication.`,
            zh: (w1, w2, w3) => `${w1.meaning}和${w2.meaning}表面上看是两回事，但归根结底，都需要你投入心力去${w3.meaning}。`
        },
        {
            en: (w1, w2, w3) => `Some prefer to ${w1.word}, whereas others choose to ${w2.word} — but both approaches demand ${w3.word}.`,
            zh: (w1, w2, w3) => `有人偏爱${w1.meaning}，有人则倾向于${w2.meaning}——但无论走哪条路，都离不开${w3.meaning}。`
        },

        // 递进深入
        {
            en: (w1, w2, w3) => `To truly ${w1.word}, one must first ${w2.word} and then cultivate ${w3.word} over time.`,
            zh: (w1, w2, w3) => `想要真正${w1.meaning}，你得先学会${w2.meaning}，再慢慢养成${w3.meaning}的习惯。`
        },
        {
            en: (w1, w2, w3) => `Success in ${w1.word} depends on how well you ${w2.word} and whether you possess enough ${w3.word} to persevere.`,
            zh: (w1, w2, w3) => `能不能在${w1.meaning}上取得成功，既要看你${w2.meaning}的功夫下得有多深，也要看你有没有足够的${w3.meaning}撑到最后。`
        },

        // 观点表达
        {
            en: (w1, w2, w3) => `From my perspective, ${w1.word} is essential for anyone who wishes to ${w2.word} and achieve ${w3.word}.`,
            zh: (w1, w2, w3) => `依我看，凡是想要${w2.meaning}、实现${w3.meaning}的人，${w1.meaning}都是绕不开的一环。`
        },
        {
            en: (w1, w2, w3) => `There is a growing consensus that ${w1.word} and ${w2.word} are vital prerequisites for those who aspire to ${w3.word}.`,
            zh: (w1, w2, w3) => `越来越多人意识到，对于渴望${w3.meaning}的人来说，${w1.meaning}和${w2.meaning}是必不可少的前提条件。`
        },

        // 举例说明
        {
            en: (w1, w2, w3) => `Take ${w1.word} as an example: through persistent ${w2.word}, one can eventually ${w3.word}.`,
            zh: (w1, w2, w3) => `拿${w1.meaning}来说吧：只要持续不断地${w2.meaning}，终有一天你能${w3.meaning}。`
        },
        {
            en: (w1, w2, w3) => `A typical case involves ${w1.word}, where practitioners must ${w2.word} daily and never lose ${w3.word}.`,
            zh: (w1, w2, w3) => `一个典型的例子就是${w1.meaning}——践行者必须日复一日地${w2.meaning}，并且永远不能丢掉${w3.meaning}。`
        },

        // 单个单词短句
        {
            en: (w1) => `It takes great courage to ${w1.word} in the face of adversity.`,
            zh: (w1) => `面对逆境仍然${w1.meaning}，这需要极大的勇气。`
        },
        {
            en: (w1) => `The essence of progress lies in our willingness to ${w1.word}.`,
            zh: (w1) => `进步的真正动力，源于我们敢于去${w1.meaning}。`
        },
        {
            en: (w1) => `We should never underestimate the power of ${w1.word}.`,
            zh: (w1) => `永远不要小看${w1.meaning}的力量。`
        },

        // 两个单词
        {
            en: (w1, w2) => `If you can ${w1.word}, you will naturally develop ${w2.word}.`,
            zh: (w1, w2) => `一旦你学会了${w1.meaning}，${w2.meaning}自然会随之而来。`
        },
        {
            en: (w1, w2) => `${w1.word} and ${w2.word} are two sides of the same coin.`,
            zh: (w1, w2) => `${w1.meaning}与${w2.meaning}，其实是一体两面、相辅相成的。`
        },
        {
            en: (w1, w2) => `Through ${w1.word}, we gain deeper ${w2.word} about the world.`,
            zh: (w1, w2) => `经由${w1.meaning}，我们对世界有了更深的${w2.meaning}。`
        },

        // 通用三词模板
        {
            en: (w1, w2, w3) => `${w1.word} serves as the foundation for ${w2.word}, ultimately leading to ${w3.word}.`,
            zh: (w1, w2, w3) => `${w1.meaning}为${w2.meaning}打下根基，最终引领我们走向${w3.meaning}。`
        },
        {
            en: (w1, w2, w3) => `In the process of ${w1.word}, we learn to ${w2.word} and embrace ${w3.word}.`,
            zh: (w1, w2, w3) => `在${w1.meaning}的旅途中，我们不仅学会了${w2.meaning}，也学会了拥抱${w3.meaning}。`
        },
    ];

    function pickTemplate(count) {
        const filtered = sentenceTemplates.filter(t => t.en.length === count);
        if (filtered.length === 0) {
            const fallback = sentenceTemplates.filter(t => t.en.length >= count);
            return fallback[Math.floor(Math.random() * fallback.length)];
        }
        return filtered[Math.floor(Math.random() * filtered.length)];
    }

    function generateSentence(words) {
        if (words.length === 0) return { en: '', zh: '' };
        const template = pickTemplate(words.length);
        return {
            en: template.en(...words),
            zh: template.zh(...words)
        };
    }

    // ========== UI 渲染 ==========
    function renderWordList() {
        const words = Storage.getWords();
        const listEl = document.getElementById('word-list');
        const countEl = document.getElementById('word-count');
        countEl.textContent = words.length;

        if (words.length === 0) {
            listEl.innerHTML = '<li style="text-align:center;color:#94a3b8;padding:16px;">还没有添加单词</li>';
            return;
        }
        listEl.innerHTML = words.map((w, i) => `
            <li>
                <span><span class="word-text">${escapeHtml(w.word)}</span><span class="word-meaning">${escapeHtml(w.meaning)}</span></span>
                <button class="del-btn" data-index="${i}" title="删除">&times;</button>
            </li>
        `).join('');

        listEl.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Storage.removeWord(parseInt(btn.dataset.index));
                renderWordList();
                renderWordChips();
            });
        });
    }

    function renderWordChips() {
        const words = Storage.getWords();
        const chipsEl = document.getElementById('word-chips');
        chipsEl.innerHTML = words.map((w, i) => `
            <span class="chip ${selectedWords.includes(i) ? 'selected' : ''}" data-index="${i}">
                ${escapeHtml(w.word)}
            </span>
        `).join('');

        chipsEl.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const idx = parseInt(chip.dataset.index);
                if (selectedWords.includes(idx)) {
                    selectedWords = selectedWords.filter(s => s !== idx);
                } else {
                    selectedWords.push(idx);
                }
                renderWordChips();
            });
        });
    }

    // ========== 句子生成 ==========
    function handleGenerate() {
        const words = Storage.getWords();
        if (words.length === 0) {
            alert('请先添加英语单词');
            return;
        }
        const mode = document.getElementById('sentence-mode').value;
        let selected;

        if (mode === 'all') {
            if (words.length > 5) {
                alert('单词过多（最多5个），请减少单词数量或使用其他模式');
                return;
            }
            selected = words.map((w, i) => ({ ...w, _idx: i }));
        } else if (mode === 'manual') {
            selected = selectedWords.map(i => ({ ...words[i], _idx: i }));
            if (selected.length === 0) {
                alert('请至少选择一个单词');
                return;
            }
            if (selected.length > 5) {
                alert('最多选择5个单词');
                return;
            }
        } else {
            const count = Math.min(3, words.length);
            const indices = [];
            const pool = [...Array(words.length).keys()];
            for (let i = 0; i < count; i++) {
                const r = Math.floor(Math.random() * pool.length);
                indices.push(pool.splice(r, 1)[0]);
            }
            selected = indices.map(i => ({ ...words[i], _idx: i }));
        }

        currentSentence = generateSentence(selected);

        // 显示英文，隐藏翻译
        document.getElementById('generated-sentence').textContent = currentSentence.en;
        document.getElementById('generated-translation').textContent = currentSentence.zh;
        document.getElementById('generated-translation').classList.add('hidden');
        document.getElementById('sentence-output').classList.remove('hidden');
        document.getElementById('btn-stop-speak').classList.add('hidden');
    }

    // ========== 朗读 (SpeechSynthesis) ==========
    function handleSpeak() {
        if (!currentSentence.en) return;

        window.speechSynthesis.cancel();

        // 朗读前确保只显示英文
        document.getElementById('generated-translation').classList.add('hidden');

        const utterance = new SpeechSynthesisUtterance(currentSentence.en);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1;

        document.getElementById('btn-speak').classList.add('hidden');
        document.getElementById('btn-stop-speak').classList.remove('hidden');

        utterance.onend = () => {
            document.getElementById('btn-stop-speak').classList.add('hidden');
            document.getElementById('btn-speak').classList.remove('hidden');
        };

        utterance.onerror = () => {
            document.getElementById('btn-stop-speak').classList.add('hidden');
            document.getElementById('btn-speak').classList.remove('hidden');
        };

        window.speechSynthesis.speak(utterance);
    }

    function handleStopSpeak() {
        window.speechSynthesis.cancel();
        document.getElementById('btn-stop-speak').classList.add('hidden');
        document.getElementById('btn-speak').classList.remove('hidden');
    }

    // ========== 翻译显示 ==========
    function handleShowTranslation() {
        document.getElementById('generated-translation').classList.remove('hidden');
    }

    // ========== 事件绑定 ==========
    function init() {
        document.getElementById('btn-add-word').addEventListener('click', () => {
            const wordInput = document.getElementById('eng-word');
            const meaningInput = document.getElementById('eng-meaning');
            const word = wordInput.value.trim();
            const meaning = meaningInput.value.trim();

            if (!word || !meaning) { alert('请输入单词和释义'); return; }
            if (!/^[a-zA-Z\s\-']+$/.test(word)) { alert('单词只能包含英文字母'); return; }

            const ok = Storage.addWord(word, meaning);
            if (!ok) { alert('该单词已存在'); return; }

            wordInput.value = '';
            meaningInput.value = '';
            renderWordList();
            renderWordChips();
            wordInput.focus();
        });

        document.getElementById('btn-clear-words').addEventListener('click', () => {
            if (!confirm('确定清空所有单词？')) return;
            Storage.clearWords();
            renderWordList();
            renderWordChips();
        });

        document.getElementById('sentence-mode').addEventListener('change', (e) => {
            const manualDiv = document.getElementById('manual-word-select');
            if (e.target.value === 'manual') {
                manualDiv.classList.remove('hidden');
                selectedWords = [];
                renderWordChips();
            } else {
                manualDiv.classList.add('hidden');
            }
        });

        document.getElementById('btn-generate-sentence').addEventListener('click', handleGenerate);
        document.getElementById('btn-speak').addEventListener('click', handleSpeak);
        document.getElementById('btn-show-translation').addEventListener('click', handleShowTranslation);
        document.getElementById('btn-stop-speak').addEventListener('click', handleStopSpeak);

        renderWordList();
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { init, renderWordList, renderWordChips };
})();
